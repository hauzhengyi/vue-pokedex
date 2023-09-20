<template>
  <div class="pagesize__container">
    <span>Show</span>
    <select
      :value="pageSize"
      @change="(event) => $emit('changeSize', +event.target.value)"
    >
      <option value="10">10</option>
      <option value="20" selected>20</option>
      <option value="50">50</option>
      <option value="100">100</option>
    </select>
    <span>Pokémons</span>
  </div>
</template>

<script setup>
import { onMounted, watch, nextTick } from "vue";

const props = defineProps({
  pageSize: {
    type: Number,
    required: true,
  },
});

watch(
  () => props.pageSize,
  () => {
    nextTick(() => {
      window.scrollTo({ top: 0 });
    });
  }
);

onMounted(async () => {});
</script>

<style lang="sass" scoped>
.pagesize__container
  display: flex
  justify-content: center
  gap: 0.4rem

  select
    border: none
    outline: none
</style>
