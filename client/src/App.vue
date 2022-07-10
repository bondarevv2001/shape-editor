<template>
  <main class="d-flex flex-nowrap" style="height: 100%">
    <sidebar />
    <editor-area />
  </main>
</template>

<script>
import { computed } from "vue";
import EditorArea from "./components/EditorArea/EditorArea.vue";
import Sidebar from "./components/Sidebar.vue";
export default {
  components: { Sidebar, EditorArea },
  name: "App",
  data() {
    return {
      backgroundImage: { url: null, coords: { x: 0, y: 0, scale: 100 } },
      shapeAppearance: {
        strokeColor: "#000000",
        fillColor: "#000000",
        opacity: 1,
      },
    };
  },
  watch: {
    backgroundImage: {
      deep: true,
      handler() {
        console.log(this.backgroundImage + " CHANGED");
      },
    },
  },
  methods: {
    setBackgroundImage(url) {
      this.backgroundImage.url = url;
    },
    moveBackgroundImage(newCoords) {
      this.backgroundImage.coords = newCoords;
    },
    setShapeAppearance(newAppearance) {
      console.log("new appearance ");
      console.log(newAppearance);
      this.shapeAppearance = newAppearance;
    },
  },
  provide() {
    return {
      backgroundImage: computed(() => this.backgroundImage),
      shapeAppearance: computed(() => this.shapeAppearance),
      setBackgroundImage: this.setBackgroundImage,
      moveBackgroundImage: this.moveBackgroundImage,
      setShapeAppearance: this.setShapeAppearance,
    };
  },
};
</script>

<style>
html,
body {
  height: 100%;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
}
</style>
