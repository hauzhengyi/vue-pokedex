<template>
  <div class="modal__overlay" @click.self="$emit('closeModal')">
    <div class="modal__body hide-scroll">
      <div class="modal__container" :class="pokemon.types[0].type.name">
        <div
          class="modal__close-button clickable"
          @click.self="$emit('closeModal')"
        ></div>
        <h1 class="modal__title capitalize">{{ pokemon.name }}</h1>

        <div class="modal__sprite-ring" :class="isMythical + isLegendary">
          <div
            class="modal__sprite-ring-text capitalize"
            :class="isMythical + isLegendary"
          >
            {{ isLegendary || isMythical || "" }}
          </div>
          <img
            class="modal__sprite"
            :src="
              pokemon?.sprites?.other['official-artwork'].front_default ||
              '/src/assets/images/pokemon-no-data-2.png'
            "
            :alt="pokemon.name"
          />
        </div>

        <div class="modal__types">
          <div
            v-for="type in pokemonTypes"
            class="modal__type capitalize"
            :class="type"
          >
            {{ type }}
          </div>
        </div>

        <div class="modal__detail">
          <div class="modal__flavor-text">
            <q>{{ flavorText }}</q>
          </div>
          <hr />
          <div class="modal__stats">
            <div class="modal__stat">
              <div class="modal__stat-metric">{{ pokemon.id }}</div>
              Pokemon ID
            </div>
            <div class="modal__stat">
              <div class="modal__stat-metric">{{ generation }}</div>
              Generation
            </div>
            <div class="modal__stat">
              <div class="modal__stat-metric">{{ pokemon.height / 10 }}m</div>
              Height
            </div>
            <div class="modal__stat">
              <div class="modal__stat-metric">{{ pokemon.weight / 10 }}kg</div>
              Weight
            </div>
          </div>
          <hr />
          <table class="modal__stats-table">
            <tr v-for="stat in pokemonStats">
              <td class="capitalize">{{ stat.name }}</td>
              <td
                :style="`background: linear-gradient(to right, var(--${stat.name}) ${stat.percent}%, var(--stat-bar) ${stat.percent}%)`"
              >
                {{ stat.value }}
              </td>
            </tr>
          </table>
        </div>

        <div class="modal__evolution">
          <div class="modal__evolved-from">
            <span>Evolved from:</span>
            <img
              v-if="evolvedFrom"
              class="modal__evolution-icon clickable"
              :src="
                evolvedFrom?.sprites?.other['official-artwork'].front_default
              "
              :alt="evolvedFrom?.name"
              :key="evolvedFrom?.id"
              @click="$emit('visitEvolution', evolvedFrom)"
            />
            <span v-if="isBasic"><i>Basic</i></span>
          </div>
          <div class="modal__evolves-to">
            <span>Evolves to:</span>
            <img
              v-for="evolution in evolvesTo"
              class="modal__evolution-icon clickable"
              :src="evolution?.sprites?.other['official-artwork'].front_default"
              :alt="evolution?.name"
              :key="evolution?.id"
              @click="$emit('visitEvolution', evolution)"
            />
            <span v-if="noEvolution"><i>No evolution</i></span>
          </div>
        </div>
        <div
          v-if="!visitMode"
          class="modal__prev-button clickable"
          :class="prevDisabled ? 'disabled' : ''"
          @click.self="$emit('navigate', 'prev')"
        ></div>
        <div
          v-if="!visitMode"
          class="modal__next-button clickable"
          :class="nextDisabled ? 'disabled' : ''"
          @click.self="$emit('navigate', 'next')"
        ></div>
        <div v-if="visitMode" class="modal__visiting-mode">Visiting mode</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useFetchGet } from "/src/composables/useFetch.js";

const props = defineProps({
  pokemon: {
    type: Object,
    required: true,
  },
  nextDisabled: {
    type: Boolean,
    required: false,
    default: true,
  },
  prevDisabled: {
    type: Boolean,
    required: false,
    default: true,
  },
  visitMode: {
    type: Boolean,
    required: false,
    default: false,
  },
});

// ================== POKEMON DATA ==================

// Get data from www.serebii.net/pokedex-sv/stat/speed.shtml
const maxStats = {
  hp: 255,
  attack: 165,
  defense: 184,
  "special-attack": 170,
  "special-defense": 154,
  speed: 200,
};

const pokemonTypes = computed(() => {
  let types = [];
  props.pokemon.types.map((type) => {
    types.push(type.type.name);
  });
  return types;
});
const isLegendary = ref(false);
const isMythical = ref(false);
const evolvedFrom = ref();
const evolvesTo = ref([]);
const isBasic = ref(false);
const noEvolution = ref(false);
const flavorText = ref("");
const generation = ref("");
const pokemonStats = computed(() => {
  let stats = [];
  props.pokemon.stats.map((stat) => {
    let percent = parseInt((stat.base_stat * 100) / maxStats[stat.stat.name]);
    stats.push({
      name: stat.stat.name,
      value: stat.base_stat,
      percent: percent,
    });
  });
  return stats;
});

const updatePokemonSpecies = () => {
  isLegendary.value = dataPokemonSpecies.value.is_legendary ? "legendary" : "";
  isMythical.value = dataPokemonSpecies.value.is_mythical ? "mythical" : "";
  getEvolvedFrom(dataPokemonSpecies.value.evolves_from_species?.name);
  flavorText.value = dataPokemonSpecies.value.flavor_text_entries
    .find((text) => {
      return text.language.name == "en";
    })
    .flavor_text.replace("\f", " ");
  generation.value = dataPokemonSpecies.value.generation.name
    .split("-")
    .pop()
    .toUpperCase();
};

const getEvolvedFrom = async (name) => {
  if (name) evolvedFrom.value = await getPokemonByName(name);
  else isBasic.value = true;
};

const updatePokemonEvolution = () => {
  getEvolvesTo(dataPokemonEvolution.value.chain);
};

const getEvolvesTo = (chain) => {
  if (chain == undefined) return;
  if (props.pokemon.name.split("-").includes(chain.species.name)) {
    if (chain.evolves_to.length == 0) {
      noEvolution.value = true;
      return;
    }
    chain.evolves_to.map(async (evolution, index) => {
      evolvesTo.value[index] = await getPokemonByName(evolution.species.name);
    });
  }
  chain.evolves_to.map((pokemon) => {
    getEvolvesTo(pokemon);
  });
};

// ================== POKEMON DATA ==================

// ================== API ==================

const dataPokemonSpecies = ref({});

const getPokemonSpecies = async (url) => {
  await useFetchGet(url).then((response) => {
    if (response.error) {
      console.log(response.error);
      return;
    }
    dataPokemonSpecies.value = response.data;
    updatePokemonSpecies();
    getPokemonEvolution(response.data.evolution_chain.url);
  });
};

const dataPokemonEvolution = ref({});

const getPokemonEvolution = async (url) => {
  await useFetchGet(url).then((response) => {
    if (response.error) {
      console.log(response.error);
      return;
    }
    dataPokemonEvolution.value = response.data;
    updatePokemonEvolution();
  });
};

const url = ref("https://pokeapi.co/api/v2/pokemon/");

const getPokemonByName = async (name) => {
  return await useFetchGet(url.value + name).then((response) => {
    if (response.error) {
      console.log(response.error);
      return;
    }
    return response.data;
  });
};

// ================== API ==================

// ================== LIFECYCLE ==================

const initFunction = () => {
  getPokemonSpecies(props.pokemon.species.url);
};

onMounted(async () => {
  initFunction();
});

// ================== LIFECYCLE ==================
</script>

<style lang="sass" scoped>
.modal__overlay
  position: fixed
  top: 0
  left: 0
  height: 100%
  width: 100%
  background-color: var(--modal-overlay)
  z-index: 1

.modal__body
  position: fixed
  width: clamp(25rem, 90vw, 50rem)
  height: 85%
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  background: var(--background)
  border-radius: 2rem
  text-align: center
  overflow: scroll

.modal__container
  background: var(--background)
  padding: 2rem 0 7rem

  &.normal
    background: linear-gradient(var(--normal) 21rem, rgba(255,255,255,1) 21rem)
  &.fighting
    background: linear-gradient(var(--fighting) 21rem, rgba(255,255,255,1) 21rem)
  &.flying
    background: linear-gradient(var(--flying) 21rem, rgba(255,255,255,1) 21rem)
  &.poison
    background: linear-gradient(var(--poison) 21rem, rgba(255,255,255,1) 21rem)
  &.ground
    background: linear-gradient(var(--ground) 21rem, rgba(255,255,255,1) 21rem)
  &.rock
    background: linear-gradient(var(--rock) 21rem, rgba(255,255,255,1) 21rem)
  &.bug
    background: linear-gradient(var(--bug) 21rem, rgba(255,255,255,1) 21rem)
  &.ghost
    background: linear-gradient(var(--ghost) 21rem, rgba(255,255,255,1) 21rem)
  &.steel
    background: linear-gradient(var(--steel) 21rem, rgba(255,255,255,1) 21rem)
  &.fire
    background: linear-gradient(var(--fire) 21rem, rgba(255,255,255,1) 21rem)
  &.water
    background: linear-gradient(var(--water) 21rem, rgba(255,255,255,1) 21rem)
  &.grass
    background: linear-gradient(var(--grass) 21rem, rgba(255,255,255,1) 21rem)
  &.electric
    background: linear-gradient(var(--electric) 21rem, rgba(255,255,255,1) 21rem)
  &.psychic
    background: linear-gradient(var(--psychic) 21rem, rgba(255,255,255,1) 21rem)
  &.ice
    background: linear-gradient(var(--ice) 21rem, rgba(255,255,255,1) 21rem)
  &.dragon
    background: linear-gradient(var(--dragon) 21rem, rgba(255,255,255,1) 21rem)
  &.dark
    background: linear-gradient(var(--dark) 21rem, rgba(255,255,255,1) 21rem)
  &.fairy
    background: linear-gradient(var(--fairy) 21rem, rgba(255,255,255,1) 21rem)
  &.unknown
    background: linear-gradient(var(--unknown) 21rem, rgba(255,255,255,1) 21rem)
  &.shadow
    background: linear-gradient(var(--shadow) 21rem, rgba(255,255,255,1) 21rem)

.modal__close-button
  position: absolute
  top: 1.2rem
  right: 1.2rem
  background-image: url('/src/assets/images/cross-white.png')
  background-size: 2rem 2rem
  background-repeat: no-repeat
  width: 2rem
  height: 2rem
  border-radius: 50%

.modal__prev-button
  position: absolute
  left: 3rem
  background-image: url('/src/assets/images/left-arrow.png')
  background-size: 2rem 2rem
  background-repeat: no-repeat
  width: 2rem
  height: 2rem
  margin-block: 2rem
  border-radius: 50%

.modal__next-button
  position: absolute
  right: 3rem
  background-image: url('/src/assets/images/right-arrow.png')
  background-size: 2rem 2rem
  background-repeat: no-repeat
  width: 2rem
  height: 2rem
  margin-block: 2rem
  border-radius: 50%

.modal__prev-button, .modal__next-button
  &.disabled
    opacity: 50%

.modal__title
  font-family: Montserrat-Bold

.modal__sprite-ring
  position: relative
  background: var(--background)
  // background-image: url('/src/assets/images/grass-background.webp')
  // background-size: cover
  // background-repeat: no-repeat
  margin: 2rem auto 1rem
  width: 20rem
  aspect-ratio: 1/1
  border: 3px solid
  border-radius: 50%

  &.legendary
    border: 3px solid transparent
    background: linear-gradient(var(--background), var(--background)) padding-box, linear-gradient(to right, var(--legendary-1), var(--legendary-2)) border-box
    box-shadow: 0 0 10px 0 var(--legendary-2)

  &.mythical
    border: 3px solid transparent
    background: linear-gradient(var(--background), var(--background)) padding-box, linear-gradient(to right, var(--mythical-1), var(--mythical-2)) border-box
    box-shadow: 0 0 10px 0 var(--mythical-2)


.modal__sprite-ring-text
  position: absolute
  top: -0.4rem
  left: 50%
  translate: -50%
  font-family: Montserrat-Bold
  padding: 0.1rem 0.4rem
  font-size: 0.9em
  color: white
  border-radius: 10rem

  &.legendary
    background-image: linear-gradient(to right, var(--legendary-1), var(--legendary-2))

  &.mythical
    background-image: linear-gradient(to right, var(--mythical-1), var(--mythical-2))

.modal__sprite
  width: 20rem
  aspect-ratio: 1/1

.modal__types
  display: flex
  justify-content: center
  gap: 0.5rem
  margin-block: 1rem

.modal__type
  font-family: Montserrat-SemiBold
  color: white
  padding: 0.1rem 0.3rem
  border: 0.25rem solid white
  border-radius: 10rem
  text-shadow: 0 0 3px var(--shadow)
  box-shadow: 0 0 3px 0 var(--shadow)

.modal__detail
  padding-inline: 2rem

.modal__flavor-text
  margin-block: 2rem

  q
    font-family: Montserrat-SemiBold

.modal__stats
  display: flex
  justify-content: center
  gap: 1rem 2rem
  flex-wrap: wrap
  margin-block: 1rem

.modal__stat-metric
  font-family: Montserrat-SemiBold
  font-size: 1.5em

.modal__stats-table
  margin-block: 2rem
  width: 100%
  max-width: 40rem
  margin-inline: auto
  table-layout: fixed

.modal__evolution
  display: flex
  justify-content: space-around
  flex-wrap: wrap
  margin-block: 3rem

.modal__evolved-from, .modal__evolves-to
  display: flex
  justify-content: center
  flex-wrap: wrap
  width: 40%
  gap: 1rem

  span
    width: 100%
    font-family: Montserrat-SemiBold

.modal__evolution-icon
  width: 2.5rem
  height: 2.5rem
  aspect-ratio: 1/1
  border: 2px solid
  border-radius: 50%

.modal__visiting-mode
  position: absolute
  left: 50%
  translate: -50%
  margin-block: 1rem

@media screen and (max-width: 500px)
  .modal__stat
    width: 100%
</style>
