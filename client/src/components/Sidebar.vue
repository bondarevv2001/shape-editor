<template>
  <div
    class="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark"
    style="width: 280px"
  >
    <a
      href="/"
      class="
        d-flex
        align-items-center
        mb-3 mb-md-0
        me-md-auto
        text-white text-decoration-none
      "
    >
      <span class="fs-4">Sidebar</span>
    </a>
    <hr />
    <ul class="nav nav-pills flex-column mb-auto">
      <li class="nav-item">
        <h5>Backgroung image</h5>
        <input type="file" @change="readImage" />
        <br />
        <br />
        <br />
        <p>Img X</p>
        <input ref="coordX" type="number" value="0" @change="moveImage" />
        <p>Img Y</p>
        <input ref="coordY" type="number" value="0" @change="moveImage" />
        <p>Img Scale</p>
        <input
          ref="imgScale"
          type="range"
          min="0"
          max="100"
          step="1"
          value="100"
          @change="moveImage"
        />
        <br />
        <br />
        <br />
        <br />
        <h5>Stroke color</h5>
        <input ref="strokeColor" type="color" @change="changeShapeAppearance" />
        <h5>Fill color</h5>
        <input ref="fillColor" type="color" @change="changeShapeAppearance" />
        <h5>Opacity</h5>
        <input
          ref="opacity"
          type="range"
          min="0"
          max="1"
          step="0.05"
          @change="changeShapeAppearance"
        />
        <br />
        <br />
        <br />
        <br />
        <button>Save SVG</button>
        <button>Load SVG</button>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  methods: {
    readImage(e) {
      if (e.target.files) {
        const url = URL.createObjectURL(e.target.files[0]);
        url;
        this.setBackgroundImage(url);
        console.log(this.backgroundImage.value);
      }
    },
    moveImage() {
      const x = this.$refs.coordX.value;
      const y = this.$refs.coordY.value;
      const scale = this.$refs.imgScale.value;

      console.log(x + " " + y);

      this.moveBackgroundImage({ x: x, y: y, scale: scale });
    },
    changeShapeAppearance() {
      this.setShapeAppearance({
        strokeColor: this.$refs.strokeColor.value,
        fillColor: this.$refs.fillColor.value,
        opacity: this.$refs.opacity.value,
      });
    },
  },
  inject: [
    "setBackgroundImage",
    "moveBackgroundImage",
    "setShapeAppearance",
    "backgroundImage",
  ],
};
</script>

<style lang="scss" scoped>
</style>