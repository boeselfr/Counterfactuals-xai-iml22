import React, {useState, useRef} from 'react';
import Visualization from "../../Visualization";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import Container from '@mui/material/Container';
import {
    CardActions,
    CardContent, Chip,
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
import CheckIcon from '@mui/icons-material/Check';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';

import {queryBackendStr} from "../../backend/BackendQueryEngine";
import {JsonDecoder} from "ts.data.json";

interface Props {
    sentence1: string;
    sentence2: string;
    cf: string;
    gold_label: string;
    robertaLabel: string;
    setRobertaLabel: any;
    mode: string;
    UpdateLabeled: any;
}


const BoxCF: React.FunctionComponent<Props> = ({
                                                   sentence1,
                                                   sentence2,
                                                   cf,
                                                   gold_label,
                                                   robertaLabel,
                                                   setRobertaLabel,
                                                   mode,
                                                   UpdateLabeled
                                               }: Props) => {
    const [cflabel, setcflabel] = useState('Neutral')
    const [similarity, setsimilarity] = useState(50)


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

    const handleRobertaQuery = () => {
        queryBackendStr(`roberta-label?sentence1=${sentence1}&sentence2=${cf}`).then((response) => {
            setRobertaLabel(response)
        });
    };


    return (
        <Container fixed>
            <Card elevation={3}>
                <CardContent>
                    <Typography variant="h4" component="div"> <strong>Step 4: </strong> label and submit the hypothesis
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
                        <Stack spacing={2}>

                            <Chip icon={<CheckIcon />} label={"Premise: " + sentence1} />
                            <Chip icon={<QuestionMarkIcon />} label={"Hypothesis: " + cf} color="secondary"/>
                        </Stack>
                            {/*<TextField*/}
                            {/*    fullWidth*/}
                            {/*    required*/}
                            {/*    id="counterfactual"*/}
                            {/*    label="Required"*/}
                            {/*    defaultValue={cf}*/}
                            {/*    key={cf} // very hacky way to re-render default value*/}
                            {/*/>*/}

                        <Box sx={{
                            border: 1,
                            borderRadius: '4px',
                            padding: 3,
                            borderColor: 'grey.500'
                        }}>
                            <Grid
                                container
                                spacing={0}
                                direction="column"
                                alignItems="center"
                                justifyContent="center"

                            >
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
                                <Grid container columnSpacing={0} alignItems="center">
                                    <Grid item xs={2}>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Button variant={"contained"}
                                                onClick={handleRobertaQuery}>
                                            See The Suggested Label
                                        </Button>
                                    </Grid>
                                    <Grid item xs={4}>
                                        {robertaLabel}
                                    </Grid>
                                    <Grid item xs={2}>
                                    </Grid>
                                </Grid>
                                <br/>
                                {/* <Typography variant="body1" component="div"> How similar is
                                    this
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
                                </Box> */}
                            </Grid>
                        </Box>


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