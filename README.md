# DefaultGuard

从 DefaultBot 精简的 Telegram 群管机器人，复用原 Vue 3 / Element Plus / Art Design Pro 后台布局、侧边栏、登录样式与通用组件。后端采用 Node.js 24 原生 HTTP、SQLite 和 Telegram Bot API；生产运行没有 npm 依赖。

## 保留功能

- 自动发现群组、欢迎消息。
- 数学题答案按钮验证：通过前限制发言，通过后欢迎；答错/超时移出。
- 验证题与失败提示自动清理；超时任务重启后恢复。
- 广告关键词、链接与重复刷屏拦截；删除、禁言或封禁。
- 按天累计成员消息、今日/7天/30天排行榜，显示群总数与发言人数，支持分页。
- 关群全群禁言；开群允许文字发言并保留原媒体权限。
- 永久封禁并清理该成员群内消息；确认后手动解封，按群隔离。
- 唯一 OWNER，只有配置的 Telegram 数字 ID 接收管理命令；后台仅 OWNER 登录。
- Telegram 与 Web 共用同一个数据库；操作排队并记录真实结果。

旧系统的记账、担保、汇率、负责人、群发和功能注册未纳入本项目。USDT 查询与双向机器人继续独立运行。

## 后台入口和登录

1. OWNER 私聊机器人发送 `/start`。
2. 点击“生成后台入口（6小时）”。系统生成 `/DefaultKey=随机值`，默认6小时有效。
3. 打开入口后，将密钥交换为 HttpOnly 浏览器通行 Cookie，再跳转到 `/`。
4. 在 Telegram 点击“获取登录密钥”，得到3分钟有效、单次使用的随机密钥。
5. 在网页输入登录密钥和图片验证码。

入口、登录密钥由32随机字节编码而成，数据库保存哈希。只有通过 Telegram 数字 ID 验证的 OWNER 私聊菜单可以生成。新入口会撤销旧入口、通行 Cookie 和全部会话。登录密钥生成会替换旧的待使用密钥。

入口 Cookie 是 HttpOnly / Secure / SameSite=Lax（支持从 Telegram 顶层跳转），登录会话是 HttpOnly / Secure / SameSite=Strict。所有写接口校验 Origin 与 CSRF；验证码短期、一次性且绑定入口 Cookie。会话空闲30分钟过期，最长8小时，并受入口6小时期限约束。

缺失/错误/过期入口和异常请求由 Nginx/应用返回到配置的外部地址。生产默认为百度。当前宝塔站点覆盖继承的 WAF URI 日志和响应钩子，入口鉴权与限流由本服务负责；其他站点保持原 WAF。保留 `/.well-known/acme-challenge/` 作为 TLS 证书续签通道，`/internal/` 对公网跳转。

这是 HTTP 反向代理层跳转。TLS 握手失败、断网等尚未形成 HTTP 请求的情况不会产生网页跳转。

入口访问日志关闭，错误日志避免记录密钥 URL；Referrer-Policy 为 no-referrer。持有有效入口仍需要独立登录密钥和验证码；转发登录密钥会转移这一次登录能力。

## 本地开发

```bash
cp .env.example .env
# 填写 OWNER_ID、BOT_TOKEN、PUBLIC_ORIGIN、HEALTH_SECRET。
# 本地 HTTP 调试必须显式设置 COOKIE_SECURE=false。
npm --prefix web ci
npm --prefix web run build
npm start
```

后端无需 `npm install`。网页依赖仅用于本地构建。

```bash
npm run check
npm test
npm --prefix web run typecheck
npm --prefix web run build
```

`test/ui-qa.mjs` 是可选浏览器 QA 脚本，使用隔离 SQLite 数据和临时凭据，不连接 Telegram；需另行安装 Playwright，必要时以 `CHROME_PATH` 指定 Chrome 路径。

## 部署

生产包包含后端源文件（Node 无编译步骤）、已经构建压缩且没有 source maps 的前端、systemd 和 Nginx 配置。运行目录：

```text
/opt/defaultguard/current          当前只读版本
/opt/defaultguard/releases/        版本目录
/etc/defaultguard.env             root:600 环境配置
/var/lib/defaultguard/guard.sqlite SQLite / WAL 文件
```

部署脚本面向宝塔 Debian 12、Node 24 环境。公开仓库的 `deploy/site.conf` 使用 `__DOMAIN__` 模板变量，安装时传入 `SITE_DOMAIN` 渲染；先创建宝塔站点和权限为 600 的 `/etc/defaultguard.env`，再编译前端并打包：

```bash
npm --prefix web ci
npm --prefix web run build
tar -czf DefaultGuard-production.tar.gz src deploy package.json web/dist web/LICENSE
sudo SITE_DOMAIN=guard.example.com bash deploy/install.sh "$(pwd)/DefaultGuard-production.tar.gz"
sudo systemctl status defaultguard --no-pager
```

把 `guard.example.com` 换成自己的已创建站点域名，并在环境文件中设置一致的 `PUBLIC_ORIGIN`。脚本校验归档与 Node 语法。失败时使用运行时临时文件恢复站点和服务，成功后仅保留当前运行版本，不保留备份；部署时保留现有数据库和环境配置。公开仓库不包含生产归档、线上密钥或数据库。

## 机器人权限与数据

推荐超级群，授予机器人删除消息、限制成员权限。群组收到入群/成员变化/消息事件后自动出现。成员列表只覆盖机器人识别过的成员；统计从启用后开始，默认不存完整聊天历史。默认 OWNER 和 Telegram 群管理员广告豁免；广告豁免不授予管理命令权限。其他成员的管理命令及私聊消息引用原消息回复“无权限”；其他成员点击管理按钮也拒绝并引用回复。新人验证答案按钮仍允许待验证本人操作。

验证倒计时从题目发送成功后开始。答错/超时使用60秒封禁移出，之后可重新加入；手动“踢出并拉黑”是持续封禁。禁言至少30秒，以避免 Telegram 将短于30秒的限制解释为无限期。

网络调用在数据库事务外执行；任务、去重记录和验证结果落库。网络失败会重试，永久 Telegram 错误写入操作记录。外部发送成功后本机立即崩溃仍存在重复通知窗口，操作记录与去重用于缩小此窗口。

数据库采用 WAL、FULL 同步和索引。大表按保留期限分批清理；当前部署方案不保留历史备份。

## 管理界面与群内快捷指令

管理菜单仅唯一 OWNER 私聊发送 /start 显示，群内不生成管理菜单或身份确认按钮。私聊按钮菜单在最后一次刷新后 10 分钟自动删除消息与按钮；到期任务写入 SQLite，重启后继续执行。群内管理指令仅接收 OWNER 个人身份，活跃排行允许已通过验证的群成员查询；匿名身份发送管理指令时提示关闭匿名后使用本人账号。新人验证答案按钮仍允许待验证本人操作。

```text
@DefaultGroupBot 封禁 @username
@DefaultGroupBot 关群
@DefaultGroupBot 开群
引用成员消息回复：禁言
引用成员消息回复：禁言 5分钟（也支持“2小时”“1天”）
引用成员消息回复：解除禁言
活跃排行
```

群成员直接发送“活跃排行”，或发送“@机器人 活跃排行”，即可收到无菜单的文字排行。成员查询每人 30 秒、每群 10 秒限一次；待验证成员暂不触发。按北京时间统计今日各成员消息数及总数，人数多时自动分成20人一条。排行只显示可点击的姓名，不在姓名后重复显示 @用户名；有用户名时链接到其主页，无用户名时使用 Telegram ID 资料链接，匿名管理员不生成资料链接。更新前采用旧统计口径，已有数据不重写。

单人禁言仅唯一管理员可用，必须引用该成员在本群的消息。直接回复“禁言”为永久禁言；写明 1 分钟至 365 天的时间才设置自动到期，例如“禁言 30分钟”。回复“解除禁言”移除单人限制；正在新人验证的成员保持验证流程。机器人需要 Telegram 超级群中的限制成员权限。

封禁前使用本群已识别用户名查数字 ID，再实时复核用户名、ID与管理员身份。未识别的用户名请引用成员消息发送 @DefaultGroupBot 封禁。封禁用 revoke_messages=true，不设 until_date；由Telegram清理该成员群内消息。手动黑名单解封不自动回群。待验证题同步取消，后续验证任务不恢复黑名单权限。

开群/关群仅控制普通成员发言，不影响入群或Telegram管理员发言。后台/私聊群状态刷新会读取Telegram真实权限；禁言任务完成后自动更新仍打开的私聊群菜单，不覆盖已切换到的其他页面。

## 扩展广告规则

默认17类，261条内置关键词（含“远控工具推广”、主页与频道引流话术），外加链接、联系方式、模糊营销和大量符号模式；原自定义关键词“换源码、互换、出售”保留且优先匹配。主页、频道单词本身不会触发拦截，只有“详情见主页”“频道下单”等引流组合才按推广处理。

- 推广引流、源码与软件交易、博彩赌博、刷单兼职。
- 虚拟币资金盘推广、假冒客服钓鱼、账号数据交易。
- 色情招嫖广告、灰产推广、群发与垃圾营销。
- URL与隐藏链接、变形域名短链接、微信/VX/QQ/电报导流。
- 电话邮箱、模糊营销组合与大量符号默认仅记录，不自动禁言。

处理全角字、常见繁体、零宽字符、词内空格与标点。关键词与分类规则独立：关闭某分类不取消手动添加的关键词。后台广告规则页和唯一管理员私聊菜单均可逐类开启/关闭，选择跟随群处置、仅记录、仅删除、删除禁言、删除封禁。管理员豁免与已有群规则开关保留。

仅记录只写规则与成员审计，不存完整消息。固定表达式不接收任意用户正则；消息匹配限制为4096字符。规则属于启发式拦截，不保证识别全部广告；发生误判时可关闭对应分类或改为仅记录。
