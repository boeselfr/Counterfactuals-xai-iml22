import React, { useEffect,useState } from 'react';
import {NLIDataArray} from "./types/NLIDataArray";
import BoxSentencePair from "./components/BoxSentencePair/BoxSentencePair";
import BoxPolyjuice from "./components/BoxPolyjuice/BoxPolyjuice";
import LabeledTable from "./components/BoxTable/BoxTable";
import BoxCF from "./components/BoxCF/BoxCF";
import {queryBackendDisplayData} from "./backend/BackendQueryEngine";
import {NLISubmissionDisplay} from "./types/NLISubmissionDisplay";
// import Image from 'react-native-image-resizer';
import * as Bokeh from "bokehjs"
import EmbeddingPlot from "./components/EmbeddingPlot/EmbeddingPlot";


interface Props {
    data: NLIDataArray;
}

const Visualization: React.FunctionComponent<Props> = ({ data }: Props) =>{
    const [count, setCount] = useState(0);
    const [cflist, setCFList] = useState([]);
    const [cflabellist, setCFLabelList] = useState([]);
    const [cfsimilaritylist, setCFSimilarityList] = useState([]);
    const [CFLabeled, setCFLabeled] = useState<NLISubmissionDisplay>();
    const [Embeddings, setEmbeddings] = useState('')

    // adding a mode of what we are changing. Hidden to the user for now but we can integrate this at some point
    const mode = 'Hypothesis'
    const sentence1 = data.map((d) => d.sentence1);
    const sentence2 = data.map((d) => d.sentence2);
    const gold_label = data.map((d) => d.gold_label);
    const suggestionRP = data.map((d) => d.suggestionRP);
    const suggestionRP_label = data.map((d) => d.suggestionRP_label);
    const suggestionRH = data.map((d) => d.suggestionRH);
    const suggestionRH_label = data.map((d) => d.suggestionRH_label);

    // selecting the suggestion to work with based on the mode:
    let suggestion = [""];
    if(mode=='Hypothesis'){
        suggestion = suggestionRH
    } else if (mode=='Premise'){
        suggestion = suggestionRP
    }

    // initiate the labeled list of counterfactuals:
    const handleUpdateLabeled = () => {
        queryBackendDisplayData(`upload-submitted-data?sentence1=` + sentence1[count] + '&sentence2=' + sentence2[count]).then((response) => {
      setCFLabeled(response);
      fetchImage();
    })
    };
    useEffect(handleUpdateLabeled, [])
    console.log(CFLabeled)

    //initiate the embedding display:
    // in future this can be updated when a new counterfactual is added to the lsit of cfs.
    const fetchImage = async () => {
        const res = await fetch('http://127.0.0.1:8000/upload-embeddings', {
            method: 'GET'
        });
        const imageBlob = await res.blob();
        const imageObjectURL = URL.createObjectURL(imageBlob);
        setEmbeddings(imageObjectURL);
    };

    useEffect(() => {
        fetchImage();
    }, []);
    console.log(Embeddings)

 //<LabeledTable CFLabeled={CFLabeled} mode={mode}/>
    // all const above are lists ( with only one entry )
    // to display the first nli entry we access the first element in each list below
    return  (
        <div className="Vis">
            <BoxSentencePair sentence1={sentence1}
                             sentence2={sentence2}
                             gold_label={gold_label}
                             setCount={setCount}
                             count={count}/>

            <BoxPolyjuice suggestion={suggestion} setCount={setCount} count={count} mode={mode} UpdateLabeled={handleUpdateLabeled}/>

            {CFLabeled && <LabeledTable CFLabeled={CFLabeled} mode={mode}/>}

            <BoxCF  sentence1={sentence1}
                    sentence2={sentence2}
                    gold_label={gold_label}
                    suggestion={suggestion}
                    setCount={setCount} 
                    count={count} 
                    setCFList={setCFList} 
                    cflist={cflist}
                    cflabellist={cflabellist}
                    setCFLabelList={setCFLabelList}
                    cfsimilaritylist={cfsimilaritylist}
                    setCFSimilarityList={setCFSimilarityList}
                    mode={mode} UpdateLabeled={handleUpdateLabeled}
                    />

             <div className='titleUMAP'>
                 UMAP Visualization of all Training Samples
                 {Embeddings && <img src={Embeddings} alt="embeddings"/>}
             </div>

            <EmbeddingPlot/>
        </div>)
};

export default Visualization;

