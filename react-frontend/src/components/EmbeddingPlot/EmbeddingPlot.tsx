/*import React, { useEffect } from 'react'
import * as d3 from 'd3'
import {Margins} from '../../types/Margins'
import './EmbeddingPlot.css'
import {NLIEmbeddingArray} from "../../types/NLIEmbeddingArray";
import {NLIEmbeddingPoint} from "../../types/NLIEmbeddingPoint";
import {queryBackendEmbedding} from "../../backend/BackendQueryEngine";

export interface Props {
    data:NLIEmbeddingArray
}

const EmbeddingPlot: React.FunctionComponent<Props> = ({data}: Props) => {
    const margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 460 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    const circleElements = props.data.map((row, idx) => {
        return <circle key={idx} cx={x(row.X1)} cy={y(row.X2)} r={5} fill={colors[row.cluster]}></circle>;
    })

    const svg = d3
        .select("#myEmbeddingPlot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            `translate(${margin.left}, ${margin.top})`);

    return <div>
        <svg width={100} height={60}>
            <g>

            </g>
        </svg>
    </div>
}

    /*queryBackendEmbedding('upload-embeddings-plot').then(data => {

            console.log('in the mebdding plot :')
            console.log(data)
            /*const xmax = d3.max([0, d3.max(data, function(d) { return d.X1; })]);
            const xmin = d3.min([0, d3.min(data, function(d) { return d.X1; })]);
            const ymax = d3.max([0, d3.max(data, function(d) { return d.X2; })]);
            const ymin = d3.min([0, d3.min(data, function(d) { return d.X2; })]);

            console.log(xmax)
            console.log(xmin)
            console.log(ymax)
            console.log(ymin)*/

            // X-Axis
            /*const x = d3.scaleLinear()
                //maybe get min and max from data
                .domain([-100, 100])
                .range([0, width]);

            svg.append("g")
                .attr("transform", `translate(0, ${height})`)
                .call(d3.axisBottom(x));

            // Y-Axis
            const y = d3.scaleLinear()
                // maybe get min max from data
                .domain([-100, 100])
                .range([height, 0]);

            svg.append("g")
                .call(d3.axisLeft(y));

            // colors for different labels:
            const colors = d3.scaleOrdinal()
                .domain(["setosa", "versicolor", "virginica"])
                .range(["#440154ff", "#21908dff", "#fde725ff"])


            // create a tooltip
            const tooltip = d3.select(".basicScatterChart")
                .append("div")
                .style("opacity", 0)
                .attr("class", "tooltip")
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-width", "2px")
                .style("border-radius", "5px")
                .style("padding", "5px")*/

            // Three function that change the tooltip when user hover / move / leave a cell
            /*const mouseover = function(event, d) {
                tooltip
                  .style("opacity", 1)
                d3.select(event)
                  .style("stroke", "black")
                  .style("opacity", 1)
              };

            const mousemove = function(event, d) {
                tooltip
                  .html(d.sentence2)
                  .style("left", (event.x / 2) + "px")
                  .style("top", (event.y / 2) + "px")
              };

            const mouseleave = function(event, d) {
                tooltip
                    .style("opacity", 0)
                d3.select(event)
                  .style("stroke", "none")
                  .style("opacity", 0.8)
              };*/
            /*const data_new = [
              [10, 20], [20, 100], [200, 50],
              [25, 80], [10, 200], [150, 75],
              [10, 70], [30, 150], [100, 15]
            ];
            const svg = d3.select("body")
            .append("svg")
            .attr("width", 250)
            .attr("height", 250)

            svg.selectAll("circle")
               .data(data).enter()
               .append("circle")
               .attr("cx", function(d) {return d[0]})
               .attr("cy", function(d) {return d[1]})
               .attr("r", 4)


            // Add dots
            // @ts-ignore
            svg.append('g')
                .selectAll("dot")
                .data(data)
                .enter()
                .append("circle")
                    .attr("cx", function (d) {
                        return x(((d as unknown) as NLIEmbeddingPoint).X1);
                    })
                    .attr("cy", function (d) {
                        return y(((d as unknown) as NLIEmbeddingPoint).X2);
                    })
                    .attr("r", 7)
                    .style('fill', 'grey')
                //.style("fill", function (d) {return colors(d.gold_label)})
                .style("opacity", 0.8)
                //.style("stroke", "none")
            //.on("mouseover", mouseover )
            //.on("mousemove", mousemove )
            //.on("mouseleave", mouseleave );
        });*/

    

//export default EmbeddingPlot
export {}