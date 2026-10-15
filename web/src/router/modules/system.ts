import { AppRouteRecord } from '@/types/router'
export const systemRoutes:AppRouteRecord={path:'/system',name:'System',component:'/index/index',meta:{title:'系统',roles:['R_SUPER']},children:[
{path:'audit',name:'AuditLogs',component:'/system/audit/index',meta:{title:'操作记录',icon:'ri:file-list-3-line',keepAlive:false}},
{path:'security',name:'Security',component:'/system/security/index',meta:{title:'登录与安全',icon:'ri:shield-keyhole-line',keepAlive:false}}
]}
