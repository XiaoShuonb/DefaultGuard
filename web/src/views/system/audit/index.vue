<template><div class="page-container"><section class="page-hero"><div><h2>操作记录</h2><p>显示最近 100 条，包含执行结果和错误。</p></div><ElButton @click="load">刷新</ElButton></section><ElCard class="content-card"><ElTable :data="rows"><ElTableColumn label="时间" min-width="175"><template #default="{row}">{{formatTime(row.created_at)}}</template></ElTableColumn><ElTableColumn prop="group_id" label="群 ID" min-width="155"/><ElTableColumn prop="actor" label="操作人" min-width="140"/><ElTableColumn prop="action" label="动作" min-width="140"/><ElTableColumn prop="target" label="目标" min-width="140"/><ElTableColumn prop="result" label="结果" width="90"/><ElTableColumn prop="detail" label="说明" min-width="190"/></ElTable></ElCard></div></template>
<script setup lang="ts">
import {getAudit,formatTime} from '@/api/guard'
const rows=ref<any[]>([])
async function load(){rows.value=await getAudit()}onMounted(load)
</script>
