import {randomBytes,createHash,timingSafeEqual,randomInt} from 'node:crypto';
import {deflateSync} from 'node:zlib';
import {getState,setState,transaction,audit} from './db.js';
export const token=()=>randomBytes(32).toString('base64url');
export const hash=s=>createHash('sha256').update(String(s)).digest('hex');
export const equal=(a,b)=>{const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&timingSafeEqual(x,y);};
export function cookies(req){const result={};for(const pair of String(req.headers.cookie||'').split(';')){const p=pair.indexOf('=');if(p<0)continue;const k=pair.slice(0,p).trim();if(k in result)return {};try{result[k]=decodeURIComponent(pair.slice(p+1));}catch{return {};}}return result;}
export function cookie(name,value,seconds,secure=true){return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=${name==='guard_gate'?'Lax':'Strict'}; Max-Age=${Math.max(0,Math.floor(seconds))}${secure?'; Secure':''}`;}
export class Auth {
 constructor(db,config){this.db=db;this.config=config;this.rates=new Map();}
 limit(key,limit=15,window=60000){const now=Date.now();if(this.rates.size>10000){for(const [k,v] of this.rates)if(v.until<now)this.rates.delete(k);if(this.rates.size>10000)return false;}let r=this.rates.get(key);if(!r||r.until<now){r={count:0,until:now+window};this.rates.set(key,r);}return ++r.count<=limit;}
 issueEntry(){const raw=token(),generation=token(),expires=Date.now()+this.config.entryTtl*1000;transaction(this.db,()=>{setState(this.db,'entry_hash',hash(raw));setState(this.db,'entry_generation',generation);setState(this.db,'entry_expires',expires);this.db.exec('DELETE FROM gates; DELETE FROM login_keys; DELETE FROM captchas; UPDATE sessions SET revoked=1');});audit(this.db,this.config.owner,'entry_rotated',null,null,'ok');return {raw,expires,url:`${this.config.origin}/DefaultKey=${raw}`};}
 acceptEntry(raw){if(!/^[A-Za-z0-9_-]{43}$/.test(raw)||!equal(hash(raw),getState(this.db,'entry_hash'))||Number(getState(this.db,'entry_expires','0'))<=Date.now())return null;const rawGate=token(),expires=Number(getState(this.db,'entry_expires'));this.db.prepare('INSERT INTO gates VALUES(?,?,?)').run(hash(rawGate),getState(this.db,'entry_generation'),expires);return {raw:rawGate,expires};}
 gate(raw){if(typeof raw!=='string'||raw.length!==43)return null;const g=this.db.prepare('SELECT * FROM gates WHERE hash=? AND expires_at>?').get(hash(raw),Date.now());return g&&g.generation===getState(this.db,'entry_generation')?g:null;}
 issueLogin(){const generation=getState(this.db,'entry_generation');if(!generation||Number(getState(this.db,'entry_expires','0'))<=Date.now())throw new Error('请先生成后台入口');const raw=token(),expires=Date.now()+this.config.loginTtl*1000;transaction(this.db,()=>{this.db.exec('DELETE FROM login_keys');this.db.prepare('INSERT INTO login_keys VALUES(?,?,?,0)').run(hash(raw),generation,expires);});return {raw,expires};}
 challenge(gate){const code=String(randomInt(1000,10000)),id=token();this.db.prepare('DELETE FROM captchas WHERE gate=? OR expires_at<?').run(gate.hash,Date.now());this.db.prepare('INSERT INTO captchas VALUES(?,?,?,?)').run(id,hash(code),gate.hash,Date.now()+120000);return {captchaId:id,image:`data:image/png;base64,${captchaPng(code).toString('base64')}`,expiresIn:120};}
 login(gate,body,ua=''){
  return transaction(this.db,()=>{
   const cap=this.db.prepare('SELECT * FROM captchas WHERE id=?').get(String(body.captchaId||''));
   if(cap)this.db.prepare('DELETE FROM captchas WHERE id=?').run(cap.id);
   if(!cap||cap.gate!==gate.hash||cap.expires_at<=Date.now()||!equal(cap.hash,hash(body.captchaCode||'')))return null;
   const key=this.db.prepare('SELECT * FROM login_keys WHERE hash=?').get(hash(body.key||body.password||''));
   if(!key||key.used||key.expires_at<=Date.now()||key.generation!==gate.generation)return null;
   const r=this.db.prepare('UPDATE login_keys SET used=1 WHERE hash=? AND used=0').run(key.hash);if(r.changes!==1)return null;
   const raw=token(),csrf=token(),now=Date.now();this.db.prepare('INSERT INTO sessions VALUES(?,?,?,?,?,?,?,?,?,0)').run(hash(raw),gate.hash,gate.generation,hash(csrf),csrf,now,now,Math.min(now+this.config.sessionTtl*1000,gate.expires_at),ua.slice(0,250));
   return {raw,csrf,expires:Math.min(now+this.config.sessionTtl*1000,gate.expires_at)};
  });
 }
 session(raw,gate){if(typeof raw!=='string'||raw.length!==43)return null;const s=this.db.prepare('SELECT * FROM sessions WHERE hash=? AND revoked=0').get(hash(raw));if(!s||s.gate!==gate.hash||s.generation!==gate.generation||s.expires_at<=Date.now()||s.last_seen+this.config.sessionIdle*1000<=Date.now())return null;this.db.prepare('UPDATE sessions SET last_seen=? WHERE hash=?').run(Date.now(),s.hash);return s;}
}
const font={'0':['111','101','101','101','111'],'1':['010','110','010','010','111'],'2':['111','001','111','100','111'],'3':['111','001','111','001','111'],'4':['101','101','111','001','001'],'5':['111','100','111','001','111'],'6':['111','100','111','101','111'],'7':['111','001','010','010','010'],'8':['111','101','111','101','111'],'9':['111','101','111','001','111']};
function crc32(buf){let c=0xffffffff;for(const byte of buf){c^=byte;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
function chunk(type,data){const name=Buffer.from(type),n=Buffer.alloc(4),crc=Buffer.alloc(4);n.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([name,data])));return Buffer.concat([n,name,data,crc]);}
export function captchaPng(code){const w=156,h=56,rgba=Buffer.alloc(h*(w*3+1),245);for(let y=0;y<h;y++)rgba[y*(w*3+1)]=0;const dot=(x,y,r,g,b)=>{if(x<0||x>=w||y<0||y>=h)return;const i=y*(w*3+1)+1+x*3;rgba[i]=r;rgba[i+1]=g;rgba[i+2]=b;};for(let i=0;i<500;i++)dot(randomInt(w),randomInt(h),160,175,195);[...code].forEach((d,i)=>{const ox=14+i*34,oy=randomInt(9,17);font[d].forEach((row,y)=>[...row].forEach((v,x)=>{if(v==='1')for(let a=0;a<6;a++)for(let b=0;b<6;b++)dot(ox+x*6+a,oy+y*6+b,42,71,106);}));});const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(w,0);ihdr.writeUInt32BE(h,4);ihdr[8]=8;ihdr[9]=2;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',deflateSync(rgba)),chunk('IEND',Buffer.alloc(0))]);}
