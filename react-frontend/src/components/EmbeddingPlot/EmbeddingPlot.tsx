import * as Bokeh from "bokehjs"
import React, {useEffect, useState, Component} from 'react';
import Visualization from "../../Visualization";
import {Button} from '@material-ui/core';
import Axios from 'axios';

class EmbeddingPlot extends Component {
    //const [plot, setPlot] = useState()
    //tried this as class and const
    handlePlot1 = () => {
        //tried about a million things here:

        /*await fetch('http://127.0.0.1:8000/upload-embeddings', {
            method: 'GET'
        }).then(response => response.json()).then(response => Bokeh.embed.embed_item(response, 'testPlot'))*/
        Axios.get('http://127.0.0.1:8000/upload-embeddings-plot')
            .then(response => console.log(response)).then(response => Bokeh.embed.embed_item(response.data, 'testPlot'))
        //.then(response => response.json()).then(console.log(response)).then(response => Bokeh.embed.embed_item(response, 'testPlot'))
        //console.log(plot)
    }

    //useEffect(handlePlot1, [])
    //console.log('im here!')

    render() {
        return (<div>
            UMAP Embeddings
            <button className='buttonS'
                    onClick={this.handlePlot1}>
                Update Plot
            </button>
            <div id='testPlot' className="bk-root"></div>
        </div>)
    }
}

export default EmbeddingPlot