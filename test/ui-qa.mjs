import {createRequire} from 'node:module';
import {mkdtempSync,mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openDatabase} from '../src/db.js';
import {Auth,hash} from '../src/security.js';
import {Service} from '../src/service.js';
import {createWebServer} from '../src/server.js';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const db=openDatabase(':memory:');
const cfg={owner:'123456789',origin:'http://127.0.0.1:18190',redirect:'https://www.baidu.com/',entryTtl:21600,loginTtl:180,sessionTtl:28800,sessionIdle:1800,secureCookie:false,webDir:join(process.cwd(),'web/dist'),healthSecret:'qa-only'};
const auth=new Auth(db,cfg),service=new Service(db,cfg),server=createWebServer(db,cfg,auth,service);
db.prepare('INSERT INTO groups(id,title,settings,updated_at) VALUES(?,?,?,?)').run('-100123','产品交流测试群','{}',Date.now());
await new Promise(r=>server.listen(18190,'127.0.0.1',r));
let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:960}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 const e=auth.issueEntry();await page.goto(e.url);await page.waitForSelector('input[type=password]');await page.waitForTimeout(800);
 const cap=db.prepare('SELECT id FROM captchas ORDER BY expires_at DESC LIMIT 1').get();db.prepare('UPDATE captchas SET hash=? WHERE id=?').run(hash('1234'),cap.id);
 const k=auth.issueLogin();await page.locator('input[type=password]').fill(k.raw);await page.locator('input[inputmode=numeric]').fill('1234');await page.getByRole('button',{name:'登录',exact:true}).click();
 await page.getByText('群组运营概览',{exact:true}).waitFor({timeout:15000});await page.waitForTimeout(500);
 mkdirSync('/tmp/defaultguard-qa',{recursive:true});await page.screenshot({path:'/tmp/defaultguard-qa/desktop.png',fullPage:true});
 for(const [path,title] of [['/platform/groups','群组管理'],['/platform/verification','新人验证'],['/platform/moderation','广告规则'],['/platform/activity','活跃统计'],['/platform/members','成员与黑名单'],['/system/security','登录与安全']]){await page.goto(cfg.origin+'/#'+path);await page.locator('h2').filter({hasText:title}).waitFor({timeout:15000});await page.waitForTimeout(300);}
 await page.goto(cfg.origin+'/#/platform/moderation');await page.locator('h2').filter({hasText:'广告规则'}).waitFor();const contact=page.locator('.el-table__row').filter({hasText:'电话与邮箱审核'});await contact.locator('.el-switch').click();await page.getByRole('button',{name:'保存规则',exact:true}).first().click();await page.getByText('已保存',{exact:true}).waitFor();const saved=JSON.parse(db.prepare('SELECT settings FROM groups WHERE id=?').get('-100123').settings);if(saved.adRules.contacts.enabled!==false)throw new Error('classification save failed');
 await page.setViewportSize({width:390,height:844});await page.goto(cfg.origin+'/#/platform/moderation');await page.locator('h2').filter({hasText:'广告规则'}).waitFor();await page.waitForTimeout(500);await page.screenshot({path:'/tmp/defaultguard-qa/mobile.png',fullPage:true});
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2);
 console.log(JSON.stringify({errors,overflow,screenshots:['desktop.png','mobile.png']}));if(errors.length||overflow)process.exitCode=1;
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));db.close();}
