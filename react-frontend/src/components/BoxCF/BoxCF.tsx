import React, {useState, useRef} from 'react';
import Visualization from "../../Visualization";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import Container from '@mui/material/Container';
import {
    CardActions,
    CardContent,
    FormGroup, InputLabel,
    MenuItem,
    Switch,
    Typography
} from "@mui/material";
import Select, {SelectChangeEvent} from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import Slider from '@mui/material/Slider';
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import {queryBackendStr} from "../../backend/BackendQueryEngine";
import {JsonDecoder} from "ts.data.json";

interface Props {
    sentence1: string;
    sentence2: string;
    gold_label: string;
    suggestion: string[];
    count: number;
    setCount: any;
    cflist: string[];
    setCFList: any;
    cflabellist: string[];
    setCFLabelList: any;
    cfsimilaritylist: string[];
    setCFSimilarityList: any;
    mode: string;
    UpdateLabeled: any;
}

const BoxCF: React.FunctionComponent<Props> = ({
                                                   sentence1,
                                                   sentence2,
                                                   gold_label,
                                                   suggestion,
                                                   count,
                                                   mode,
                                                   UpdateLabeled
                                               }: Props) => {
    const [cf, setCF] = useState(suggestion[count])
    const [cflabel, setcflabel] = useState('Neutral')
    const [similarity, setsimilarity] = useState(50)
    const [selectSpan, setSpan] = useState([0, 0]);
    const [code, setCode] = useState("negation");

    const textArea = useRef<any>(null);

    const handleSelect = () => {
        let textVal = textArea.current;
        if (textVal) {
            let cursorStart = textVal.selectionStart;
            let cursorEnd = textVal.selectionEnd;
            setSpan([cursorStart, cursorEnd]);
        }
    }

    const handleSuggest = () => {
        queryBackendStr(`ask-poly?sentence1=${sentence1}&sentence2=${cf}&code=${code}&start_idx=${selectSpan[0]}&end_idx=${selectSpan[1]}`).then((response) => {
            setCF(response);
        });
    }

    const handleSubmit = () => {
        const input_cf = cf;
        const input_cf_label = cflabel;
        const input_similarity = similarity;

        if (input_cf == '') {
            alert('Please enter a counterfactual')
            return
        }

        console.log(input_cf)
        console.log(input_cf_label)
        console.log(input_similarity)

        // create new data submission entry for backend:
        const data = {
            "sentence1": sentence1,
            "sentence2": sentence2,
            "gold_label": gold_label,
            "suggestionRP": "",
            "suggestionRP_label": "",
            "suggestionRH": "",
            "suggestionRH_label": "",
            "estimated_similarity": similarity
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

    const marks = [
        {
            value: 0,
            label: 'Not similar',
        },
        {
            value: 100,
            label: 'Exact duplicate',
        },
    ];

    function valuetext(value: number) {
        return `${value}`;
    }

    const handleChange = (event: any, newValue: number | number[]) => {
        setsimilarity(newValue as number);
    };

    const handleCode = (event: SelectChangeEvent) => {
        setCode(event.target.value);
    };

    const codesItems = []
    const codeOptions = ["negation", "quantifier", "lexical", "resemantic", "insert", "shuffle", "restructure"]
    for (const c of codeOptions) {
        codesItems.push(<MenuItem value={c} key={c}>{c}</MenuItem>)
    }


    return (
        <Container fixed>
            <Card elevation={3}>
                <CardContent>
                    <Typography variant="h4" component="div"> <strong>Step 4: </strong> submit
                        the new counterfactual
                    </Typography>
                    <Divider/>
                    <Box
                        component="form"
                        sx={{
                            '& > :not(style)': {my: 3, mx: 2},
                        }}
                        noValidate
                        autoComplete="on"
                    >
                        <Grid container>
                            <Grid item xs={10}>
                                <TextField fullWidth id="counterfactual" inputRef={textArea}
                                       label="New Hypothesis"
                                       // defaultValue={suggestion[count]}
                                       onSelect={handleSelect}
                                       value={cf}
                                       onChange={(e) => setCF(e.target.value)}
                            />
                            </Grid>
                            <Grid item xs={2}>
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
                                Modify
                            </Button>
                            <br/>


                            <div>
                                <Typography variant="body1" component="div"> What label would
                                    you
                                    give to this counterfactual? </Typography>

                                <RadioGroup
                                    row
                                    aria-labelledby="demo-row-radio-buttons-group-label"
                                    name="row-radio-buttons-group"
                                >
                                    <FormControlLabel value="Neutral" control={<Radio/>}
                                                      label="Neutral" onClick={(e) => {
                                        setcflabel('Neutral');
                                    }}/>
                                    <FormControlLabel value="Entailment" control={<Radio/>}
                                                      label="Entailment" onClick={(e) => {
                                        setcflabel('Entailment');
                                    }}/>
                                    <FormControlLabel value="Contradiction" control={<Radio/>}
                                                      label="Contradiction" onClick={(e) => {
                                        setcflabel('Contradiction');
                                    }}/>
                                </RadioGroup>

                            </div>
                        </Grid>
                        <div>
                            <Typography variant="body1" component="div"> How similar is this
                                counterfactual to the previous ones? </Typography>
                            <Box m="auto" display="flex" alignItems="center"
                                 justifyContent="center" sx={{width: 300}}>
                                <Slider
                                    aria-label="Custom marks"
                                    defaultValue={20}
                                    getAriaValueText={valuetext}
                                    step={10}
                                    valueLabelDisplay="auto"
                                    marks={marks}
                                    onChange={handleChange}
                                />
                            </Box>
                        </div>
                        <Button variant={"contained"} onClick={handleSubmit}>
                            Submit
                        </Button>
                    </Box>

                </CardContent>
            </Card>
        </Container>
    )

};

export default BoxCF