<template>
  <div class="pokedex__container">
    <h1 class="pokedex__title">Pokédex</h1>
    <p class="pokedex__subtitle">Gotta Catch 'Em All!</p>

    <Pagination
      :prevDisabled="!prevUrl"
      :nextDisabled="!nextUrl"
      :totalPages="totalPages"
      :currentPage="currentPage"
      @changePage="(destination) => changePage(destination)"
    />

    <div class="pokedex__list-wrapper">
      <div class="pokedex__list">
        <PokemonCard
          v-for="(pokemon, index) in pokemonList"
          :pokemon="pokemon"
          :key="pokemon.id"
          @click="toggleModal('open', index)"
        />
      </div>
    </div>

    <Pagination
      :prevDisabled="!prevUrl"
      :nextDisabled="!nextUrl"
      :totalPages="totalPages"
      :currentPage="currentPage"
      @changePage="(destination) => changePage(destination)"
    />
    <PageSize
      :pageSize="pageSize"
      @changeSize="(size) => changePageSize(size)"
    />
  </div>

  <footer class="pokedex__footer">
    <div>
      Powered by <a href="https://pokeapi.co/" target="_blank">PokéAPI</a> |
      Created using Vue JS | by Zheng Yi
    </div>
  </footer>

  <PokemonModal
    v-if="showModal"
    @closeModal="toggleModal('close')"
    @navigate="(direction) => updateIndex(direction)"
    @visitEvolution="(pokemon) => visitEvolution(pokemon)"
    :pokemon="selectedPokemon"
    :key="selectedPokemon.id"
    :nextDisabled="nextDisabled"
    :prevDisabled="prevDisabled"
    :visitMode="visitMode"
  />
</template>

<script setup>
// =========== POKEDEX CREATED BY ZHENG YI ===========

import { ref, computed, onMounted, watch } from "vue";
import { useFetchGet } from "/src/composables/useFetch.js";
import PokemonCard from "/src/components/PokemonCard.vue";
import Pagination from "/src/components/Pagination.vue";
import PageSize from "/src/components/PageSize.vue";
import PokemonModal from "/src/components/PokemonModal.vue";

// ================== POKEMON ==================

const pokemonList = ref([]);

const updatePokemons = async () => {
  pokemonList.value = new Array(data.value.results.length).fill({});
  data.value.results.map(async (item, index) => {
    await useFetchGet(item.url).then((response) => {
      if (response.error) {
        console.log(response.error);
        return;
      }
      pokemonList.value[index] = response.data;
    });
  });
};

// ================== POKEMON ==================

// ================== PAGINATION ==================

const pageSize = ref(20);
const pageOffset = ref(0);
const itemCount = ref(0);
const totalPages = ref(0);
const nextUrl = ref("");
const prevUrl = ref("");

const currentPage = computed(() => {
  return pageOffset.value + 1;
});

const changePage = (destination) => {
  if (destination == "start") pageOffset.value = 0;
  if (destination == "prev") pageOffset.value--;
  if (destination == "next") pageOffset.value++;
  if (destination == "end") pageOffset.value = totalPages.value - 1;
  if (Number.isInteger(destination)) pageOffset.value = destination;
};

watch(pageOffset, async () => {
  selectedIndex.value = undefined;
  updateParams();
  await getPokeAPIV2(url.value, params.value);
});

const changePageSize = (size) => {
  pageSize.value = size;
};

watch(pageSize, async () => {
  pageOffset.value = 0;
  updateParams();
  await getPokeAPIV2(url.value, params.value);
});

const updatePagination = () => {
  nextUrl.value = data.value.next;
  prevUrl.value = data.value.previous;
  itemCount.value = data.value.count;
  totalPages.value = Math.ceil(itemCount.value / pageSize.value);
};

// ================== PAGINATION ==================

// ================== MODAL ==================

const showModal = ref(false);
const selectedIndex = ref();
const selectedPokemon = ref();
const visitMode = ref(false);

const prevDisabled = computed(() => {
  return selectedIndex.value <= 0;
});
const nextDisabled = computed(() => {
  return selectedIndex.value + 1 >= pageSize.value;
});

watch(selectedIndex, () => {
  if (selectedIndex.value != undefined)
    selectedPokemon.value = pokemonList.value[selectedIndex.value];
});

const toggleModal = (action, index) => {
  if (action == "close") showModal.value = false;
  if (action == "open") {
    visitMode.value = false;
    selectedIndex.value = index;
    showModal.value = true;
  }
};

const updateIndex = (direction) => {
  if (direction == "prev" && !prevDisabled.value) {
    selectedIndex.value--;
  }
  if (direction == "next" && !nextDisabled.value) {
    selectedIndex.value++;
  }
};

const visitEvolution = (pokemon) => {
  visitMode.value = true;
  selectedIndex.value = undefined;
  selectedPokemon.value = pokemon;
};

// ================== MODAL ==================

// ================== API ==================

const url = ref("https://pokeapi.co/api/v2/pokemon");
const params = ref({});
const data = ref();

const updateParams = () => {
  params.value = {
    offset: pageOffset.value * pageSize.value,
    limit: pageSize.value,
  };
};

const getPokeAPIV2 = async (url, params = "") => {
  await useFetchGet(url, params).then((response) => {
    if (response.error) {
      console.log(response.error);
      return;
    }
    data.value = response.data;
    updatePagination();
    updatePokemons();
  });
};

// ================== API ==================

// ================== LIFECYCLE ==================

onMounted(async () => {
  await getPokeAPIV2(url.value);
});

// ================== LIFECYCLE ==================
</script>

<style lang="sass" scoped>
.pokedex__title
  font-family: Montserrat-Bold
  text-align: center

.pokedex__subtitle
  text-align: center

.pokedex__container
  position: relative
  padding: 1rem

.pokedex__list-wrapper
  margin-block: 1rem

.pokedex__list
  width: 100%
  display: flex
  flex-wrap: wrap
  justify-content: center
  gap: 0.5rem

.pokedex__footer
  font-size: 0.8em
  text-align: center
  padding-block: 5rem
</style>
