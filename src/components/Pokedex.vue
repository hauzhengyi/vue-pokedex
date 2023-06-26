<template>
  <div class="Pokedex container">
    <h1>Pokedex</h1>
    <v-tabs
      next-icon="mdi-menu-right"
      prev-icon="mdi-menu-left"
      show-arrows
      center-active
    >
      <v-tab
        v-for="endpoint in endpoints"
        :key="endpoint.name"
        @click="selectEndpoint(endpoint)"
      >
        {{ endpoint.name }}
      </v-tab>
    </v-tabs>
    <PokedexList />
  </div>
</template>

<script>
import PokedexList from './PokedexList.vue';

export default {
  data() {
    return {
      apiUrl: 'https://pokeapi.co/api/v2',
      currentUrl: 'https://pokeapi.co/api/v2',
      endpoints: [],
      selectedEndpoint: '',
    };
  },
  methods: {
    async getEndpoints() {
      const res = await fetch(this.apiUrl);
      const data = await res.json();
      for (let item in data) {
        let name = item;
        let url = data[item];
        this.endpoints.push({ name: name, url: url });
      }
    },
    selectEndpoint(endpoint) {
      this.selectedEndpoint = endpoint;
    },
  },
  mounted() {
    this.getEndpoints();
  },
  components: {
    PokedexList,
  },
};
</script>

<style lang="sass" scoped></style>
