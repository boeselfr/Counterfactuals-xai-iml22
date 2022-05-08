import React, {ChangeEvent, useRef, useState} from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import {
    CardActions,
    CardContent,
    CardHeader, FilledInput,
    FormControl, InputLabel,
    TextField,
    Typography
} from "@mui/material";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Box from '@mui/material/Box';

interface Props {
    suggestion: string[];
    count: number;
    setCount: any;
    mode: string;
    UpdateLabeled: any;
}

const BoxPolyjuice: React.FunctionComponent<Props> = ({
                                                          suggestion,
                                                          count,
                                                          setCount,
                                                          mode,
                                                          UpdateLabeled
                                                      }: Props) => {



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
                    <Typography variant="h4" component="div"> <strong>Step 2: </strong> find
                        and copy a new hypothesis as a base for the counterfactual
                    </Typography>
                    <Divider/>
                    <Box sx={{my: 3, mx: 2}}>
                        <Typography variant="body1">
                            <strong>New {mode}:</strong> {suggestion[count]}
                        </Typography>

                    </Box>
                </CardContent>

                <CardActions>
                    <Stack spacing={2} direction="row" sx={{p: 2}}>
                        <Button variant="contained"
                                onClick={() => navigator.clipboard.writeText(suggestion[count])}>Copy</Button>
                        <Button variant="contained" onClick={decrSuggestion}>Previous</Button>

                        <Button variant="contained" onClick={incrSuggestion}>Next</Button>
                    </Stack>
                </CardActions>


            </Card>
        </Container>
    );
};

export default BoxPolyjuice