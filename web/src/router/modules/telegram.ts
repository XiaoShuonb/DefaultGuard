import { AppRouteRecord } from '@/types/router'
export const telegramRoutes:AppRouteRecord={name:'TelegramPlatform',path:'/platform',component:'/index/index',meta:{title:'群管理',roles:['R_SUPER']},children:[
{path:'groups',name:'Groups',component:'/groups/index',meta:{title:'群组管理',icon:'ri:group-line',keepAlive:false}},
{path:'verification',name:'Verification',component:'/verification/index',meta:{title:'新人验证',icon:'ri:user-follow-line',keepAlive:false}},
{path:'moderation',name:'Moderation',component:'/moderation/index',meta:{title:'广告规则',icon:'ri:shield-check-line',keepAlive:false}},
{path:'activity',name:'Activity',component:'/activity/index',meta:{title:'活跃统计',icon:'ri:bar-chart-line',keepAlive:false}},
{path:'members',name:'Members',component:'/members/index',meta:{title:'成员与黑名单',icon:'ri:user-forbid-line',keepAlive:false}}
]}
