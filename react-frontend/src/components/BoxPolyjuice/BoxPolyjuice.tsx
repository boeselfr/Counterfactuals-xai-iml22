import React, {ChangeEvent, useEffect, useRef, useState} from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import {
    CardActions,
    CardContent,
    CardHeader, FilledInput,
    MenuItem,
    TextField
} from "@mui/material";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Box from '@mui/material/Box';
import Grid from "@mui/material/Grid";
import Select, {SelectChangeEvent} from "@mui/material/Select";
import {queryBackendStr} from "../../backend/BackendQueryEngine";

import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {styled} from "@material-ui/core/styles";


interface Props {
    suggestion: string[];
    count: number;
    setCount: any;
    sentence1: string;
    sentence2: string;
    gold_label: string;
    cf: string;
    setCF: any;
    robertaLabel: string;
    setRobertaLabel: any;
    mode: string;
    UpdateLabeled: any;
}


const BoxPolyjuice: React.FunctionComponent<Props> = ({
                                                          suggestion,
                                                          count,
                                                          setCount,
                                                          sentence1,
                                                          sentence2,
                                                          gold_label,
                                                          cf,
                                                          setCF,
                                                          robertaLabel,
                                                          setRobertaLabel,
                                                          mode,
                                                          UpdateLabeled
                                                      }: Props) => {


    const textArea = useRef<any>(null);
    const [selectSpan, setSpan] = useState([0, 0]);
    const [code, setCode] = useState("negation");
    const [cflabel, setcflabel] = useState('Neutral')


    const handleUpdateSentence = () => {
        setCF(sentence2)
        setCount(1)
    }

    useEffect(handleUpdateSentence, [sentence1])

    const SNAP_TO_WORD_BOUNDARY = true;

    const handleSelect = () => {
        let textInput = textArea.current;
        console.log(textInput);
        if (textInput) {
            // Snap selections to the word boundary, if this option is enabled.
            let singletonSelection: boolean = textInput.selectionStart === textInput.selectionEnd;
            if (SNAP_TO_WORD_BOUNDARY && !singletonSelection) {
                let value: string = textInput.value;
                while (textInput.selectionStart > 0) {
                    let leftNeighbor = value[textInput.selectionStart - 1];
                    if (leftNeighbor !== ' ') {
                        textInput.selectionStart -= 1;
                    } else {
                        break;
                    }
                }
                while (textInput.selectionEnd < value.length) {
                    let rightNeighbor = value[textInput.selectionEnd];
                    if (rightNeighbor !== ' ') {
                        textInput.selectionEnd += 1;
                    } else {
                        break;
                    }
                }
            }

            let cursorStart = textInput.selectionStart;
            let cursorEnd = textInput.selectionEnd;
            setSpan([cursorStart, cursorEnd]);
        } else {
            setSpan([0, 0]); // IDEA: set to null and disable polyjuice button?
        }
    }

    const handleSubmit = () => {
        const input_cf = cf;
        const input_cf_label = cflabel;

        if (input_cf === '') {
            alert('Please enter a counterfactual')
            return
        }

        console.log(input_cf)
        console.log(input_cf_label)

        // create new data submission entry for backend:
        const data = {
            "sentence1": sentence1,
            "sentence2": sentence2,
            "gold_label": gold_label,
            "suggestionRP": "",
            "suggestionRP_label": "",
            "suggestionRH": "",
            "suggestionRH_label": "",
        }

        // insert suggestion and labels depending on mode:
        if (mode == "Hypothesis") {
            data["suggestionRH"] = input_cf
            data["suggestionRH_label"] = input_cf_label
        } else if (mode == "Premise") {
            data["suggestionRP"] = input_cf
            data["suggestionRP_label"] = input_cf_label
        }

        fetch("http://127.0.0.1:8000/submit-data", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        }).then(UpdateLabeled())

    }

    const handleSuggest = () => {
        queryBackendStr(`ask-poly?sentence1=${sentence1}&sentence2=${cf}&code=${code}&start_idx=${selectSpan[0]}&end_idx=${selectSpan[1]}`).then((response) => {
            setCF(response);
        });
    }

    const handleCode = (event: SelectChangeEvent) => {
        setCode(event.target.value);
    };

    const handleRobertaQuery = () => {
        queryBackendStr(`roberta-label?sentence1=${sentence1}&sentence2=${cf}`).then((response) => {
            setRobertaLabel(response)
        });
    };

    const codesItems = []
    const codeOptions = ["negation", "quantifier", "lexical", "resemantic", "insert", "shuffle", "restructure"]
    for (const c of codeOptions) {
        codesItems.push(<MenuItem value={c} key={c}>{c}</MenuItem>)
    }


    const incrSuggestion = () => {
        if (count < suggestion.length - 1) {
            setCount(count + 1)
        }
        // need to update corresponding displayed table in case sentence pair changes
        UpdateLabeled()
    };

    const decrSuggestion = () => {
        if (count > 1) {
            setCount(count - 1)
        }
        UpdateLabeled()
    };

    const onCopyButtonClick = (newHypothesis: string) => {
        let input = textArea.current;
        input.value = newHypothesis;
        input.defaultValue = newHypothesis;
        console.log(input.value);
    }
    
    const BLANK_CHAR = "ㅤㅤ"

    return (
        <Container fixed style={{ border: 0, boxShadow: "none" }}>
            <Typography variant="h4" component="div"> Submit a new Hypothesis </Typography>
            <Divider/>
            <Stack alignItems={"flex"} justifyContent={"center"} spacing={1} sx={{ my: 3, mx: 2, width: "100%"}}>

            <Box sx={{backgroundColor: 'grey.200', border: 1, borderRadius: '4px', padding: 1, borderColor: 'grey.500'}}>
                        <Typography variant="body1"> <strong>Premise:</strong> {sentence1} </Typography>
            </Box>
            
            <Box sx={{
                backgroundColor: 'primary.light',
                border: 1,
                borderRadius: '4px',
                padding: 3,
                borderColor: 'grey.500',
            }}>

            <Stack spacing={2}>
            <div className='alter_hypothesis'>
                <Grid container>
                    <Grid item xs={9}>
                        <TextField fullWidth id="counterfactual" inputRef={textArea}
                                    // variant="standard"
                                label={"✍ Your New Hypothesis:" + BLANK_CHAR.repeat(10) + "."}
                                value={cf}
                                onSelect={handleSelect}
                                onChange={(e) => {setCF(e.target.value); setRobertaLabel('-');}}
                                sx={{
                                    "& .MuiInputLabel-root": {
                                        color: "black",
                                        "font-weight": "bold",
                                        // "font-size": 20,
                                    },
                                    "& label.Mui-focused": {
                                        // Override default styling,
                                        // Which change the label to be smaller font
                                        // color: "black",
                                    },
                                    "& .MuiOutlinedInput-input": { // Defunct
                                        "&::selection": {
                                            color: "white",
                                            background: "purple",
                                        }
                                    }
                                }}
                                inputProps={{fontSize: 30}}
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <Select
                            labelId="demo-simple-select-autowidth-label"
                            id="demo-simple-select-autowidth"
                            value={code}
                            onChange={handleCode}
                            autoWidth
                            label="Manipulate"
                        >
                            {codesItems}
                        </Select>
                    </Grid>

                </Grid>

                <Grid
                    container
                    spacing={0}
                    direction="column"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Button variant={"contained"} onClick={handleSuggest}>
                        🤖  Automatically Modify Selected Area
                    </Button>
                </Grid>

                </div>
                <div className='polyjuice_suggestions'>

                <Accordion sx={{
                            border: 1,
                            borderRadius: '4px',
                            borderColor: 'grey.500',
                            backgroundColor: 'primary.light'
                        }}>
                    <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    >
                    <Typography> <strong>🤖    Hypothesis Suggestions</strong> </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                    <Box sx={{
                            // border: 1,
                            borderRadius: '4px',
                            borderColor: 'grey.500',
                        }}>

                            <Typography variant="body1">
                                {suggestion[count]}
                            </Typography>
                            <Stack
                                alignItems="center"
                                justifyContent="center" spacing={2} direction="row" sx={{p: 1}}>
                                <Button variant="contained"
                                        // onClick={() => navigator.clipboard.writeText(suggestion[count])}>Copy</Button>
                                    // onClick={() => onCopyButtonClick(suggestion[count])}>Copy</Button>
                                        onClick={() => onCopyButtonClick(suggestion[count])}> Copy </Button>
                                <Button variant="contained"
                                        onClick={decrSuggestion}>Previous</Button>

                                <Button variant="contained" onClick={incrSuggestion}>Next</Button>
                            </Stack>
                        </Box>
                    </AccordionDetails>
                </Accordion>
                </div>
                </Stack>
                </Box>

                
                <Box sx={{backgroundColor: '#e0eaed', border: 1, borderRadius: '4px', padding: 1, borderColor: 'grey.500'}}>
                <Stack className='label_tour' alignItems={"center"} justifyContent={"flex-start"} direction="row" spacing={4} sx={{p: 1}}>
                {/* <div className='label_tour'> */}

                        <Box> <strong>✍  Label the Hypothesis</strong> </Box>
                        <RadioGroup
                            row
                            aria-labelledby="demo-row-radio-buttons-group-label"
                            name="row-radio-buttons-group"
                            sx={{}}
                        >
                            <FormControlLabel value="Entailment" control={<Radio/>}
                                                sx={{"& .MuiFormControlLabel-label": {color: "green"}}}
                                                label="Entailment" onClick={(e) => {
                                setcflabel('Entailment');
                            }}/>
                            <FormControlLabel value="Neutral" control={<Radio/>}
                                                label="Neutral"
                                                sx={{"& .MuiFormControlLabel-label": {color: "gray"}}}
                                                onClick={(e) => {
                                setcflabel('Neutral');
                            }}/>
                            <FormControlLabel value="Contradiction" control={<Radio/>}
                                                sx={{"& .MuiFormControlLabel-label": {color: "red"}}}
                                                label="Contradiction" onClick={(e) => {
                                setcflabel('Contradiction');
                            }}/>
                        </RadioGroup>
                        <Stack width={"70%"} spacing={1} alignItems={'center'}>
                            <Button variant={"contained"} onClick={handleRobertaQuery}> 
                                    🤖   Label Suggestion
                            </Button>
                            <Typography variant="body1">
                                {robertaLabel.toLowerCase().charAt(0).toUpperCase() + robertaLabel.toLowerCase().slice(1)}
                            </Typography>
                        </Stack>
                    </Stack>
                    </Box>
                    <Button variant={"contained"} onClick={handleSubmit}>
                        Submit New Hypothesis
                    </Button>
                </Stack>
        </Container>
    );
};

export default BoxPolyjuice
