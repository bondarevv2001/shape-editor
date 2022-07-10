import { select, drag } from "d3";

export const createNodeDragger = (node) => {
  node.call(
    drag()
      .on("start", (event, d) => {
        console.log(event);
        console.log(d);
        select(this).raise().attr("stroke", "black");
      })
      .on("drag", (event, d) => {
        select(this)
          .attr("cx", (d.x = event.x))
          .attr("cy", (d.y = event.y));
      })
      .on("end", (event, d) => {
        console.log(event);
        console.log(d);
        select(this).attr("stroke", null);
      })
  );
};
