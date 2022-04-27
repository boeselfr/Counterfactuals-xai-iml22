import React, { useEffect,useState } from 'react';
import {NLIDataArray} from "./types/NLIDataArray";
import BoxSentencePair from "./components/BoxSentencePair/BoxSentencePair";
import BoxPolyjuice from "./components/BoxPolyjuice/BoxPolyjuice";
import LabeledTable from "./components/BoxTable/BoxTable";
import BoxCF from "./components/BoxCF/BoxCF";
import {queryBackendDisplayData, queryBackendEmbedding} from "./backend/BackendQueryEngine";
import {NLISubmissionDisplay} from "./types/NLISubmissionDisplay";
import {NLIEmbeddingArray} from "./types/NLIEmbeddingArray";
// import Image from 'react-native-image-resizer';
import EmbeddingPlot from "./components/EmbeddingPlot/EmbeddingPlot";

import Button from "@mui/material/Button";

import Grid from '@mui/material/Grid';

import ReactJoyride from 'react-joyride';
import { Step } from "react-joyride";
import useTour from "./useTour";


interface Props {
    data: NLIDataArray;
    incrCount: any;
    decrCount: any;
}

const STEPS: Step[] = [
    {
        content: <h2>Welcome. Let us guide you through the process of generating counterfactuals!</h2>,
        locale: { skip: <strong aria-label="skip">Skip Introduction</strong> },
        placement: "center",
        target: "body",
    },
    {
        content: (
        <div> 
            <small>The sentence pair is given as a premise and hypothesis. The task of our model is to determine, given a premise sentence, 
                        whether a hypothesis sentence is true (entailment), false (contradiction) or neither (neutral). See following examples.</small>
        </div>),
        placement: "top",
        target: ".demo_box_sentencepair",
        title: (<div> <h3> SELECT THE ORIGINAL SENTENCE PAIR</h3> </div>)
    },
    {
        content: (
        <small> 
            <div>
                <strong> Premise: </strong> A soccer game with multiple males playing.
            </div>
            <div>
                <strong> Hypothesis: </strong> Some men are playing a sport.
            </div>
            <div>
                <strong> Label: </strong> Entailment
            </div>
        </small>),
        placement: "top",
        target: ".demo_box_sentencepair",
        title: (<div> <h3>SENTENCE PAIR EXAMPLES</h3> </div>)
    },
    {
        content: (
        <small> 
            <div>
                <strong> Premise: </strong> A man inspects the uniform of a figure in some East Asian country.
            </div>
            <div>
                <strong> Hypothesis: </strong> The man is sleeping.
            </div>
            <div>
                <strong> Label: </strong> Contradiction
            </div>
        </small>),
        placement: "top",
        target: ".demo_box_sentencepair",
        title: (<div> <h3>SENTENCE PAIR EXAMPLES</h3> </div>)
    },
    {
        content: (
        <small> 
            <div>
                <strong> Premise: </strong> An older and younger man smiling.
            </div>
            <div>
                <strong> Hypothesis: </strong> Two men are smiling and laughing at the cats playing on the floor.
            </div>
            <div>
                <strong> Label: </strong> Neutral
            </div>
        </small>),
        placement: "top",
        target: ".demo_box_sentencepair",
        title: (<div> <h3>SENTENCE PAIR EXAMPLES</h3> </div>)
    },
    {
        content: (<small> Draw inspiration from the polyjuice automatically generated coutnerfactuals. 
                            You can either: <div>(a) copy them directly below.</div>
                            <div>(b) in case the sentences are semantically or gramatically incorrect or incomplete, copy and correct them below.</div>
                            <div>(c) insert novel counterfactuals, independent of the suggestion. </div>
                            
        </small>),
        placement: "top",
        target: ".demo_box_polyjuice",
        title: (<div> <h3>POLYJUICE SUGGESTIONS</h3> </div>)
    },
    {
        content: (<small> The previously submitted and already existing counterfactuals are listed here as a reference. 
                        The aim is to create a <strong>large, diverse set of counterfactuals</strong>  (in terms of labels as well as sentence structure) 
                        for the model to get a more general understanding of language.
                        Therefore, aim not do create similar/duplicate hypotheses. 
                </small>),
        placement: "top",
        target: ".demo_box_labeledtable",
        title: (<div> <h3>COUNTERFACTUALS TABLE</h3> </div>)
    },
    {
        content: (<small> In this box, you can submit new counterfactuals by manually improving/extending polyjuice suggested counterfactuals,
                        labeling them and finally giving them a diversity score. </small>),
        placement: "top",
        target: ".demo_box_CF",
        title: (<div> <h3>SUBMIT COUNTERFACTUALS</h3> </div>)
    }
  ];

const Visualization: React.FunctionComponent<Props> = ({ data, incrCount, decrCount }: Props) =>{
    const [cfCount, setCfCount] = useState(0);
    const [cflist, setCFList] = useState([]);
    const [cflabellist, setCFLabelList] = useState([]);
    const [cfsimilaritylist, setCFSimilarityList] = useState([]);
    const [CFLabeled, setCFLabeled] = useState<NLISubmissionDisplay>();

    // adding a mode of what we are changing. Hidden to the user for now but we can integrate this at some point
    const mode = 'Hypothesis'
    const sentence1 = data.map((d) => d.sentence1)[0];
    const sentence2 = data.map((d) => d.sentence2)[0];
    const gold_label = data.map((d) => d.gold_label)[0];
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
        // update the counterfactual table
        queryBackendDisplayData(`upload-submitted-data?sentence1=` + sentence1 + '&sentence2=' + sentence2).then((response) => {
      setCFLabeled(response);
        // update the embeddings of the counterfactuals
    })
    };
    useEffect(handleUpdateLabeled, [data])

    const tour = useTour(STEPS, "LS_KEY");

 //<LabeledTable CFLabeled={CFLabeled} mode={mode}/>
    // all const above are lists ( with only one entry )
    // to display the first nli entry we access the first element in each list below
    ///className="Vis"
    return  (
        <div className='demo-wrapper'>
            {tour}
            {/* <Button variant={"contained"} onClick={useTour(STEPS, "LS_KEY")}> Activate Lasers </Button> */}
            {/* <button onClick={() => setRun(false)}>Click me! </button> */}
            <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                <Grid item xs={6}>
                <div className="demo_box_sentencepair">
                    <BoxSentencePair sentence1={sentence1}
                                    sentence2={sentence2}
                                    gold_label={gold_label}
                                    incrCount={incrCount}
                                    decrCount={decrCount}
                                    />
                </div>
                </Grid>
                <Grid item xs={6}>
                    <div className="demo_box_polyjuice">
                        <BoxPolyjuice suggestion={suggestion} setCount={setCfCount} count={cfCount} mode={mode} UpdateLabeled={handleUpdateLabeled}/>
                    </div>
                </Grid>
                <Grid item xs={6}>
                    <div className="demo_box_labeledtable">
                        {CFLabeled && <LabeledTable CFLabeled={CFLabeled} mode={mode}/>}
                    </div>
                </Grid>
                <Grid item xs={6}>
                    <div className="demo_box_CF">
                        <BoxCF  sentence1={sentence1}
                        sentence2={sentence2}
                        gold_label={gold_label}
                        suggestion={suggestion}
                        setCount={setCfCount}
                        count={cfCount}
                        setCFList={setCFList}
                        cflist={cflist}
                        cflabellist={cflabellist}
                        setCFLabelList={setCFLabelList}
                        cfsimilaritylist={cfsimilaritylist}
                        setCFSimilarityList={setCFSimilarityList}
                        mode={mode} UpdateLabeled={handleUpdateLabeled}
                        />
                    </div>
                </Grid>
            </Grid>
        </div>
    )
};

export default Visualization;

