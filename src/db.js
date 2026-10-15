import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import {requestedKeywords} from './moderation.js';

export const defaults = Object.freeze({verification:true,timeoutSeconds:60,welcomeEnabled:true,welcomeText:'欢迎 {name} 加入 {group}！',failureText:'{name} 未通过验证，已被移出群组。',moderation:true,blockLinks:true,builtinRules:true,exemptAdmins:true,adRules:{},keywords:requestedKeywords,repeatLimit:4,repeatSeconds:30,muteSeconds:300,action:'mute',warningText:'{name} 触犯“{rule}”规则，已处理。',noticeDeleteSeconds:60,statsDays:90,logDays:30});
export function openDatabase(file) {
  if(file!==':memory:')mkdirSync(dirname(file),{recursive:true,mode:0o700});
  const db=new DatabaseSync(file);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;
  DROP TABLE IF EXISTS operators;
  CREATE TABLE IF NOT EXISTS state(key TEXT PRIMARY KEY,value TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS groups(id TEXT PRIMARY KEY,title TEXT NOT NULL,username TEXT,active INTEGER NOT NULL DEFAULT 1,settings TEXT NOT NULL,muted INTEGER NOT NULL DEFAULT 0,permissions TEXT,updated_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS members(group_id TEXT NOT NULL,user_id TEXT NOT NULL,name TEXT NOT NULL,username TEXT,bot INTEGER DEFAULT 0,last_seen INTEGER NOT NULL,status TEXT DEFAULT 'member',PRIMARY KEY(group_id,user_id));
  CREATE INDEX IF NOT EXISTS members_seen ON members(group_id,last_seen DESC);
  CREATE TABLE IF NOT EXISTS daily_stats(group_id TEXT NOT NULL,user_id TEXT NOT NULL,day TEXT NOT NULL,count INTEGER NOT NULL DEFAULT 0,last_seen INTEGER NOT NULL,PRIMARY KEY(group_id,user_id,day));
  CREATE INDEX IF NOT EXISTS stats_date ON daily_stats(group_id,day,count);
  CREATE TABLE IF NOT EXISTS counted_messages(group_id TEXT NOT NULL,message_id INTEGER NOT NULL,created_at INTEGER NOT NULL,PRIMARY KEY(group_id,message_id));
  CREATE TABLE IF NOT EXISTS blacklist(group_id TEXT NOT NULL,user_id TEXT NOT NULL,reason TEXT NOT NULL,created_at INTEGER NOT NULL,PRIMARY KEY(group_id,user_id));
  CREATE TABLE IF NOT EXISTS challenges(id TEXT PRIMARY KEY,group_id TEXT NOT NULL,user_id TEXT NOT NULL,name TEXT NOT NULL,question TEXT NOT NULL,answer INTEGER NOT NULL,choices TEXT NOT NULL,status TEXT NOT NULL,message_id INTEGER,expires_at INTEGER,created_at INTEGER NOT NULL);
  CREATE INDEX IF NOT EXISTS challenge_user ON challenges(group_id,user_id,created_at DESC);
  CREATE INDEX IF NOT EXISTS challenge_expiry ON challenges(status,expires_at);
  CREATE TABLE IF NOT EXISTS jobs(id INTEGER PRIMARY KEY AUTOINCREMENT,dedupe TEXT UNIQUE NOT NULL,kind TEXT NOT NULL,payload TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending',due_at INTEGER NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,error TEXT,created_at INTEGER NOT NULL);
  CREATE INDEX IF NOT EXISTS job_due ON jobs(status,due_at);
  CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY AUTOINCREMENT,group_id TEXT,actor TEXT,action TEXT NOT NULL,target TEXT,result TEXT NOT NULL,detail TEXT NOT NULL,created_at INTEGER NOT NULL);
  CREATE INDEX IF NOT EXISTS audit_group ON audit(group_id,id DESC);
  CREATE TABLE IF NOT EXISTS gates(hash TEXT PRIMARY KEY,generation TEXT NOT NULL,expires_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS login_keys(hash TEXT PRIMARY KEY,generation TEXT NOT NULL,expires_at INTEGER NOT NULL,used INTEGER NOT NULL DEFAULT 0);
  CREATE TABLE IF NOT EXISTS captchas(id TEXT PRIMARY KEY,hash TEXT NOT NULL,gate TEXT NOT NULL,expires_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS sessions(hash TEXT PRIMARY KEY,gate TEXT NOT NULL,generation TEXT NOT NULL,csrf_hash TEXT NOT NULL,csrf TEXT NOT NULL,created_at INTEGER NOT NULL,last_seen INTEGER NOT NULL,expires_at INTEGER NOT NULL,ua TEXT,revoked INTEGER NOT NULL DEFAULT 0);
  CREATE TABLE IF NOT EXISTS pending_inputs(user_id TEXT PRIMARY KEY,kind TEXT NOT NULL,group_id TEXT,payload TEXT NOT NULL DEFAULT '{}',expires_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS panels(token TEXT PRIMARY KEY,user_id TEXT NOT NULL,group_id TEXT,action TEXT NOT NULL,payload TEXT NOT NULL,expires_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS processed_updates(id INTEGER PRIMARY KEY,created_at INTEGER NOT NULL);
  `);
  if(!getState(db,'moderation_catalog_v1'))transaction(db,()=>{for(const row of db.prepare('SELECT id,settings FROM groups').all()){const s=JSON.parse(row.settings);db.prepare('UPDATE groups SET settings=? WHERE id=?').run(JSON.stringify({...s,builtinRules:s.builtinRules??true,exemptAdmins:s.exemptAdmins??true,keywords:[...new Set([...(s.keywords||[]),...requestedKeywords])]}),row.id);}setState(db,'moderation_catalog_v1','1');});
  db.exec("UPDATE jobs SET status='pending' WHERE status='running'");
  return db;
}
export function transaction(db,fn){db.exec('BEGIN IMMEDIATE');try{const value=fn();db.exec('COMMIT');return value;}catch(e){db.exec('ROLLBACK');throw e;}}
export function getState(db,key,fallback=''){return db.prepare('SELECT value FROM state WHERE key=?').get(key)?.value??fallback;}
export function setState(db,key,value){db.prepare('INSERT INTO state VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(key,String(value));}
export function settings(row){return {...defaults,...JSON.parse(row?.settings??'{}')};}
export function audit(db,actor,action,group,target,result,detail=''){db.prepare('INSERT INTO audit(group_id,actor,action,target,result,detail,created_at) VALUES(?,?,?,?,?,?,?)').run(group??null,actor??null,action,target??null,result,String(detail).slice(0,500),Date.now());}
export function enqueue(db,key,kind,payload,due=Date.now()){return db.prepare('INSERT OR IGNORE INTO jobs(dedupe,kind,payload,due_at,created_at) VALUES(?,?,?,?,?)').run(key,kind,JSON.stringify(payload),due,Date.now());}
export function groupRows(db){return db.prepare('SELECT * FROM groups ORDER BY active DESC,title').all().map(g=>({...g,settings:settings(g)}));}
export function dayKey(ms=Date.now()){return new Date(ms+8*3600000).toISOString().slice(0,10);}
export function countMessage(db,group,user,messageId,ms=Date.now()){
 return transaction(db,()=>{const r=db.prepare('INSERT OR IGNORE INTO counted_messages VALUES(?,?,?)').run(group,messageId,ms);if(!r.changes)return false;db.prepare('INSERT INTO daily_stats VALUES(?,?,?,1,?) ON CONFLICT(group_id,user_id,day) DO UPDATE SET count=count+1,last_seen=excluded.last_seen').run(group,user,dayKey(ms),ms);return true;});
}
export function stats(db,group,days=7,{limit=100,offset=0}={}){const since=dayKey(Date.now()-(days-1)*86400000);return db.prepare('SELECT s.user_id,m.name,m.username,sum(s.count) AS count,max(s.last_seen) AS last_seen FROM daily_stats s LEFT JOIN members m ON m.group_id=s.group_id AND m.user_id=s.user_id WHERE s.group_id=? AND s.day>=? GROUP BY s.user_id ORDER BY count DESC,s.user_id LIMIT ? OFFSET ?').all(group,since,limit,offset);}
