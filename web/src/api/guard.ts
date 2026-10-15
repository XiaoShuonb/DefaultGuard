import request from '@/utils/http'
export interface Group { id:string; title:string; active:number; muted:number; settings:Record<string,any> }
export const getOverview=()=>request.get<any>({url:'/api/overview'})
export const getGroups=()=>request.get<Group[]>({url:'/api/groups'})
export const getChallenges=()=>request.get<any[]>({url:'/api/challenges'})
export const getAudit=(group='')=>request.get<any[]>({url:'/api/audit',params:group?{group}:{}})
export const getSecurity=()=>request.get<any>({url:'/api/security'})
export const revokeSession=(data:any)=>request.post<any>({url:'/api/security/revoke',data})
export const getMembers=(id:string,page=0)=>request.get<any[]>({url:`/api/groups/${id}/members`,params:{page}})
export const getBlacklist=(id:string)=>request.get<any[]>({url:`/api/groups/${id}/blacklist`})
export const getStats=(id:string,days=1,page=0)=>request.get<{rows:any[];total:number;people:number;pages:number}>({url:`/api/groups/${id}/stats`,params:{days,page}})
export const saveSettings=(id:string,data:Record<string,any>)=>request.put<any>({url:`/api/groups/${id}/settings`,data})
export const doAction=(id:string,kind:string,userId?:string)=>request.post<any>({url:`/api/groups/${id}/action`,data:{kind,userId}})
export const formatTime=(v:number)=>v?new Date(v).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai'}):'—'

export const getRuleCatalog=()=>request.get<any[]>({url:'/api/moderation/catalog'})
