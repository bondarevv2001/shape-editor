<template>
  <circle :cx="node.x" :cy="node.y" class="node-circle" @click="onNodeClick" />
</template>

<script>
export default {
  data() {
    return {
      dragging: false,
    };
  },
  props: { node: Object },
  methods: {
    onNodeClick(e) {
      e.stopPropagation();
    },
  },
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