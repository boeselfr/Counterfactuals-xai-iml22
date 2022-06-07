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

const useD3 = (renderChartFn, dependencies) => {
    const ref = React.useRef();

    React.useEffect(() => {
        renderChartFn(d3.select(ref.current), ref.current);
        return () => {};
      }, dependencies);
    return ref;
}

// not ready to convert this to ts :(
function VarianceGraph ({data, occurrences, setGraphLabels, UpdateLabeled})  {
    const [NeutralChecked, setNeutralChecked] = React.useState(true)
    const [EntailmentChecked, setEntailmentChecked] = React.useState(true)
    const [ContradictionChecked, setContradictionChecked] = React.useState(true)

    const handleContradiction = (e) => {
        setContradictionChecked(e.target.checked);
        handleGraphLabels()
    }

    const handleEntailment = (e) => {
        setEntailmentChecked(e.target.checked);
        handleGraphLabels()
    }

    const handleNeutral = (e) => {
        setNeutralChecked(e.target.checked);
        handleGraphLabels()
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
        UpdateLabeled()
    }

    React.useEffect(handleGraphLabels, [NeutralChecked, EntailmentChecked, ContradictionChecked])

    const ref = useD3((svg, current) => {

        svg.selectAll("*").remove();
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

        var graphGroup = svg.append('g')
            .attr('transform', "translate(" + margins.left + "," + margins.top + ")");

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
          // If the mouse position is greater beyond ~ Kentucky/Missouri,
          // Offset tooltip left instead of right
          // Input the title, and include the div with an id of #tipDi
            .html(
                "<p><strong>The man singing was not spending their week with a musical tour group</strong></p><center><div id='tipDiv'></div></center>")
            .offset([-100, 150])



        // Call it as a function to our app-wide SVG
        svg.call(tool_tip);

        // Three function that change the tooltip when user hover / move / leave a cell

        var mouseover = function(d) {
              d3.select(this)
              .style("stroke", "black")
              .style("opacity", 1)
          }
        var mousemove = function(d) {
            current_position = d3.pointer(this);
            tool_tip.show(d, this);
            var tipSVG = d3.select("#tipDiv")
                .append("svg")
                .attr("width", 150)
                .attr("height", 60);
            data = [{"Label": "Entailment",
                "Value": 0.7}, {"Label": "Neutral",
                "Value": 0.1},{"Label": "Contradiction",
                "Value": 0.2}];

            var x = d3.scaleLinear()
                .domain([0, 1])
                .range([ 0, 150]);

            var y = d3.scaleBand()
                .range([ 0, 60 ])
                .domain(data.map(function(d) { return d.Label; }))
                .padding(.1);
            const colorpalette =
                {"Entailment": "#4caf50", "Neutral": "#03a9f4","Contradiction": "#ef5350"}


            tipSVG.selectAll("myRect")
                .data(data)
                .enter()
                .append("rect")
                .attr("x", x(0) )
                .attr("y", function(d) { return y(d.Label); })
                .attr("width", function(d) { return x(d.Value); })
                .attr("height", y.bandwidth() )
                .attr("fill", function(d) {return colorpalette[d.Label]})
                .attr("opacity", function(d) {return d.Value})
            // bar chart in the tip
            tipSVG.append("text")
                .text("Entailment")
                .attr("x", 5)
                .attr("y", 16)
            tipSVG.append("text")
                .text("Neutral")
                .attr("x", 5)
                .attr("y", 36)
            tipSVG.append("text")
                .text("Contradiction")
                .attr("x", 5)
                .attr("y", 55)


          }
          var mouseleave = function(d) {
            tool_tip.hide()
            d3.select(this)
              .style("stroke", "none")
              .style("opacity", 0.8)
          }

        linkks.forEach((linkk) => {
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

            let nodeG = svg.append('g')
                .attr('class', 'node')
                .selectAll("path")
                .data(linkk)
                .join('path')
                .attr("class", "link")
                .attr("d", d3.linkHorizontal()
                    .source(d => [d.xs, d.ys])
                    .target(d => [d.xt, d.yt]))
                .attr("stroke-width", 1)
                //source is child here target is parent...
                .attr("opacity", 0.1)
                .style("opacity", d => occurrences[d.target.id.trim() + '_' + d.source.id.trim()]/occurrences['ALL_SENTENCES'])
                .style("stroke", "#7c6daa")



            let nodeG2 = svg.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 2.5)
                .selectAll("text")
                .data(linkk)
                .join("text")
                .attr("class", "text")
                .attr("x", d => d.target.x)
                .attr("y", d => d.target.y - padding)
                .text(d => d.target.id.trim() )
                .attr("fill", '#000000')
                //.style("font-size", d => occurrences[d.target.id.trim()])

            // otherwise the last one gets remove as it is no source just a target
            let nodeG22 = svg.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 2.5)
                .selectAll("text")
                .data(linkk)
                .join("text")
                .attr("class", "text")
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
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h4" component="div"> <strong>Step 3: </strong>
                take a look at existing hypotheses </Typography>
              <Divider/>
                <FormControl component="fieldset">
                    <FormLabel component="legend">Select the Hypotheses to display</FormLabel>
                <FormGroup row>
                <FormControlLabel
                    value="Neutral"
                    label="Neutral"
                    labelPlacement="end"
                    control={<Checkbox checked={NeutralChecked} onChange={handleNeutral} color="secondary" />
                }/>
                <FormControlLabel
                    value="Entailment"
                    label="Entailment"
                    labelPlacement="end"
                    control={<Checkbox checked={EntailmentChecked} onChange={handleEntailment} color="secondary" />
                }/>
                <FormControlLabel
                    value="Contradiction"
                    label="Contradiction"
                    labelPlacement="end"
                    control={<Checkbox checked={ContradictionChecked} onChange={handleContradiction} color="secondary" />
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
