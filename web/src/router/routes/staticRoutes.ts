import { AppRouteRecordRaw } from '@/utils/router'
export const staticRoutes: AppRouteRecordRaw[] = [
{path:'/auth/login',name:'Login',component:()=>import('@views/auth/login/index.vue'),meta:{title:'动态密钥登录',isHideTab:true}},
{path:'/403',name:'Exception403',component:()=>import('@views/exception/403/index.vue'),meta:{title:'403',isHideTab:true}},
{path:'/500',name:'Exception500',component:()=>import('@views/exception/500/index.vue'),meta:{title:'500',isHideTab:true}},
{path:'/:pathMatch(.*)*',name:'Exception404',component:()=>import('@views/exception/404/index.vue'),meta:{title:'404',isHideTab:true}}
]
