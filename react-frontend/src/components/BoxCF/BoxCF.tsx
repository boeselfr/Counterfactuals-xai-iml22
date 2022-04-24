import React, {useState} from 'react';
import Visualization from "../../Visualization";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import Container from '@mui/material/Container';
import {CardActions, CardContent, Typography} from "@mui/material";
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import Slider from '@mui/material/Slider';
import Divider from "@mui/material/Divider";

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

interface FormElements extends HTMLFormControlsCollection {
    counterfactual: HTMLInputElement
    cf_label: HTMLInputElement
    similarity: HTMLInputElement
}

interface YourFormElement extends HTMLFormElement {
    readonly elements: FormElements
}


const BoxCF: React.FunctionComponent<Props> = ({
                                                   sentence1,
                                                   sentence2,
                                                   gold_label,
                                                   suggestion,
                                                   count,
                                                   cflist,
                                                   cflabellist,
                                                   cfsimilaritylist,
                                                   mode,
                                                   UpdateLabeled
                                               }: Props) => {
    const [cf, setCF] = useState('')
    const [cflabel, setcflabel] = useState('Neutral')
    const [similarity, setsimilarity] = useState(50)
    const [buttonState, setButtonState] = useState(['buttonCF', 'buttonCF', 'buttonCF'])

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
        // trigger an update of the labeled list as there is a new entry now:

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


    return (
        <Container fixed>
            <Card elevation={3}>
                <CardContent>
                    <Typography variant="h4" component="div"> Submit Counterfactuals
                        Here </Typography>
                    <Divider />
                    <Box
                        component="form"
                        sx={{
                            '& > :not(style)': {my: 3, mx: 2},
                        }}
                        noValidate
                        autoComplete="on"
                    >
                        <div>
                            <TextField
                                fullWidth
                                required
                                id="counterfactual"
                                label="Required"
                                defaultValue={suggestion[count]}
                                onChange={(e) => setCF(e.target.value)}
                            />
                        </div>
                        <div>
                            <Typography variant="body1" component="div"> What label would you
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
                                    value={similarity}
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