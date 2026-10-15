// Chinese shortcuts are addressed explicitly, except the public group ranking query.
export function parseShortcut(input,username){
 const body=String(input||'').trim();
 if(body==='活跃排行')return {kind:'stats'};
 if(body==='解除禁言')return {kind:'unmute_member'};
 const individualMute=/^禁言(?:\s*(\d{1,4})\s*(分钟|小时|天))?$/.exec(body);
 if(individualMute){
  if(!individualMute[1])return {kind:'mute_member',durationMinutes:null};
  const minutes=Number(individualMute[1])*{分钟:1,小时:60,天:1440}[individualMute[2]];
  return minutes>=1&&minutes<=525600?{kind:'mute_member',durationMinutes:minutes}:{error:'禁言时间范围为 1 分钟至 365 天。'};
 }
 const m=/^@([A-Za-z0-9_]+)\s*(封禁|开群|关群|活跃排行)([\s\S]*)$/.exec(body);
 if(!m||!username||m[1].toLowerCase()!==username.toLowerCase())return null;
 const arg=m[3].trim();
 if(m[2]==='封禁')return /^@[A-Za-z0-9_]{5,32}$|^\d{1,16}$|^$/.test(arg)?{kind:'ban',target:arg}:{error:'封禁格式：@机器人 封禁 @用户名；也可引用该成员的消息发送 @机器人 封禁。'};
 if(arg)return {error:'指令后请勿附加其他文字。'};
 return {kind:{开群:'unmute_all',关群:'mute_all',活跃排行:'stats'}[m[2]]};
}
