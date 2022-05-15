import React, {ChangeEvent, useRef, useState} from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import {
    CardActions,
    CardContent,
    CardHeader, FilledInput,
    FormControl, InputLabel, MenuItem,
    TextField,
    Typography
} from "@mui/material";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Box from '@mui/material/Box';
import Grid from "@mui/material/Grid";
import Select, {SelectChangeEvent} from "@mui/material/Select";
import {queryBackendStr} from "../../backend/BackendQueryEngine";

interface Props {
    suggestion: string[];
    count: number;
    setCount: any;
    sentence1: string;
    sentence2: string;
    cf: string;
    setCF: any;
    mode: string;
    UpdateLabeled: any;
}

const BoxPolyjuice: React.FunctionComponent<Props> = ({
                                                          suggestion,
                                                          count,
                                                          setCount,
                                                          sentence1,
                                                          sentence2,
                                                          cf,
                                                          setCF,
                                                          mode,
                                                          UpdateLabeled
                                                      }: Props) => {


    const textArea = useRef<any>(null);
    const [selectSpan, setSpan] = useState([0, 0]);
    const [code, setCode] = useState("negation");

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

    const handleCode = (event: SelectChangeEvent) => {
        setCode(event.target.value);
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
        if (count >= 1) {
            setCount(count - 1)
        }
        UpdateLabeled()
    };


    return (
        <Container fixed>
            <Card elevation={3}>
                <CardContent>
                    <Typography variant="h4" component="div"> <strong>Step 2: </strong> write a new hypothesis
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

                    <Box sx={{
                        border: 1,
                        borderRadius: '4px',
                        padding: 3,
                        borderColor: 'grey.500'
                    }}>

                        <Typography variant="body1">
                            <strong>Suggested {mode}:</strong> {suggestion[count]}
                        </Typography>
                        <Stack
                            alignItems="center"
                            justifyContent="center" spacing={2} direction="row" sx={{p: 1}}>
                            <Button variant="contained"
                                    onClick={() => navigator.clipboard.writeText(suggestion[count])}>Copy</Button>
                            <Button variant="contained"
                                    onClick={decrSuggestion}>Previous</Button>

                            <Button variant="contained" onClick={incrSuggestion}>Next</Button>
                        </Stack>
                    </Box>

                    <Box sx={{
                        border: 1,
                        borderRadius: '4px',
                        padding: 3,
                        borderColor: 'grey.500'
                    }}>
                        <Grid container>
                            <Grid item xs={10}>
                                <TextField fullWidth id="counterfactual" inputRef={textArea}
                                           label="New Hypothesis"
                                           defaultValue={cf}
                                           key={cf}
                                           onSelect={handleSelect}
                                    // value={cf}
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
                            <br/>
                            <Button variant={"contained"} onClick={handleSuggest}>
                                Modify
                            </Button>

                        </Grid>
                    </Box>
                    </Box>
                </CardContent>

            </Card>
        </Container>
    );
};

export default BoxPolyjuice