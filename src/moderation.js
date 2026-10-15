// Fixed, bounded rules. No user-supplied regular expressions are executed.
export const requestedKeywords=['换源码','互换','出售'];
const keywords=(id,name,words)=>({id,name,words:words.split(','),action:'inherit'});
export const builtinKeywordRules=[
 keywords('remote_ads','远控工具推广','杀鱼远控,杀鱼远控系统,杀鱼系统,远控系统出售,远控软件出售,远控系统租用,远控软件租用,全新国内外远控,ADB远控出售,远控脚本出售'),
 keywords('source_trade','源码与软件交易','换源码,互换源码,源码互换,源码出售,出售源码,售卖源码,收购源码,源码交易,源码定制,源码搭建,低价源码,全套源码,成品源码,脚本出售,出售脚本,出售程序,软件出售,源码出租,源码代搭,低价搭建'),
 keywords('promotion','推广引流','加群,拉群,进群,入群,群链接,频道链接,私聊我,私信我,加我,联系我,联系客服,点击链接,点链接,扫码进群,扫码领取,长按识别,下载APP,注册送,开户注册,招商代理,招代理,广告位,商务合作,合作推广,推广引流,进频道,欢迎进群,免费领取,领取福利,限时福利,关注频道,主页频道查看,主页查看详情,详情见主页,详情看主页,详情在主页,点击主页,查看主页,前往主页,主页咨询,主页下单,频道查看详情,详情见频道,详情看频道,点击频道,加入频道,频道咨询,频道下单'),
 keywords('gambling','博彩与赌博推广','博彩,下注,赌场,棋牌,彩票,时时彩,六合彩,娱乐城,体育盘,盘口,包赢,稳赢,稳赚,杀猪盘,内幕群,带单,真人视讯,百家乐,龙虎斗,反水,投注,投注送彩金,注册送金,首充送,上分下分,赌城'),
 keywords('tasks','刷单兼职与返利','刷单,点赞兼职,打字兼职,日结兼职,在家兼职,兼职招聘,任务返利,投资返利,充值返利,返佣,躺赚,零成本赚钱,无需经验日结,手机兼职,垫付任务,做任务赚钱,点赞赚钱,刷信誉,补单兼职,抖音点赞兼职,小红书点赞,抢单赚钱,返利群,先充值后返,任务佣金,入职押金'),
 keywords('investment','虚拟币与资金盘推广','资金盘,跑分,代收款,代付款,洗钱,黑U,白U,代充,代购U,低价U,收U,出U,承兑,场外交易,搬砖套利,保证盈利,保本收益,保本保息,稳赚不赔,日收益,月收益,高额返利,翻倍收益,投资翻倍,空投领取,连接钱包领取,质押返利,量化托管,托管收益,充值解冻'),
 keywords('phishing','假冒客服与钓鱼','助记词验证,提交助记词,提供助记词,发送助记词,导入助记词,私钥验证,提交私钥,提供私钥,发送私钥,官方客服私聊,账号异常请联系,账户异常请联系,账户冻结请联系,账号冻结请联系,安全验证链接,钱包升级验证,钱包同步验证,授权领取空投,点击验证账户,缴纳解冻费'),
 keywords('accounts','账号与数据交易','账号出售,出售账号,卖号,售号,批量账号,批发账号,账号批发,成品号出售,实名号出售,邮箱出售,出售邮箱,手机号出售,数据出售,出售数据,精准数据,客户资料出售,客户数据出售,身份证出售,银行卡出售,实名账户出售,老号批发,粉丝号出售'),
 keywords('adult_promotion','色情与招嫖广告','招嫖,约炮,裸聊,同城约,同城上门,外围预约,外围服务,成人直播,成人视频出售,色情资源出售,福利姬,看片加群,看片私聊,成人视频群,成人资源群,上门服务预约'),
 keywords('grey_services','灰产与非法服务推广','接码平台,接码群,短信轰炸,轰炸服务,黑客接单,黑客服务,盗号服务,盗号接单,攻击接单,代实名,代认证,代过实名,代开账户,代开银行卡,洗白资金,跑分平台,跑分兼职,代收代付,偷渡服务,办假证'),
 keywords('marketing','垃圾营销与群发服务','群发广告,广告群发,群发推广,批量群发,爆粉,引流脚本,拉人头,买粉丝,粉丝出售,刷粉,刷量服务,涨粉服务,引流软件,群控软件,营销群控,群发软件,群发器,买卖群组,出售群组,出售频道,买卖频道,频道出租,广告招商')
];
const patternCatalog=[
 {id:'links',name:'外部推广链接',description:'Telegram URL / 隐藏文字链接、HTTP、www、t.me',action:'inherit'},
 {id:'disguised_links',name:'变形链接与短链接',description:'h t t p、t 点 me、[dot]、全角点、短网址和常见域名后缀',action:'inherit'},
 {id:'social',name:'社交账号导流',description:'微信、VX、QQ、电报联系方式及引导联系的 @用户名',action:'inherit'},
 {id:'contacts',name:'电话与邮箱审核',description:'电话及邮箱格式，默认仅记录，避免误禁普通交流',action:'record'},
 {id:'suspicious',name:'模糊营销组合审核',description:'低价/优惠/兼职/私聊等模糊词组合，默认仅记录',action:'record'},
 {id:'emoji_flood',name:'大量符号刷屏审核',description:'大量连续表情或符号，默认仅记录',action:'record'}
];
export const builtinCatalog=[...builtinKeywordRules.map(r=>({id:r.id,name:r.name,description:r.words.join('、'),action:r.action,count:r.words.length})),...patternCatalog];
export const ruleIds=new Set(builtinCatalog.map(r=>r.id));
const remoteWords=builtinKeywordRules.find(rule=>rule.id==='remote_ads').words;
const traditional={'換':'换','碼':'码','賣':'卖','購':'购','聯':'联','繫':'系','絡':'络','訊':'讯','廣':'广','告':'告','職':'职','傭':'佣','賺':'赚','錢':'钱','資':'资','產':'产','賬':'账','號':'号','組':'组','頻':'频','務':'务','軟':'软','體':'体','點':'点','擊':'击','領':'领','禮':'礼','費':'费','開':'开','戶':'户','驗':'验','證':'证','機':'机','與':'与','請':'请','網':'网','線':'线','詐':'诈','凍':'冻','結':'结','買':'买','門':'门','價':'价','遞':'递','無':'无','鎖':'锁','貴':'贵','幣':'币','陰':'阴','盤':'盘','遠':'远','魚':'鱼','連':'连','殺':'杀','強':'强','統':'统','詳':'详','頁':'页','進':'进','見':'见'};
export const normalizeAdText=s=>String(s??'').slice(0,4096).normalize('NFKC').replace(/[\p{Cf}\u034F\uFE00-\uFE0F]/gu,'').replace(/[換碼賣購聯繫絡訊廣職傭賺錢資產賬號組頻務軟體點擊領禮費開戶驗證機與請網線詐凍結買門價遞無鎖貴幣陰盤遠魚連殺強統詳頁進見]/g,c=>traditional[c]||c).toLowerCase();
const compact=s=>s.replace(/[\s\p{Z}\p{P}\p{S}]/gu,'');
function ruleResult(s,id){const rule=builtinCatalog.find(r=>r.id===id),override=s.adRules?.[id];if(override?.enabled===false)return null;const selected=override?.action??rule.action;return {rule:rule.name,ruleId:id,action:selected==='inherit'?s.action:selected};}
export function matchAd(s,body,entities=[]){
 const normalized=normalizeAdText(body),flat=compact(normalized);let recorded=null;
 const result=id=>{const r=ruleResult(s,id);if(r?.action==='record'){recorded??=r;return null;}return r;};
 // Classify specific remote-control promotion before generic keywords and links.
 if(s.builtinRules&&(remoteWords.some(word=>{const n=normalizeAdText(word);return normalized.includes(n)||flat.includes(compact(n));})||/(?:远控|adb连接)/i.test(flat)&&/(?:全新|最强|出售|售卖|租用|购买|代理|详情|主页|频道)/.test(flat)&&/(?:出售|售卖|租用|购买|代理|主页|频道|杀鱼)/.test(flat))){const r=result('remote_ads');if(r)return r;}
 const keyword=(s.keywords||[]).find(k=>{const n=normalizeAdText(k),c=compact(n);return n&&normalized.includes(n)||c.length>=2&&/\p{Script=Han}/u.test(n)&&flat.includes(c);});
 if(keyword)return {rule:`关键词：${keyword}`,ruleId:'custom',action:s.action};
 const directLink=entities.some(e=>['url','text_link'].includes(e.type))||/(?:https?:\/\/|www\.|t\.me\/|telegram\.me\/)/i.test(normalized);
 if(s.blockLinks&&directLink){const r=result('links');if(r)return r;}
 if(s.builtinRules){
  if(s.blockLinks&&!directLink){const linkText=normalized.replace(/\[\s*dot\s*\]|\(\s*dot\s*\)|\[\s*\.\s*\]|\(\s*\.\s*\)|【\s*点\s*】/gi,'.');if(/(?:h[\s._-]{0,5}t[\s._-]{0,5}t[\s._-]{0,5}p[\s._-]{0,5}s?[\s._-]{0,5}[:：]|(?:t|telegram)\s*[.。点]\s*(?:me|dog)|www\s*[.。点]|(?<![a-z0-9@._-])[a-z0-9-]{2,120}\s*[.。点]\s*(?:com|net|org|cn|cc|xyz|top|vip|shop|io|site|online|click|link|live|pro|fun|club|support|app|ly)\b)/i.test(linkText)){const r=result('disguised_links');if(r)return r;}}
  for(const rule of builtinKeywordRules)if(rule.id!=='remote_ads'&&rule.words.some(word=>{const n=normalizeAdText(word);return normalized.includes(n)||flat.includes(compact(n));})){const r=result(rule.id);if(r)return r;}
  if(/(?:微信|微\s*信|v\s*x|v\s*信|wechat|q\s*q|飞机|电报)\s*[:：号@]?\s*[a-z][a-z0-9_-]{4,80}|(?:微信|q\s*q)\s*[:：号]?\s*\d{5,15}|(?:联系|添加|私聊|私信|咨询|找我)[\s\S]{0,12}@[a-z0-9_]{5,32}/i.test(normalized)){const r=result('social');if(r)return r;}
  if(/(?:\+?86[- ]?)?1[3-9]\d{9}|[a-z0-9._%+-]{1,80}@[a-z0-9.-]{1,120}\.[a-z]{2,20}/i.test(normalized)){const r=result('contacts');if(r)return r;}
  if(/(?:低价|优惠|兼职|返利|赚钱|收益|私聊|私信|代理|招商|推广|接单)[\s\S]{0,30}(?:咨询|详情|了解|联系|下单|购买|报名|加入|扫码|领取)|(?:联系|扫码|咨询)[\s\S]{0,30}(?:低价|优惠|兼职|返利|代理|推广|接单)/.test(normalized)){const r=result('suspicious');if(r)return r;}
  const symbols=[...normalized].filter(c=>/[\p{S}]/u.test(c)).length;if(symbols>=24&&symbols/[...normalized].length>0.65){const r=result('emoji_flood');if(r)return r;}
 }
 return recorded;
}
