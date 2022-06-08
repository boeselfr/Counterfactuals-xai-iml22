import React, {useEffect, useState} from 'react';
import {NLIDataArray} from "./types/NLIDataArray";
import BoxSentencePair from "./components/BoxSentencePair/BoxSentencePair";
import BoxPolyjuice from "./components/BoxPolyjuice/BoxPolyjuice";
import LabeledTable from "./components/BoxTable/BoxTable";
import BoxCF from "./components/BoxCF/BoxCF";
import {
    queryBackendDisplayData,
    queryBackendEmbedding,
    queryBackendDisplayDataGraph
} from "./backend/BackendQueryEngine";
import {NLISubmissionDisplay} from "./types/NLISubmissionDisplay";
import {NLIEmbeddingArray} from "./types/NLIEmbeddingArray";
import VarianceGraph from "./components/VarianceGraph/VarianceGraph";
// import Image from 'react-native-image-resizer';
import EmbeddingPlot from "./components/EmbeddingPlot/EmbeddingPlot";

import Button from "@mui/material/Button";
import Grid from '@mui/material/Grid';

import {Step} from "react-joyride";
import {NLISubmissionDisplayGraph} from "./types/NLISubmissionDisplayGraph";
import useTour from "./useTour_button";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Typography from "@mui/material/Typography";
import Container from '@mui/material/Container';
import Card from "@mui/material/Card";
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';


interface Props {
    data: NLIDataArray;
    incrCount: any;
    decrCount: any;
}

// for the counterfatcual examples: probably need to make sure they cover all codes and possible changes in the labels
const STEPS: Step[] = [
{
    content: <h2>Welcome. Let us guide you through the process of generating
        counterfactuals!</h2>,
    locale: {skip: <strong aria-label="skip">Skip Introduction</strong>},
    placement: "center",
    target: "body",
},
{
    content: (
        <div>
            <small>The sentence pair is given as a premise and hypothesis. The task of our
                model is to determine, given a premise sentence,
                whether a hypothesis sentence is true (entailment), false (contradiction)
                or neither (neutral). See following examples.</small>
        </div>),
    placement: "top",
    target: ".sentencepair_tour",
    title: (<div><h3> SELECT THE ORIGINAL SENTENCE PAIR</h3></div>)
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
    target: ".sentencepair_tour",
    title: (<div><h3>SENTENCE PAIR EXAMPLES</h3></div>)
},
{
    content: (
        <small>
            <div>
                <strong> Premise: </strong> A man inspects the uniform of a figure in some
                East Asian country.
            </div>
            <div>
                <strong> Hypothesis: </strong> The man is sleeping.
            </div>
            <div>
                <strong> Label: </strong> Contradiction
            </div>
        </small>),
    placement: "top",
    target: ".sentencepair_tour",
    title: (<div><h3>SENTENCE PAIR EXAMPLES</h3></div>)
},
{
    content: (
        <small>
            <div>
                <strong> Premise: </strong> An older and younger man smiling.
            </div>
            <div>
                <strong> Hypothesis: </strong> Two men are smiling and laughing at the
                cats playing on the floor.
            </div>
            <div>
                <strong> Label: </strong> Neutral
            </div>
        </small>),
    placement: "top",
    target: ".sentencepair_tour",
    title: (<div><h3>SENTENCE PAIR EXAMPLES</h3></div>)
}, {
    content: (<small> Your task is to help us generate a <strong>Counterfactual
        Dataset</strong> by creating
        counterfactual examples. The idea of a counterfactual example is to
        be <strong>similar</strong> to the originally presented
        sentence pair, yet <strong>different in meaning</strong>. The new counterfactual
        sentence pair can have a different label
        than the original pair. For now we will focus on changing the hypothesis.
        Let's have a look at some examples:
    </small>),
    placement: "top",
    target: ".sentencepair_tour",
    title: (<div><h3>THE TASK</h3></div>)
},
{
    content: (
        <small>
            <div>
                <strong> Premise: </strong> A soccer game with multiple males playing.
            </div>
            <div>
                <strong> Hypothesis: </strong> Some men are playing a <del>sport</del>
                <ins>instrument</ins>
                .
            </div>
            <div>
                <strong> Label: </strong>
                <del>Entailment</del>
                <ins>Contradiction</ins>
            </div>
        </small>),
    placement: "top",
    target: ".sentencepair_tour",
    title: (<div><h3>COUNTERFACTUAL EXAMPLES</h3></div>)
}, {
    content: (
        <small>
            <div>
                <strong> Premise: </strong> A soccer game with multiple males playing.
            </div>
            <div>
                <strong> Hypothesis: </strong> Some men are playing a sport <ins>for the
                first time</ins>.
            </div>
            <div>
                <strong> Label: </strong>
                <del>Entailment</del>
                Neutral
            </div>
        </small>),
    placement: "top",
    target: ".sentencepair_tour",
    title: (<div><h3>COUNTERFACTUAL EXAMPLES</h3></div>)
}, {
    content: (
        <small>
            <div>
                <strong> Premise: </strong> A soccer game with multiple males playing.
            </div>
            <div>
                <strong> Hypothesis: </strong> Some men are <del>playing</del>
                <ins>watching</ins>
                a sport.
            </div>
            <div>
                <strong> Label: </strong>
                <del>Entailment</del>
                <ins>Contradiction</ins>
            </div>
        </small>),
    placement: "top",
    target: ".sentencepair_tour",
    title: (<div><h3>COUNTERFACTUAL EXAMPLES</h3></div>)
},
{
    content: (<small> Select a subset of the sentence and let Polyjuice change the selected part with one of the following prompts displayed in the following examples: <br/>
        - <strong>negation</strong>:  A dog is <Typography display="inline" fontSize={14} bgcolor='#f9cbca'>not</Typography> embraced by the woman.<br/>
        - <strong>quantifier</strong>: <Typography display="inline" fontSize={14} bgcolor='#f9cbca'>A dog is</Typography> 
        <ArrowForwardIcon sx={{ fontSize: 10 }}/> 
        <Typography display="inline" fontSize={14} bgcolor='#9cd3b2'>Three dogs are</Typography> embraced by the woman. <br/>
        - <strong>shuffle</strong>: A <Typography display="inline" fontSize={14} bgcolor='#f9cbca'>dog</Typography> 
        <ArrowForwardIcon sx={{ fontSize: 10 }}/> 
        <Typography display="inline" fontSize={14} bgcolor='#9cd3b2'>woman</Typography> is embraced by the <Typography display="inline" fontSize={14} bgcolor='#f9cbca'>woman</Typography> 
        <ArrowForwardIcon sx={{ fontSize: 10 }}/> 
        <Typography display="inline" fontSize={14} bgcolor='#9cd3b2'>dog</Typography>. <br/>
        - <strong>lexical</strong>: A dog is <Typography display="inline" fontSize={14} bgcolor='#f9cbca'>embraced</Typography>
        <ArrowForwardIcon sx={{ fontSize: 10 }}/> 
        <Typography display="inline" fontSize={14} bgcolor='#9cd3b2'>attacked</Typography> by the woman. <br/>
        - <strong>resemantic</strong>: A dog is <Typography display="inline" fontSize={14} bgcolor='#f9cbca'>embraced by the woman</Typography>.
        <ArrowForwardIcon sx={{ fontSize: 10 }}/> 
        <Typography display="inline" fontSize={14} bgcolor='#9cd3b2'>wrapped in a blanket</Typography>. <br/>
        - <strong>insert</strong>: A dog is embraced by the <Typography display="inline" fontSize={14} bgcolor='#9cd3b2'>little woman</Typography>. <br/>
        - <strong>delete</strong>: A dog is embraced <Typography display="inline" fontSize={14} bgcolor='#f9cbca'>by the woman</Typography>. <br/>
        - <strong>restructure</strong>: A dog is <Typography display="inline" fontSize={14} bgcolor='#f9cbca'>embraced by</Typography> 
        <ArrowForwardIcon sx={{ fontSize: 10 }}/> 
        <Typography display="inline" fontSize={14} bgcolor='#9cd3b2'>hugging </Typography> the woman.
    </small>),
    placement: "top",
    target: ".alter_hypothesis",
    title: (<div><h3>ALTERING HYPOTHESIS</h3></div>)
},
{
    content: (<small> Draw inspiration from the polyjuice automatically generated
        counterfactuals.
        You can either: <div><strong>(a)</strong> copy and paste it directly above.</div>
        <div><strong>(b)</strong> in case the suggestion is semantically or gramatically incorrect or
            incomplete, copy and correct it above.
        </div>
        <div><strong>(c)</strong> insert a novel hypothesis sentence, independent of the suggestion.</div>

    </small>),
    placement: "top",
    target: ".polyjuice_suggestions",
    title: (<div><h3>POLYJUICE SUGGESTIONS</h3></div>)
},
{
    content: (<small> Here, you can submit a label for the hypothesis with respect to the premise. Even though it is preferred
        that you enter the label according to your own language understanding, an automatically generated label can be requested for help. </small>),
    placement: "top",
    target: ".label_tour",
    title: (<div><h3>LABEL HYPOTHESIS</h3></div>)
},
{
    content: (
        <small> The previously submitted and already existing counterfactuals are visualized
            here as a reference.
            The aim is to create a <strong>large, diverse set of
                counterfactuals</strong> (in terms of labels as well as sentence
            structure)
            for the model to get a more general understanding of language.
            Therefore, aim not do create similar/duplicate hypotheses.
        </small>),
    placement: "top",
    target: ".demo_box_tree_viz",
    title: (<div><h3>PREVIOUS HYPOTHESES VISUALIZATION</h3></div>)
}
];

const Visualization: React.FunctionComponent<Props> = ({
                                                           data,
                                                           incrCount,
                                                           decrCount
                                                       }: Props) => {
    const [cfCount, setCfCount] = useState(0);
    const [cf, setCF] = useState("");
    const [cflabellist, setCFLabelList] = useState([]);
    const [cfsimilaritylist, setCFSimilarityList] = useState([]);
    const [CFLabeled, setCFLabeled] = useState<NLISubmissionDisplayGraph>([]);
    const [CFOldLabeled, setCFOldLabeled] = useState<NLISubmissionDisplay>([]);
    const [CFOccurrences, setCFOccurrences] = useState({});
    const [CFProbabilities, setCFProbabilities] = useState({});
    const [GraphLabels, setGraphLabels] = useState(["Neutral","Entailment", "Contradiction"]);

    const [robertaLabel, setRobertaLabel] = useState('-');

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
    if (mode == 'Hypothesis') {
        suggestion = suggestionRH
    } else if (mode == 'Premise') {
        suggestion = suggestionRP
    }

    // initiate the labeled list of counterfactuals:
    const handleUpdateLabeled = () => {
        // update the counterfactual table
        queryBackendDisplayDataGraph(`upload-submitted-graph?sentence1=` + sentence1 + '&sentence2=' + sentence2 + '&labels=' + GraphLabels.toString()).then((response) => {
            setCFProbabilities(response[2]);
            setCFOccurrences(response[1]);
            setCFLabeled(response[0]);
        })
    };

    // initiate the labeled list of counterfactuals:
    const handleUpdateLabeledOld = () => {
        // update the counterfactual table
        queryBackendDisplayData(`upload-submitted-data?sentence1=` + sentence1 + '&sentence2=' + sentence2).then(
            (response) => {
                setCFOldLabeled(response);
        })
    };
    useEffect(handleUpdateLabeledOld, [data, sentence1, sentence2])

    const initializeCF = () => {
        setCF(sentence2);
        // also submit the originakl sentnce one to the submission to get the roberta output for the visualization
        // duplicates are getting filtered out in the backend
        var submitted_label = (' ' + gold_label).slice(1);
        console.log(submitted_label)
        // uppercase first letter to be consistent
        var data = {
            "sentence1": sentence1,
            "sentence2": sentence2,
            "gold_label": gold_label,
            "suggestionRH": sentence2,
            "suggestionRH_label": submitted_label.charAt(0).toUpperCase() + submitted_label.slice(1)
        };
        console.log(data)
        fetch("http://127.0.0.1:8000/submit-data", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        })
    }

    useEffect(handleUpdateLabeled, [data, GraphLabels, sentence1, sentence2])
    useEffect(handleUpdateLabeledOld, [data, GraphLabels, sentence1, sentence2])
    useEffect(initializeCF, [sentence1, sentence2])
    // const tour = useTour(STEPS, "LS_KEY");
    const tour = useTour(STEPS);

    let styleNoBorder = { border: "none", boxShadow: "none" };

    return (
        <div className='demo-wrapper'>

            <Container maxWidth={false}>
                <Stack spacing={3}>
                    <Card elevation={3}>
                    <Stack
                        direction="row"
                        divider={<Divider orientation="vertical" flexItem/>} p={2} my={2} mx={2}>
                        <Card className="demo_box_sentencepair" style={styleNoBorder}>
                                <BoxSentencePair sentence1={sentence1}
                                                sentence2={sentence2}
                                                gold_label={gold_label}
                                                incrCount={incrCount}
                                                decrCount={decrCount}
                                                robertaLabel={robertaLabel}
                                                setRobertaLabel={setRobertaLabel}
                                />
                        </Card>
                        <Card className="demo_box_polyjuice" style={styleNoBorder}>
                                <BoxPolyjuice suggestion={suggestion} setCount={setCfCount}
                                            count={cfCount}
                                            sentence1={sentence1} sentence2={sentence2} gold_label={gold_label}
                                            cf={cf} setCF={setCF} robertaLabel={robertaLabel}
                                            setRobertaLabel={setRobertaLabel}
                                            mode={mode} UpdateLabeled={handleUpdateLabeled}/>
                        </Card>
                    </Stack>
                    </Card>

                    <Card elevation={3}>
                    <Stack
                        direction="row"
                    >

                        <Card className="demo_box_tree_viz" style={styleNoBorder}>
                            {CFLabeled &&
                            <VarianceGraph
                                data={CFLabeled} occurrences={CFOccurrences}
                                probabilities={CFProbabilities} setGraphLabels={setGraphLabels}
                                UpdateLabeled={handleUpdateLabeled}/>}
                        </Card>

                        <Card className={"demo_box_table_viz"} style={styleNoBorder}>
                            {CFOldLabeled && <LabeledTable CFLabeled={CFOldLabeled}/>}
                        </Card>

                    </Stack>
                    </Card>
            </Stack>
            </Container>

            <div className='demo_box_tour_button'>
                {tour}
            </div>
        </div>
    )
};

export default Visualization;

