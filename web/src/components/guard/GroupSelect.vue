<template><ElSelect :model-value="modelValue" placeholder="选择群组" filterable style="min-width:220px;max-width:100%" @update:model-value="$emit('update:modelValue',$event)"><ElOption v-for="g in groups" :key="g.id" :label="g.title" :value="g.id" /></ElSelect></template>
<script setup lang="ts">
import {getGroups,type Group} from '@/api/guard'
const props=defineProps<{modelValue:string}>()
const emit=defineEmits(['update:modelValue','loaded'])
const groups=ref<Group[]>([])
onMounted(async()=>{groups.value=await getGroups();emit('loaded',groups.value);if(!props.modelValue&&groups.value[0])emit('update:modelValue',groups.value[0].id)})
</script>
