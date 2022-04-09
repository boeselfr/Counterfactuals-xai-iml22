import React, { useEffect } from 'react'
import * as d3 from 'd3'
import {Margins} from '../../types/Margins'
import './EmbeddingPlot.css'
import { scaleLinear } from '@visx/scale';
import { Group } from '@visx/group';
import { AxisBottom, AxisLeft } from '@visx/axis';
import {NLIEmbeddingArray} from "../../types/NLIEmbeddingArray";
import {NLIEmbeddingPoint} from "../../types/NLIEmbeddingPoint";
import {queryBackendEmbedding} from "../../backend/BackendQueryEngine";
import DataPointComponent from "../DataPointComponent";


export interface Props {
    data:NLIEmbeddingArray
}


const EmbeddingPlot: React.FunctionComponent<Props> = ({data}: Props) => {
  const margin = {top: 10, right: 30, bottom: 30, left: 60},
      width = 460 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom;

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // scales
  const xValues = data.map((d) => d.X1);
  const xScale = scaleLinear<number>()
      .domain([Math.min(...xValues), Math.max(...xValues)])
      .range([0, xMax]);

  const yValues = data.map((d) => d.X2);
  const yScale = scaleLinear<number>()
      .domain([Math.min(...yValues), Math.max(...yValues)])
      .range([0, yMax]);

  const colors = d3.scaleOrdinal()
                .domain(["contradiction", "entailment", "neutral"])
                .range(["#440154ff", "#21908dff", "#fde725ff"])


  /*const tooltip = d3.select("#my_dataviz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")



  // A function that change this tooltip when the user hover a point.
  // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
  const mouseover = function(event, d) {
    tooltip
      .style("opacity", 1)
  }

  const mousemove = function(event, d) {
    tooltip
      .html(`The exact value of<br>the Ground Living area is: ${d.GrLivArea}`)
      .style("left", (event.x)/2 + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
      .style("top", (event.y)/2 + "px")
  }

  // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
  const mouseleave = function(event,d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0)
  }*/

//<AxisBottom top={yMax} scale={xScale} stroke='white'/>
    // @ts-ignore
    return (<svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>

        {/* <GridRows scale={yScale} width={xMax} height={yMax} stroke="#eaf0f6" /> */}
        {/* <GridColumns scale={xScale} width={xMax} height={yMax} stroke="#eaf0f6" /> */}
        {/* <line x1={xMax} x2={xMax} y1={0} y2={yMax} stroke="white" /> */}
        <text x="-200" y="-70" transform="rotate(-90)" fontSize={30} fill='white'>
          x2
        </text>
        <text x="500" y="500" transform="rotate(0)" fontSize={30} fill='white'>
          x1
        </text>
        {data.map((d, idx) => (
            <DataPointComponent key={idx} x={xScale(d.X1)} y={yScale(d.X2)} color={colors(d.gold_label) as string} hover={d.sentence2}
            />
        ))}
      </Group>
    </svg>);
}



export default EmbeddingPlot