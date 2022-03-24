import React, { useState } from 'react';
import {NLIDataArray} from "./types/NLIDataArray";
import BoxSentencePair from "./components/BoxSentencePair/BoxSentencePair";
import BoxPolyjuice from "./components/BoxPolyjuice/BoxPolyjuice";
import BoxTable from "./components/BoxTable/BoxTable";
import BoxCF from "./components/BoxCF/BoxCF";


interface Props {
    data: NLIDataArray;
}

const Visualization: React.FunctionComponent<Props> = ({ data }: Props) =>{
    const [count, setCount] = useState(0);
    const [cflist, setCFList] = useState([]);
    const [cflabellist, setCFLabelList] = useState([]);
    const [cfsimilaritylist, setCFSimilarityList] = useState([]);

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


    // all const above are lists ( with only one entry )
    // to display the first nli entry we access the first element in each list below
    return  (
        <div className="Vis">
            <BoxSentencePair sentence1={sentence1}
                             sentence2={sentence2}
                             gold_label={gold_label}
                             setCount={setCount}
                             count={count}/>
            <BoxPolyjuice suggestion={suggestion} setCount={setCount} count={count} mode={mode}/>

            <BoxTable sentence1={sentence1[0]}
                          sentence2={sentence2[0]}
                          gold_label={gold_label[0]}
                          suggestion={suggestion[0]}/>

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
                    mode={mode}
                    />)
        </div>)
};

export default Visualization;

