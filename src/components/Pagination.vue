<template>
  <div class="pagination__container">
    <button
      class="pagination__button pagination__start clickable"
      @click="$emit('changePage', 'start')"
      :disabled="prevDisabled"
    ></button>
    <button
      class="pagination__button pagination__prev clickable"
      @click="$emit('changePage', 'prev')"
      :disabled="prevDisabled"
    ></button>
    <div class="pagination__index">
      <div class="pagination__index-wheel hide-scroll">
        <div
          v-for="index in indexSequence"
          class="pagination__index-number prevent-select clickable"
          :class="currentPage == index ? 'bold' : ''"
          :ref="currentPage == index ? 'target' : ''"
          @click="$emit('changePage', index - 1)"
        >
          {{ index }}
        </div>
      </div>
    </div>
    <button
      class="pagination__button pagination__next clickable"
      @click="$emit('changePage', 'next')"
      :disabled="nextDisabled"
    ></button>
    <button
      class="pagination__button pagination__end clickable"
      @click="$emit('changePage', 'end')"
      :disabled="nextDisabled"
    ></button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";

defineEmits(["changePage"]);

const props = defineProps({
  nextDisabled: {
    type: Boolean,
    required: true,
  },
  prevDisabled: {
    type: Boolean,
    required: true,
  },
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
});

const target = ref(null);

const indexSequence = computed(() => {
  return new Array(props.totalPages).fill(1).map((_, i) => i + 1);
});

watch(
  () => props.currentPage,
  () => {
    nextTick(() => {
      console.log(target.value);
      target.value[0].scrollIntoView({ inline: "center" });
      window.scrollTo({ top: 0 });
    });
  }
);

onMounted(async () => {});
</script>

<style lang="sass" scoped>
.pagination__container
    display: flex
    justify-content: center
    align-items: center
    gap: 0.5rem
    text-align: center
    padding: 1rem

.pagination__button
  border: none
  outline: none
  border-radius: 50%
  width: 2rem
  height: 2rem
  background-color: var(--button)
  background-size: 0.8rem 0.8rem
  background-repeat: no-repeat
  background-position: 45% center

  &:disabled
    opacity: 50%

  &.pagination__start
    background-image: url('/src/assets/images/double-left-arrow.png')

  &.pagination__prev
    background-image: url('/src/assets/images/left-arrow.png')

  &.pagination__next
    background-image: url('/src/assets/images/right-arrow.png')

  &.pagination__end
    background-image: url('/src/assets/images/double-right-arrow.png')

.pagination__index
  display: inline-block
  height: 1rem
  width: 10rem
  padding-inline: 1rem

.pagination__index-wheel
  display: flex
  height: 1rem
  width: 10rem
  gap: 1rem
  overflow-y: hidden
  overflow-x: auto

// .pagination__index-number
</style>
