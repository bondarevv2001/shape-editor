<template>
  <div
    id="editorArea"
    class="editor"
    tabindex="-1"
    @mousewheel="zoom"
    @contextmenu="onContextMenu"
    @mouseup="onEditorClick"
    @mousemove="onEditorMouseMove"
    @keydown="onEditorKeyDown"
    @keyup="onEditorKeyUp"
  >
    <h1>{{ mode }}</h1>
    <svg
      id="editorSvgArea"
      xmlns="http://www.w3.org/2000/svg"
      :viewBox="`0 0 ${viewboxWidth} ${viewboxHeight}`"
    >
      <defs>
        <pattern
          id="smallGrid"
          :width="smallGridSize"
          :height="smallGridSize"
          patternUnits="userSpaceOnUse"
        >
          <path
            :d="`M ${smallGridSize} 0 L 0 0 0 ${smallGridSize}`"
            fill="none"
            :stroke="`rgba(255,0,0,${smallGridTransparency})`"
            stroke-width="1"
          />
        </pattern>
        <pattern
          id="bigGrid"
          :width="bigGridSize"
          :height="bigGridSize"
          patternUnits="userSpaceOnUse"
        >
          <path
            :d="`M ${bigGridSize} 0 L 0 0 0 ${bigGridSize}`"
            fill="none"
            :stroke="`rgba(0,255,0,${bigGridTransparency})`"
            stroke-width="3"
          />
        </pattern>
      </defs>
      <image
        class="background-image"
        v-if="backgroundImage.value.url"
        :href="backgroundImage.value.url"
        :x="backgroundImage.value.coords.x"
        :y="backgroundImage.value.coords.y"
        :style="`width: ${backgroundImage.value.coords.scale}%`"
      />
      <circle ref="insertPointer" id="insertPointer" class="insert-pointer" />
      <!-- <rect width="100%" height="100%" fill="url(#smallGrid)" />
      <rect width="100%" height="100%" fill="url(#bigGrid)" /> -->
    </svg>
  </div>
</template>

<script>
import { drag } from "d3-drag";
import { select } from "d3-selection";
export default {
  data() {
    return {
      gridSize: 32,
      bigGridRatio: 4,
      smallGridSize: 8,
      bigGridSize: 64,
      smallGridTransparency: 1,
      bigGridTransparency: 1,
      viewboxWidth: 1,
      viewboxHeight: 1,
      zoomLevel: 1,
      shapes: [],
      activeShape: -1,
      debugNodes: [],
      debugCircles: null,
      mode: "create",
      ghostNode: null,
      selectedNode: -1,
      nodeInserterClosestNodes: [],
      nodeInserterCoordinates: { x: 0, y: 0 },
      shapeAppearance: this.shapeAppearance,
    };
  },
  watch: {
    shapeAppearance: {
      deep: true,
      handler() {
        this.updatePlot();
      },
    },
    shapes: {
      deep: true,
      handler() {
        this.updatePlot();
      },
    },
    ghostNode: {
      deep: true,
      handler() {
        this.updatePlot();
      },
    },
    selectedNode: {
      deep: true,
      handler() {
        this.updatePlot();
      },
    },
    mode: {
      deep: true,
      handler() {
        this.updatePlot();
      },
    },
  },
  inject: ["backgroundImage", "shapeAppearance"],
  methods: {
    findClosestNodes(nodes, mouseLocation) {
      const toSort = [...nodes];

      function distanceToMouse(p) {
        var dx = mouseLocation[0] - p[0];
        var dy = mouseLocation[1] - p[1];
        return Math.sqrt(dx * dx + dy * dy);
      }

      for (let i = 0; i < toSort.length; i++) {
        toSort[i] = [toSort[i], i];
      }

      toSort.sort(
        (n1, n2) =>
          distanceToMouse([n1[0].x, n1[0].y]) -
          distanceToMouse([n2[0].x, n2[0].y])
      );
      toSort.sortIndices = [];
      for (let i = 0; i < toSort.length; i++) {
        toSort.sortIndices.push(toSort[i][1]);
        toSort[i] = toSort[i][0];
      }

      return [toSort.sortIndices[0], toSort.sortIndices[1]].sort(
        (a, b) => a - b
      );
    },
    transformMouseLocation(e) {
      const CTM = e.target.getScreenCTM();
      const localX = (e.x - CTM.e) / CTM.a;
      const localY = (e.y - CTM.f) / CTM.d;

      return [localX, localY];
    },
    updatePlot() {
      const index = this.activeShape;
      const shape = this.shapes[index];

      const actualNodes =
        this.mode === "drawing" && this.ghostNode && index == this.activeShape
          ? [...shape.nodes, this.ghostNode]
          : shape.nodes;

      //Update points
      if (
        this.mode == "editing" ||
        this.mode == "drawing" ||
        this.mode == "insertNode"
      ) {
        shape.shapeGroup
          .selectAll("circle")
          .data(shape.nodes)
          .join("circle")
          .attr("cursor", "move")
          .attr("cx", (d) => d.x)
          .attr("cy", (d) => d.y)
          .attr("r", (d, i) => (this.selectedNode == i ? 10 : 5))
          .attr("stroke", (d, i) => (this.selectedNode === i ? "cyan" : "none"))
          .call(
            drag().on("drag", (e, d) => {
              (d.x = e.x), (d.y = e.y);
            })
          )
          .on("click", (event) => {
            if (this.mode === "editing") {
              const e = shape.shapeGroup.selectAll("circle").nodes();
              const i = e.indexOf(event.currentTarget);
              console.log(event);
              this.selectedNode = i;
              event.stopPropagation();
            }
          });

        shape.shapeGroup
          .select("path")
          .attr("d", this.nodesToPath(actualNodes))
          .attr("stroke", this.shapeAppearance.value.strokeColor)
          .attr("fill", this.shapeAppearance.value.fillColor)
          .attr("opacity", this.shapeAppearance.value.opacity);
      } else {
        shape.shapeGroup.selectAll("circle").remove();
      }

      select("#editorSvgArea")
        .select("#insertPointer")
        .attr("visibility", this.mode === "insertNode" ? "visible" : "hidden");
    },
    onEditorMouseMove(e) {
      const [localX, localY] = this.transformMouseLocation(e);

      if (this.mode == "drawing") {
        this.ghostNode = { x: localX, y: localY };
      }
      if (this.mode == "insertNode") {
        const shape = this.shapes[this.activeShape];

        const closestNodes = this.findClosestNodes(shape.nodes, [
          localX,
          localY,
        ]);

        this.nodeInserterCoordinates = {
          x:
            (shape.nodes[closestNodes[0]].x + shape.nodes[closestNodes[1]].x) /
            2,
          y:
            (shape.nodes[closestNodes[0]].y + shape.nodes[closestNodes[1]].y) /
            2,
        };

        select("#editorSvgArea")
          .select("#insertPointer")
          .attr("cx", this.nodeInserterCoordinates.x)
          .attr("cy", this.nodeInserterCoordinates.y);

        this.nodeInserterClosestNodes = closestNodes;
      }
    },
    leftClick(e) {
      const [localX, localY] = this.transformMouseLocation(e);

      console.log("Clicked");
      if (this.mode === "drawing" && this.activeShape > -1) {
        //Push node to shape
        console.log("Pushing new node");

        const node = { x: localX, y: localY };

        const modShape = this.shapes[this.activeShape];

        modShape.nodes.push(node);
        console.log(modShape.nodes);

        this.shapes = [
          ...this.shapes.slice(0, this.activeShape),
          modShape,
          ...this.shapes.slice(this.activeShape + 1),
        ];

        console.log("Added node");
      } else if (this.mode === "create") {
        //Create new shape

        const shapeGroup = select("#editorSvgArea")
          .append("g")
          .attr("id", "new shape group")
          .on("mouseup", (e) => {
            if (this.mode === "create") {
              e.preventDefault();
              e.stopPropagation();

              const shapeIndex = select("#editorSvgArea")
                .selectAll("g")
                .nodes()
                .indexOf(e.currentTarget);

              console.log(shapeIndex);

              this.activeShape = shapeIndex;
              this.mode = "editing";
            }
          });

        const newShape = {
          id: this.shapes.length,
          nodes: [{ x: localX, y: localY, ghost: false }],
          shapeGroup: shapeGroup,
        };

        this.shapes.push(newShape);
        this.activeShape = this.shapes.length - 1;

        //Create path
        shapeGroup.append("path").attr("stroke", "black").attr("fill", "gray");

        this.mode = "drawing";

        console.log("Added shape");
      } else if (this.mode == "insertNode") {
        console.log("insert node");
        const node = {
          x: this.nodeInserterCoordinates.x,
          y: this.nodeInserterCoordinates.y,
        };
        const originalNodes = this.shapes[this.activeShape].nodes;

        let endNode = this.nodeInserterClosestNodes[1];

        console.log(endNode - this.nodeInserterClosestNodes[0]);
        if (endNode - this.nodeInserterClosestNodes[0] > 1)
          endNode = this.nodeInserterClosestNodes[1] + 1;
        console.log(
          "end node " +
            endNode +
            " closes mul " +
            this.nodeInserterClosestNodes[1]
        );

        this.shapes[this.activeShape].nodes = [
          ...originalNodes.slice(0, endNode),
          node,
          ...originalNodes.slice(endNode),
        ];

        console.log(this.shapes[this.activeShape].nodes);
      } else if (this.mode == "editing") {
        if (this.selectedNode > -1) {
          this.selectedNode = -1;
        }
      }
    },
    rightClick(e) {
      e;
      if (this.mode == "drawing") {
        this.ghostNode = null;
        console.log(this.shapes[this.activeShape].nodes);
        this.mode = "editing";
      } else if (this.mode == "editing") this.mode = "create";
    },
    onEditorClick(e) {
      switch (e.button) {
        case 0:
          this.leftClick(e);
          break;
        case 2:
          this.rightClick(e);
          break;
        default:
          break;
      }
    },
    onContextMenu(e) {
      e.preventDefault();
    },
    onEditorKeyDown(e) {
      if (e.key === "Shift" && this.mode === "editing")
        this.mode = "insertNode";
      else if (
        e.key === "Delete" &&
        this.mode === "editing" &&
        this.selectedNode > -1
      ) {
        const nodes = this.shapes[this.activeShape].nodes;
        this.shapes[this.activeShape].nodes = [
          ...nodes.slice(0, this.selectedNode),
          ...nodes.slice(this.selectedNode + 1),
        ];
        this.selectedNode = -1;
      }
    },
    onEditorKeyUp(e) {
      if (e.key === "Shift" && this.mode === "insertNode")
        this.mode = "editing";
    },
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
    zoom(e) {
      this.zoomLevel -= Math.sign(e.deltaY);
      this.smallGridSize -= Math.sign(e.deltaY);
      this.bigGridSize -= Math.sign(e.deltaY) * 2;
      console.log(this.smallGridSize);
    },
  },
  mounted() {
    this.smallGridSize = this.gridSize;
    this.bigGridSize = this.gridSize * this.bigGridRatio;
    const editorArea = document.getElementById("editorArea");
    const editorResizeObserver = new ResizeObserver(() => {
      {
        this.viewboxWidth = editorArea.clientWidth;
        this.viewboxHeight = editorArea.clientHeight;
        console.log(editorArea.clientHeight + "," + editorArea.clientWidth);
      }
    });
    editorResizeObserver.observe(editorArea);
    console.log(editorArea);
  },
};
</script>

<style lang="scss" scoped>
.editor {
  flex: 1;
  height: 100%;
  overflow: hidden;
  border: none;
  outline: none;
}
.insert-pointer {
  r: 10px;
  stroke: red;
  fill: red;
}
</style>