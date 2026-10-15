import {randomUUID} from 'node:crypto';
import {ruleIds} from './moderation.js';
import {defaults,settings,enqueue,audit,groupRows,stats} from './db.js';
export function validateSettings(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('配置格式错误');
 const out={};
 for(const [k,v] of Object.entries(input)){
  if(!(k in defaults))throw new Error(`未知设置字段：${k}`);
  if(typeof defaults[k]==='boolean'){if(typeof v!=='boolean')throw new Error(`${k} 应为开关`);out[k]=v;}
  else if(typeof defaults[k]==='number'){const max=k==='statsDays'||k==='logDays'?365:k==='repeatLimit'?50:k==='timeoutSeconds'?3600:86400;const min=k==='repeatLimit'?2:k==='noticeDeleteSeconds'?0:k==='muteSeconds'?30:1;if(!Number.isInteger(v)||v<min||v>max)throw new Error(`${k} 超出范围`);out[k]=v;}
  else if(k==='adRules'){if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).length>ruleIds.size)throw new Error('分类规则格式错误');out[k]={};for(const [id,r] of Object.entries(v)){if(!ruleIds.has(id)||!r||typeof r!=='object'||Array.isArray(r)||Object.keys(r).some(x=>!['enabled','action'].includes(x))||typeof r.enabled!=='boolean'||!['inherit','delete','mute','ban','record'].includes(r.action))throw new Error('分类规则设置错误');out[k][id]={enabled:r.enabled,action:r.action};}}
  else if(k==='keywords'){if(!Array.isArray(v)||v.length>100||v.some(x=>typeof x!=='string'||!x.trim()||x.length>100))throw new Error('关键词格式错误');out[k]=[...new Set(v.map(x=>x.trim()))];}
  else if(k==='action'){if(!['delete','mute','ban'].includes(v))throw new Error('处理动作错误');out[k]=v;}
  else{if(typeof v!=='string'||v.length>2000)throw new Error('文案过长');out[k]=v;}
 }
 return out;
}
export class Service {
 constructor(db,config){this.db=db;this.config=config;}
 group(id){return this.db.prepare('SELECT * FROM groups WHERE id=?').get(String(id));}
 permitted(actor,id,permission){return String(actor)===this.config.owner;}
 updateSettings(actor,id,input){if(!this.permitted(actor,id,'settings'))throw new Error('权限不足');const g=this.group(id);if(!g)throw new Error('群组不存在');const patch=validateSettings(input),s={...settings(g),...patch};this.db.prepare('UPDATE groups SET settings=?,updated_at=? WHERE id=?').run(JSON.stringify(s),Date.now(),id);audit(this.db,String(actor),'settings_update',id,null,'ok',Object.keys(patch).join(','));return s;}
 queueAction(actor,id,kind,user,context={}){if(!this.group(id))throw new Error('群组不存在');const perm=['mute_all','unmute_all','sync'].includes(kind)?'group':'members';if(!this.permitted(actor,id,perm))throw new Error('权限不足');if(!['mute_all','unmute_all','sync','ban','unban','mute_member','unmute_member'].includes(kind))throw new Error('未知操作');if(['ban','unban','mute_member','unmute_member'].includes(kind)&&(!/^\d{1,16}$/.test(String(user))||String(user)===this.config.owner))throw new Error('目标成员错误');if(kind==='mute_member'&&context.durationMinutes!==null&&context.durationMinutes!==undefined&&(!Number.isInteger(context.durationMinutes)||context.durationMinutes<1||context.durationMinutes>525600))throw new Error('禁言时间范围为 1 分钟至 365 天。');const key=randomUUID();enqueue(this.db,key,kind,{group:id,user:user?String(user):null,actor:String(actor),...(kind==='mute_member'?{durationMinutes:context.durationMinutes??null}:{}),...(Number.isInteger(context.sourceMessage)?{sourceMessage:context.sourceMessage}:{})});audit(this.db,String(actor),kind,id,user,'queued');return {queued:true,id:key};}
 overview(){return {groups:this.db.prepare('SELECT count(*) n FROM groups WHERE active=1').get().n,members:this.db.prepare('SELECT count(*) n FROM members WHERE bot=0').get().n,pending:this.db.prepare("SELECT count(*) n FROM challenges WHERE status IN ('preparing','pending','failing','passing')").get().n,blocked:this.db.prepare('SELECT count(*) n FROM blacklist').get().n,messages:this.db.prepare("SELECT coalesce(sum(count),0) n FROM daily_stats WHERE day=date('now','+8 hours')").get().n,uptime:Math.floor(process.uptime()),recent:this.db.prepare('SELECT * FROM audit ORDER BY id DESC LIMIT 12').all()};}
 members(id,page=0){return this.db.prepare('SELECT m.*,b.reason AS blocked_reason,coalesce((SELECT sum(count) FROM daily_stats s WHERE s.group_id=m.group_id AND s.user_id=m.user_id),0) AS count FROM members m LEFT JOIN blacklist b ON b.group_id=m.group_id AND b.user_id=m.user_id WHERE m.group_id=? ORDER BY m.last_seen DESC LIMIT 30 OFFSET ?').all(id,page*30);}
 blacklist(id){return this.db.prepare('SELECT b.*,m.name,m.username FROM blacklist b LEFT JOIN members m ON m.group_id=b.group_id AND m.user_id=b.user_id WHERE b.group_id=? ORDER BY b.created_at DESC LIMIT 100').all(id);}
 activityTotals(id,days=1){const since=new Date(Date.now()-(days-1)*86400000+8*3600000).toISOString().slice(0,10);return this.db.prepare('SELECT coalesce(sum(count),0) total,count(DISTINCT user_id) people FROM daily_stats WHERE group_id=? AND day>=?').get(id,since);}
 activity(id,days,page=null){if(![1,7,30].includes(days))throw new Error('统计范围错误');if(page!==null&&(!Number.isInteger(page)||page<0||page>100000))throw new Error('页码错误');return stats(this.db,id,days,page===null?{}:{limit:20,offset:page*20});}
 groups(){return groupRows(this.db);}
}
