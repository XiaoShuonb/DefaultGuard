import {createServer} from 'node:http';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {cookies,cookie,equal,hash} from './security.js';
import {audit,getState} from './db.js';
import {builtinCatalog} from './moderation.js';

const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.woff2':'font/woff2'};
const response=(res,data,status=200)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify({code:status,msg:status===200?'success':String(data?.error||'请求失败'),data}));};
async function body(req){let n=0,parts=[];for await(const buf of req){n+=buf.length;if(n>32768)throw new Error('请求过大');parts.push(buf);}const value=JSON.parse(Buffer.concat(parts).toString()||'{}');if(!value||Array.isArray(value)||typeof value!=='object')throw new Error('请求格式错误');return value;}
export function createWebServer(db,config,auth,service){
 const admin=()=>({id:1,username:'OWNER',role:'super',permissions:['group:view','group:update','verification:view','moderation:view','stats:view','members:view','audit:view','bot:view']});
 const redirect=res=>{res.writeHead(303,{Location:config.redirect});res.end();};
 const denied=res=>{res.writeHead(403);res.end();};
 const server=createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','DENY');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'; object-src 'none'");
  try{
   if(!req.url||req.url.length>2048)return redirect(res);
   const url=new URL(req.url,'http://localhost');const path=url.pathname;
   if(path==='/internal/health'&&req.headers['x-health-secret']===config.healthSecret&&['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress))return response(res,{status:'ready',database:db.prepare('SELECT 1 ok').get().ok,uptime:Math.floor(process.uptime())});
   const ip=req.headers['x-real-ip']||req.socket.remoteAddress;
   const c=cookies(req);
   if(path.startsWith('/DefaultKey=')){
    if(req.method!=='GET'||url.search||!auth.limit(`entry:${ip}`,20))return redirect(res);
    const accepted=auth.acceptEntry(path.slice('/DefaultKey='.length));if(!accepted)return redirect(res);
    res.setHeader('Set-Cookie',[cookie('guard_gate',accepted.raw,(accepted.expires-Date.now())/1000,config.secureCookie),cookie('guard_session','',0,config.secureCookie)]);res.writeHead(303,{Location:'/'});res.end();return;
   }
   const gate=auth.gate(c.guard_gate);if(!gate)return redirect(res);
   if(!['GET','POST','PUT','PATCH','DELETE'].includes(req.method))return redirect(res);
   if(path.startsWith('/api/')){
    if(req.method!=='GET'&&req.headers.origin!==config.origin)return denied(res);
    if(path==='/api/auth/captcha'&&req.method==='GET'){if(!auth.limit(`captcha:${gate.hash}`,20))return denied(res);return response(res,auth.challenge(gate));}
    if(path==='/api/auth/login'&&req.method==='POST'){
     if(!auth.limit(`login:${ip}`,10,60000)||!auth.limit(`login-gate:${gate.hash}`,10,60000))return denied(res);
     const b=await body(req),s=auth.login(gate,b,String(req.headers['user-agent']||''));if(!s){audit(db,config.owner,'login',null,null,'failed','凭证校验失败');return denied(res);}res.setHeader('Set-Cookie',cookie('guard_session',s.raw,(s.expires-Date.now())/1000,config.secureCookie));audit(db,config.owner,'login',null,null,'ok');return response(res,{csrfToken:s.csrf,admin:admin()});
    }
    if(path==='/api/system/branding'&&req.method==='GET')return response(res,{siteName:'DefaultGuard',siteFavicon:'/favicon.ico',avatarPath:null,watermarkEnabled:false,watermarkText:'',updatedAt:null});
    const session=auth.session(c.guard_session,gate);if(!session)return response(res,{error:'登录已过期，请从 Telegram 获取新密钥'},401);
    if(req.method!=='GET'&&!equal(hash(req.headers['x-csrf-token']||''),session.csrf_hash))return denied(res);
    if(path==='/api/auth/me'&&req.method==='GET')return response(res,{admin:admin()});
    if(path==='/api/auth/csrf'&&req.method==='GET')return response(res,{csrfToken:session.csrf});
    if(path==='/api/auth/logout'&&req.method==='POST'){db.prepare('UPDATE sessions SET revoked=1 WHERE hash=?').run(session.hash);res.setHeader('Set-Cookie',cookie('guard_session','',0,config.secureCookie));return response(res,{ok:true});}
    if(path==='/api/moderation/catalog'&&req.method==='GET')return response(res,builtinCatalog);
    if(path==='/api/overview'&&req.method==='GET')return response(res,service.overview());
    if(path==='/api/groups'&&req.method==='GET')return response(res,service.groups());
    if(path==='/api/challenges'&&req.method==='GET')return response(res,db.prepare('SELECT id,group_id,user_id,name,question,status,created_at,expires_at FROM challenges ORDER BY created_at DESC LIMIT 100').all());
    if(path==='/api/audit'&&req.method==='GET'){const group=url.searchParams.get('group');return response(res,group?db.prepare('SELECT * FROM audit WHERE group_id=? ORDER BY id DESC LIMIT 100').all(group):db.prepare('SELECT * FROM audit ORDER BY id DESC LIMIT 100').all());}
    if(path==='/api/security'&&req.method==='GET')return response(res,{owner:config.owner,origin:config.origin,entryExpires:Number(getState(db,'entry_expires','0')),entryTtl:config.entryTtl,sessions:db.prepare('SELECT rowid AS id,ua,created_at,last_seen,expires_at,revoked FROM sessions ORDER BY created_at DESC LIMIT 50').all().map(s=>({...s,current:s.id===db.prepare('SELECT rowid id FROM sessions WHERE hash=?').get(session.hash).id}))});
    if(path==='/api/security/revoke'&&req.method==='POST'){const b=await body(req);if(b.all)db.exec('UPDATE sessions SET revoked=1');else if(Number.isSafeInteger(b.id))db.prepare('UPDATE sessions SET revoked=1 WHERE rowid=?').run(b.id);else throw new Error('会话参数错误');return response(res,{ok:true});}
    const match=/^\/api\/groups\/(-?\d{1,20})\/(settings|members|blacklist|stats|action)$/.exec(path);
    if(match){const id=match[1],kind=match[2];if(!service.group(id))return response(res,{error:'群组不存在'},404);
     if(kind==='settings'&&req.method==='PUT')return response(res,service.updateSettings(config.owner,id,await body(req)));
     if(kind==='members'&&req.method==='GET'){const page=Number(url.searchParams.get('page')||0);if(!Number.isInteger(page)||page<0||page>100000)throw new Error('分页参数错误');return response(res,service.members(id,page));}
     if(kind==='blacklist'&&req.method==='GET')return response(res,service.blacklist(id));
     if(kind==='stats'&&req.method==='GET'){const days=Number(url.searchParams.get('days')||1);if(!url.searchParams.has('page'))return response(res,service.activity(id,days));const page=Number(url.searchParams.get('page')),rows=service.activity(id,days,page),totals=service.activityTotals(id,days);return response(res,{rows,...totals,page,pages:Math.max(1,Math.ceil(totals.people/20))});}
     if(kind==='action'&&req.method==='POST'){const b=await body(req);return response(res,service.queueAction(config.owner,id,b.kind,b.userId));}
    }
    return response(res,{error:'接口不存在'},404);
   }
   if(req.method!=='GET')return redirect(res);
   const dir=resolve(config.webDir),relative=path==='/'?'index.html':path.slice(1);
   if(path!=='/'&&!/^\/(?:assets\/[A-Za-z0-9_.-]+|favicon\.ico|theme-init\.js)$/.test(path))return redirect(res);
   const file=resolve(dir,relative);if(!file.startsWith(dir+'/')||!existsSync(file))return redirect(res);
   res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(readFileSync(file));
  }catch(e){if(!res.headersSent)response(res,{error:e.message||'请求错误'},422);else res.end();}
 });server.requestTimeout=15000;server.headersTimeout=10000;server.maxHeadersCount=40;return server;
}
