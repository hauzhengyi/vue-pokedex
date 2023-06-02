<script>
export default {
  props: [],
  data() {
    return {};
  },
  methods: {},
};
</script>

<template>
  <div class="PokedexList">
    <v-row>
      <v-col v-for="n in 20" :key="n" cols="12" sm="6" md="3">
        <v-card> Card </v-card>
      </v-col>
    </v-row>
  </div>
</template>
