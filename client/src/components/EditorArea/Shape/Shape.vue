<template>
  <g>
    <path :d="nodesToPath(nodes)" fill="none" stroke="black" />
    <ShapeNode v-for="(node, id) in nodes" :node="node" :key="id" />
  </g>
</template>

<script>
import ShapeNode from "./ShapeNode.vue";
export default {
  props: { nodes: Object },
  methods: {
    nodesToPath(nodes) {
      let path = "";
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const mod = i === 0 ? "M" : "L";
        path += mod + node.x + " " + node.y;
      }
      path += " Z";
      return path;
    },
  },
  components: { ShapeNode },
};
</script>

<style lang="scss" scoped>
.node-circle {
  cursor: move;
  r: 6px;
  transition: r 0.1s;
  &:hover {
    fill: red;
    r: 10px;
  }
}
</style>