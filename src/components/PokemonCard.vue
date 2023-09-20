<template>
  <div class="pokemoncard__container clickable">
    <img
      v-if="isLoading"
      class="pokemoncard__sprite pokemoncard__loading"
      src="/src/assets/images/pokemon-favicon.png"
      alt=""
    />
    <img
      v-else
      class="pokemoncard__sprite"
      :src="
        pokemon?.sprites?.front_default ||
        '/src/assets/images/pokemon-no-data.png'
      "
      :alt="pokemon?.name"
    />
    <div class="pokemoncard__name capitalize">{{ pokemon?.name || "" }}</div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";

const props = defineProps({
  pokemon: {
    type: Object,
    required: true,
  },
});

const isLoading = computed(() => {
  return !props.pokemon.name;
});

onMounted(async () => {});
</script>

<style lang="sass" scoped>
.pokemoncard__container
  display: flex
  flex-direction: column
  width: 8rem
  height: 9rem
  text-align: center
  box-shadow: 0 2px 5px 0 var(--box-shadow)
  border-radius: 0.4rem
  padding-block: 0.5rem

  &:hover
    box-shadow: 0 3px 9px 0 var(--box-shadow)

.pokemoncard__sprite
  align-self: center
  height: 96px
  width: 96px

  &.pokemoncard__loading
    filter: opacity(0.5)
    -webkit-filter: opacity(0.5)
    -moz-filter: opacity(0.5)
    object-fit: none
    animation: spin 1.2s ease infinite

.pokemoncard__name
  margin-block: auto
  padding-inline: 0.2rem
  white-space: wrap
  text-overflow: ellipsis

@keyframes spin
  0%
    transform: rotate(0deg)
  70%
    transform: rotate(360deg)
  100%
    transform: rotate(360deg)
</style>
