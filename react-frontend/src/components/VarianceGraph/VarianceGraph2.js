import * as d3 from "d3";
import React from 'react';
import './VarianceGraph.css'
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Container from '@mui/material/Container';
import {CardActions, CardContent, CardHeader, Typography} from "@mui/material";
import Card from "@mui/material/Card";
import './VarianceGraph.css'

const useD3 = (renderChartFn, dependencies) => {
    const ref = React.useRef();

    React.useEffect(() => {
        renderChartFn(d3.select(ref.current));
        return () => {};
      }, dependencies);
    return ref;
}

// not ready to convert this to ts :(
function VarianceGraph2 ({data})  {
  const ref = useD3((svg) => {
        console.log(data)

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
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        };

        var height = 400;
        var width = 400;

        var totalWidth = width + margins.left + margins.right;
        var totalHeight = height + margins.top + margins.bottom;

        svg
            .append('svg')
            .attr('width', totalWidth)
            .attr('height', totalHeight);

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
        const padding = 8
        const node_height = 22
        const node_width = 22
        const bundle_width = 14
        const level_y_padding = 0
        const metro_d = 4
        const c = 0
        const min_family_height = 0

        nodes.forEach(n => n.height = (Math.max(1, n.bundles.length) - 1) * metro_d)

        var x_offset = padding
        var y_offset = padding
        levels.forEach(l => {
            x_offset += l.bundles.length * bundle_width
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

        linkks.forEach((linkk) => {
            let nodeG1 = svg.append("g")
                .selectAll("circle")
                .data(linkk)
                .join("circle")
                .attr("cx", d => d.target.x)
                .attr("cy", d => d.target.y)
                .attr("fill", "#000000")
                //.attr("stroke", (d) => {
                //    return '#' + Math.floor(16777215 * Math.sin(3 * Math.PI / (5 * (parseInt(d.target.level) + 1)))).toString(16);}
                .attr('stroke', '#000000')
                .attr("r", 5);
            let nodeG11 = svg.append("g")
                .selectAll("circle")
                .data(linkk)
                .join("circle")
                .attr("cx", d => d.source.x)
                .attr("cy", d => d.source.y)
                .attr("fill", "#000000")
                .attr("stroke", '#000000')
                .attr("r", 6);


            let nodeG2 = svg.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 8)
                .selectAll("text")
                .data(linkk)
                .join("text")
                .attr("class", "text")
                .attr("x", d => d.target.x + padding)
                .attr("y", d => d.target.y)
                .text(d => d.target.id )
                .attr("fill", '#000000');

            let nodeG22 = svg.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 8)
                .selectAll("text")
                .data(linkk)
                .join("text")
                .attr("class", "text")
                .attr("x", d => d.source.x + padding)
                .attr("y", d => d.source.y)
                .text(d => d.source.id )
                .attr("fill", '#000000');

            let nodeG = svg.append('g')
                .attr('class', 'node')
                .selectAll("path")
                .data(linkk)
                .join('path')
                .attr("class", "link")
                .attr("d", d3.linkHorizontal()
                    .source(d => [d.xs, d.ys])
                    .target(d => [d.xt, d.yt]))
                .attr("fill", "none")
                .attr("stroke-opacity", 0.8)
                .attr("stroke-width", 1)
                .attr("stroke", '#000000');
        });
      }, [data]
  );

    return (
        <Container fixed>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h4" component="div"> Tree of Existing Hypotheses </Typography>
              <Divider/>
              <Box sx={{my: 3, mx: 2}}>
                <div style={{height: 400, width: '100%'}}>
                  <script src="https://d3js.org/d3.v5.js" charSet="utf-8"></script>
                  <svg viewBox="0 0 400 400" ref={ref}/>
                </div>
              </Box>
            </CardContent>
          </Card>
        </Container>
    );
}


export default VarianceGraph2;