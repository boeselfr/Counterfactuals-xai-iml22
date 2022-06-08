import * as d3 from "d3";
import d3tip from 'd3-tip'
import React from 'react';
import './VarianceGraph.css'
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Container from '@mui/material/Container';
import {CardActions, CardContent, CardHeader, Typography} from "@mui/material";
import Card from "@mui/material/Card";
import './VarianceGraph.css'
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormLabel from "@mui/material/FormLabel";
import { createTheme , ThemeProvider }from '@mui/material/styles';
import { grey } from '@mui/material/colors';

const theme = createTheme({
    palette:{
        primary: {
            main: grey[500]
        }
    }
})

const useD3 = (renderChartFn, dependencies) => {
    const ref = React.useRef();

    React.useEffect(() => {
        renderChartFn(d3.select(ref.current), ref.current);
        return () => {};
      }, dependencies);
    return ref;
}

// not ready to convert this to ts :(
function VarianceGraph ({data, occurrences, probabilities, setGraphLabels, UpdateLabeled})  {
    const [NeutralChecked, setNeutralChecked] = React.useState(true)
    const [EntailmentChecked, setEntailmentChecked] = React.useState(true)
    const [ContradictionChecked, setContradictionChecked] = React.useState(true)

    const handleContradiction = (e) => {
        setContradictionChecked(e.target.checked);
    }

    const handleEntailment = (e) => {
        setEntailmentChecked(e.target.checked);
    }

    const handleNeutral = (e) => {
        setNeutralChecked(e.target.checked);
    }

    const handleGraphLabels = () => {
        var l = []
        // dirty
        if (NeutralChecked) {
            l.push("Neutral")
        }
        if (EntailmentChecked) {
            l.push("Entailment")
        }
        if (ContradictionChecked) {
            l.push("Contradiction")
        }
        setGraphLabels(l)
    }

    React.useEffect(handleGraphLabels, [NeutralChecked, EntailmentChecked, ContradictionChecked])

    const ref = useD3((svg, current) => {

        svg.selectAll("*").remove();
        d3.selectAll("#tipDiv").remove();
        var levels = [[]]
        if (typeof(data) != "undefined") {
          levels = data
            // delete empty parents
            levels.forEach(l => {
                l.forEach(n => {
                    if (n['parents'].length == 0) {
                        delete n['parents']
                    }
                })
            })
        }

        var margins = {
            top: 100,
            bottom: 30,
            left: 30,
            right: 30
        };

        var height = 400;
        var width = 1000;

        var totalWidth = width + margins.left + margins.right;
        var totalHeight = height + margins.top + margins.bottom;

        svg
            .append('svg')
            .attr('width', totalWidth)
            .attr('height', totalHeight)

        // precompute level depth
        levels.forEach((l, i) => l.forEach(n => n.level = i));

        var nodes = levels.reduce(((a, x) => a.concat(x)), []);
        var nodes_index = {};
        nodes.forEach(d => nodes_index[d.id] = d);

        // objectification
        nodes.forEach(d => {
            d.parents = (d.parents === undefined ? [] : d.parents).map(p => nodes_index[p])
        })

        // precompute bundles
        levels.forEach((l, i) => {
            var index = {}
            l.forEach(n => {
                if (n.parents.length == 0) {
                    return
                }

                var id = n.parents.map(d => d.id).sort().join('--')
                if (id in index) {
                    index[id].parents = index[id].parents.concat(n.parents)
                } else {
                    index[id] = {
                        id: id,
                        parents: n.parents.slice(),
                        level: i
                    }
                }
                n.bundle = index[id]
            })
            l.bundles = Object.keys(index).map(k => index[k])
            l.bundles.forEach((b, i) => b.i = i)
        })

        var links = []
        nodes.forEach(d => {
            d.parents.forEach(p => links.push({
                source: d,
                bundle: d.bundle,
                target: p
            }))
        })

        var bundles = levels.reduce(((a, x) => a.concat(x.bundles)), [])

        // reverse pointer from parent to bundles
        bundles.forEach(b => b.parents.forEach(p => {
            if (p.bundles_index === undefined) {
                p.bundles_index = {}
            }
            if (!(b.id in p.bundles_index)) {
                p.bundles_index[b.id] = []
            }
            p.bundles_index[b.id].push(b)
        }))

        nodes.forEach(n => {
            if (n.bundles_index !== undefined) {
                n.bundles = Object.keys(n.bundles_index).map(k => n.bundles_index[k])
            } else {
                n.bundles_index = {}
                n.bundles = []
            }
            n.bundles.forEach((b, i) => b.i = i)
        })

        links.forEach(l => {
            if (l.bundle.links === undefined) {
                l.bundle.links = []
            }
            l.bundle.links.push(l)
        })

        // layout
        // TODO set
        const padding = 3
        const node_height = 10
        const node_width = 5
        const bundle_width = 10
        const level_y_padding = 3
        const metro_d = -1
        const c = 0
        const min_family_height = 0

        // is zero
        nodes.forEach(n => n.height = (Math.max(1, n.bundles.length) - 1) * metro_d)

        var x_offset = 0
        var y_offset = padding
        levels.forEach(l => {
            //x_offset += l.bundles.length * bundle_width
            x_offset += bundle_width
            y_offset += level_y_padding
            l.forEach((n, i) => {
                n.x = n.level * node_width + x_offset
                n.y = node_height + y_offset + n.height / 2
                y_offset += node_height + n.height
            })
        })

        var i = 0
        levels.forEach(l => {
            l.bundles.forEach(b => {
                b.x = b.parents[0].x + node_width + (l.bundles.length - 1 - b.i) * bundle_width
                b.y = i * node_height
            })
            i += l.length
        })

        links.forEach(l => {
            l.xt = l.target.x
            l.yt = l.target.y + l.target.bundles_index[l.bundle.id].i * metro_d - l.target.bundles.length * metro_d / 2 + metro_d / 2
            l.xb = l.bundle.x
            l.xs = l.source.x
            l.ys = l.source.y
        })

        // compress vertical space
        var y_negative_offset = 0
        levels.forEach(l => {
            y_negative_offset += -min_family_height + d3.min(l.bundles, b => d3.min(b.links, link => (link.ys - c) - (link.yt + c))) || 0
            l.forEach(n => n.y -= y_negative_offset)
        })

        // very ugly, I know
        links.forEach(l => {
            l.yt = l.target.y + l.target.bundles_index[l.bundle.id].i * metro_d - l.target.bundles.length * metro_d / 2 + metro_d / 2
            l.ys = l.source.y
            l.c1 = l.source.level - l.target.level > 1 ? node_width + c : c
            l.c2 = c
        })


        const cluster = d3.cluster()
            .size([width, height]);

        const root = d3.hierarchy(links);
        cluster(root);
        let oValues = Object.values(root)[0];
        let linkks = oValues.map(x => x.bundle.links);


        //linkks has three times the same bundle for a bundle of three for example
        // get unique links:
        let new_linkks = [];
        // go through and take unique ones:
        linkks.forEach((linkk) => {
            if (!new_linkks.includes(linkk)) {
                new_linkks.push(linkk)
            }
        })

        linkks = new_linkks
        // create a tooltip
        var current_position = [0,0]
        var tool_tip = d3tip()
                .attr("class", "d3-tip")
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-width", "2px")
                .style("border-radius", "5px")
                .style("padding", "5px")
                .html("<div id='tipDiv'></div>")
                .offset([-70, 70]);
        // Call it as a function to our app-wide SVG
        svg.call(tool_tip);


        // Three function that change the tooltip when user hover / move / leave a cell

        var mouseover = function(d) {
              d3.select(this)
              .style("stroke", "black")
              .style("opacity", 1)
          }

        var mouseoverLink = function(d){
            d3.select(this)
              .style("stroke-width", 1.5)
        }

        var mousemove = function(d) {
            current_position = d3.pointer(this);
            tool_tip.show(d, this);
            var tipSVG = d3.select("#tipDiv")
                .append("svg")
                .attr("width", 200)
                .attr("height", 100);
            // get id from circle and filter the dictionary by the id
            const id = d3.select(this).attr("id")
            var data = probabilities.map(a => Object.assign({}, a));
            // copy the probabilities into data and filter
            var index = data.length - 1;

            while (index >= 0) {
              if (!data[index]["id"].includes(" " + id) && !data[index]["id"].includes(id + " ")) {
                data.splice(index, 1);
              }
              index -= 1;
            }
            if (data.length == 0){
                tool_tip.hide()
                return
            }

            const colorpalette =
                {"Entailment": "#4caf50", "Neutral": "gray", "Contradiction": "#ef5350"}

            var box_x = d3.scaleLinear()
                .domain([0,1])
                .range([0,120])

            const labels = ["Entailment", "Neutral", "Contradiction"]
            // space the text 80 apart
            data.forEach((entry, index) => {
                // Add the text to measure it
                tipSVG.append("text")
                    .attr("x", 0)
                    .attr("y", () => {
                        return 20 + index * 80
                    })
                    .attr("font-weight", 500)
                    .text(entry["id"]);

                //print human and ai:
                tipSVG.append("text")
                    .attr("x", 5)
                    .attr("y", 50 + index * 80)
                    .text("🤖:")

                tipSVG.append("text")
                    .attr("x", 205)
                    .attr("y", 50 + index * 80)
                    .text("🧑✍️:")

                var ai_max = entry["probs"].indexOf(Math.max(...entry["probs"]));
                var human_max = entry["human_probs"].indexOf(Math.max(...entry["human_probs"]));

                if (ai_max !== human_max) {
                    tipSVG.append("text")
                        .attr("x", 185)
                        .attr("y", 50 + index * 80)
                        .text("⚡")
                }
                // print entailment neutral counterfactual below:
                labels.forEach((label, i) => {
                     tipSVG
                         .append("rect")
                            .attr("x", 50)
                            .attr("y", () => {
                            return 40 + index * 80 + 10 * (i) - 9
                            })
                            .attr("width", () => {
                            return box_x(entry["probs"][i])
                            })
                             .attr("height", 10)
                             .attr("fill", () => {
                                return colorpalette[label]
                             })
                            .attr("opacity", () => {
                             return 0.5 + 0.5 * entry["probs"][i]
                         })
                    tipSVG.append("text")
                        .attr("x", 50)
                        .attr("y", () => {
                            return 40 + index * 80 + 10 * i
                        })
                        .text(label)
                        .style("font-size", 12)

                    //human probs:
                    tipSVG
                         .append("rect")
                            .attr("x", 250)
                            .attr("y", () => {
                            return 40 + index * 80 + 10 * (i) - 9
                            })
                            .attr("width", () => {
                            return box_x(entry["human_probs"][i])
                            })
                             .attr("height", 10)
                             .attr("fill", () => {
                                return colorpalette[label]
                             })
                            .attr("opacity", () => {
                             return 0.5 + 0.5 * entry["human_probs"][i]
                         })
                    tipSVG.append("text")
                        .attr("x", 250)
                        .attr("y", () => {
                            return 40 + index * 80 + 10 * i
                        })
                        .text(label)
                        .style("font-size", 12)
                })


            })


            // Save the dimensions of the text elements
            tipSVG.selectAll("text")
                    .data(data)
                    .each(function (d) {
                        d.bbox = this.getBBox();
                    });

            //min 400 to cover the plot
            var tipWidth = 400

            data.forEach(function (entry) {
                tipWidth = Math.max(tipWidth, entry["bbox"]["width"]);
                });

            var tipHeight = data.length * 80
            // now redo with measurements
            tipSVG.attr("width", tipWidth)
                .attr("height", tipHeight)

            tool_tip.offset([-1 * (tipHeight), 50])
        }

        const mouseleave = function(d) {
            tool_tip.hide()
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 0.8)
        }

        const mousemoveLink = function(d) {
            current_position = d3.pointer(this);
            tool_tip.show(d, this);
            var tipSVG = d3.select("#tipDiv")
                .append("svg")
                .attr("width", 200)
                .attr("height", 100);
            // get id from circle and filter the dictionary by the id
            const parent = d3.select(this).attr("parent_id")
            const child = d3.select(this).attr("child_id")
            var data = probabilities.map(a => Object.assign({}, a));

            // copy the probabilities into data and filter
            var index = data.length - 1;

            while (index >= 0) {
              if (!data[index]["id"].includes(parent + " " + child)) {
                data.splice(index, 1);
              }
              index -= 1;
            }

            if (data.length == 0){
                tool_tip.hide()
                return
            }


            const colorpalette =
                {"Entailment": "#4caf50", "Neutral": "gray", "Contradiction": "#ef5350"}


            var box_x = d3.scaleLinear()
                .domain([0,1])
                .range([0,120])

            const labels = ["Entailment", "Neutral", "Contradiction"]
            // space the text 80 apart
            data.forEach((entry, index) => {
                // Add the text to measure it
                tipSVG.append("text")
                    .attr("x", 0)
                    .attr("y", () => {
                        return 20 + index * 80
                    })
                    .attr("font-weight", 500)
                    .text(entry["id"]);

                //print human and ai:
                tipSVG.append("text")
                    .attr("x", 5)
                    .attr("y", 50 + index * 80)
                    .text("🤖:")

                tipSVG.append("text")
                    .attr("x", 205)
                    .attr("y", 50 + index * 80)
                    .text("🧑✍️:")

                var ai_max = entry["probs"].indexOf(Math.max(...entry["probs"]));
                var human_max = entry["human_probs"].indexOf(Math.max(...entry["human_probs"]));

                if (ai_max !== human_max) {
                    tipSVG.append("text")
                        .attr("x", 185)
                        .attr("y", 50 + index * 80)
                        .text("⚡")
                }
                // print entailment neutral counterfactual below:
                labels.forEach((label, i) => {
                     tipSVG
                         .append("rect")
                            .attr("x", 50)
                            .attr("y", () => {
                            return 40 + index * 80 + 10 * (i) - 9
                            })
                            .attr("width", () => {
                            return box_x(entry["probs"][i])
                            })
                             .attr("height", 10)
                             .attr("fill", () => {
                                return colorpalette[label]
                             })
                            .attr("opacity", () => {
                             return 0.5 + 0.5 * entry["probs"][i]
                         })
                    tipSVG.append("text")
                        .attr("x", 50)
                        .attr("y", () => {
                            return 40 + index * 80 + 10 * i
                        })
                        .text(label)
                        .style("font-size", 12)

                    //human probs:
                    tipSVG
                         .append("rect")
                            .attr("x", 250)
                            .attr("y", () => {
                            return 40 + index * 80 + 10 * (i) - 9
                            })
                            .attr("width", () => {
                            return box_x(entry["human_probs"][i])
                            })
                             .attr("height", 10)
                             .attr("fill", () => {
                                return colorpalette[label]
                             })
                            .attr("opacity", () => {
                             return 0.5 + 0.5 * entry["human_probs"][i]
                         })
                    tipSVG.append("text")
                        .attr("x", 250)
                        .attr("y", () => {
                            return 40 + index * 80 + 10 * i
                        })
                        .text(label)
                        .style("font-size", 12)
                })


            })


            // Save the dimensions of the text elements
            tipSVG.selectAll("text")
                    .data(data)
                    .each(function (d) {
                        d.bbox = this.getBBox();
                    });

            //min 400 to cover the plot
            var tipWidth = 400

            data.forEach(function (entry) {
                tipWidth = Math.max(tipWidth, entry["bbox"]["width"]);
                });

            var tipHeight = data.length * 80
            // now redo with measurements
            tipSVG.attr("width", tipWidth)
                .attr("height", tipHeight)

            tool_tip.offset([-1 * (tipHeight), 50])
        }

         const mouseleaveLink = function(d){
            tool_tip.hide()
            d3.select(this)
                .style("stroke-width", 0.5)
        }

        function drawNodes(linkk) {
            let nodeG1 = svg.append("g")
                .selectAll("circle")
                .data(linkk)
                .join("circle")
                .attr("cx", d => d.target.x)
                .attr("cy", d => d.target.y)
                .attr("fill", "#521135")
                //.attr("stroke", (d) => {
                //    return '#' + Math.floor(16777215 * Math.sin(3 * Math.PI / (5 * (parseInt(d.target.level) + 1)))).toString(16);}
                .attr('stroke', 'none')
                .attr("r", 1.5)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on('mouseleave', mouseleave)

            let nodeG11 = svg.append("g")
                .selectAll("circle")
                .data(linkk)
                .join("circle")
                .attr("cx", d => d.source.x)
                .attr("cy", d => d.source.y)
                .attr("fill", "#521135")
                .attr("stroke", 'none')
                .attr("r", 1.5)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on('mouseleave', mouseleave)
        }

        linkks.forEach(drawNodes);



        linkks.forEach((linkk) => {
            let nodeG1 = svg.append("g")
                .selectAll("circle")
                .data(linkk)
                .join("circle")
                .attr("id", d=> d.target.id.trim())
                .attr("cx", d => d.target.x)
                .attr("cy", d => d.target.y)
                .attr("fill", "#521135")
                //.attr("stroke", (d) => {
                //    return '#' + Math.floor(16777215 * Math.sin(3 * Math.PI / (5 * (parseInt(d.target.level) + 1)))).toString(16);}
                .attr('stroke', 'none')
                .attr("r", 1.5)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on('mouseleave', mouseleave)

            let nodeG11 = svg.append("g")
                .selectAll("circle")
                .data(linkk)
                .join("circle")
                .attr("id", d=> d.source.id.trim())
                .attr("cx", d => d.source.x)
                .attr("cy", d => d.source.y)
                .attr("fill", "#521135")
                .attr("stroke", 'none')
                .attr("r", 1.5)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on('mouseleave', mouseleave)
        })

        linkks.forEach((linkk) => {
            // filter the links here once for each label and then draw them:
            const labels = ["Entailment", "Neutral", "Contradiction"]
            const colorpalette =
                {"Entailment": "#4caf50", "Neutral": "gray", "Contradiction": "#ef5350"}
            labels.forEach((label,i) => {

                let nodeG = svg.append('g')
                .attr('class', 'node')
                .selectAll("path")
                .data(linkk)
                .join('path')
                    //check if there is a label==label for this link
                    .filter(function(d){
                        var data = probabilities.map(a => Object.assign({}, a));

                        // copy the probabilities into data and filter
                        var index = data.length - 1;

                        while (index >= 0) {
                          if (!data[index]["id"].includes(d.target.id.trim() + " " + d.source.id.trim())) {
                            data.splice(index, 1);
                          }
                          index -= 1;
                        }
                        var labelmatch = false
                        data.forEach((entry) => {
                            var ai_max = entry["human_probs"].indexOf(Math.max(...entry["human_probs"]));
                            if (ai_max == i){
                                labelmatch = true
                            }
                        })
                        return labelmatch
                    })
                .attr("class", "link")
                .attr("parent_id", d=>d.target.id.trim())
                .attr("child_id", d=>d.source.id.trim())
                .attr("d", d3.linkHorizontal()
                    .source(function(d) {return[d.xs, d.ys - 0.5 + i*0.5 ]})
                    .target(function(d) {return [d.xt, d.yt - 0.5  + i*0.5 ]}))
                .attr("stroke-width", 1)
                //source is child here target is parent...
                .attr("opacity", 0.1)
                .style("opacity", d => occurrences[d.target.id.trim() + '_' + d.source.id.trim()]/occurrences['ALL_SENTENCES'])
                .style("stroke", () => {return colorpalette[label]})
                .on("mouseover", mouseoverLink)
                .on("mousemove", mousemoveLink)
                .on('mouseleave', mouseleaveLink)
            })

            let nodeG2 = svg.append("g")
                .selectAll("text")
                .data(linkk)
                .join("text")
                .attr("class", "node_text")
                .attr("x", d => d.target.x)
                .attr("y", d => d.target.y - padding)
                .text(d => d.target.id.trim() )
                .attr("fill", '#000000')
                //.style("font-size", d => occurrences[d.target.id.trim()])

            // otherwise the last one gets remove as it is no source just a target
            let nodeG22 = svg.append("g")
                .selectAll("text")
                .data(linkk)
                .join("text")
                .attr("class", "node_text")
                .attr("x", d => d.source.x)
                .attr("y", d => d.source.y - padding)
                .text(d => d.source.id.trim() )
                .attr("fill", '#000000')
                //.style("font-size", d => occurrences[d.target.id.trim()])
        });

        function handleZoom(e) {
            d3.selectAll("svg g")
                .attr("transform", e.transform)
        }

        let zoom = d3.zoom()
            .scaleExtent([0.5, 6])
            .on('zoom', handleZoom);
        
        function initZoom() {
            d3.selectAll("svg")
                .call(zoom)
        }

        initZoom()
      }, [data]
  );

    return (
        <Container fixed>
          <Card elevation={0}>
            <CardContent>
              <Typography variant="h4" component="div">
                Hypothesis Visualization </Typography>
              <Divider/>
                <FormControl component="fieldset">
                    <FormLabel component="legend">Select the Hypotheses to display</FormLabel>
                <FormGroup row>
                    <FormControlLabel
                    value="Entailment"
                    label="Entailment"
                    labelPlacement="end"
                    control={<Checkbox checked={EntailmentChecked} onChange={handleEntailment} color="success" />
                }/>
                    <ThemeProvider theme={theme}>
                <FormControlLabel
                    value="Neutral"
                    label="Neutral"
                    labelPlacement="end"
                    control={<Checkbox checked={NeutralChecked} onChange={handleNeutral} color="primary" />
                }/>
                    </ThemeProvider>
                <FormControlLabel
                    value="Contradiction"
                    label="Contradiction"
                    labelPlacement="end"
                    control={<Checkbox checked={ContradictionChecked} onChange={handleContradiction} color="error" />
                }/>
                </FormGroup>
                </FormControl>
                <Divider/>
              <Box sx={{my: 3, mx: 4, "margin-top": 5, "margin-left": -15}}>
                <div style={{height: 400, width: 2000}}>
                  <script src="https://d3js.org/d3.v5.js" charSet="utf-8"></script>
                  <svg viewBox="0 0 400 2000" ref={ref}/>
                </div>
              </Box>
            </CardContent>
          </Card>
        </Container>
    );
}


export default VarianceGraph;
