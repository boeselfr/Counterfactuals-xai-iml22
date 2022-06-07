import React, {useState} from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Card from "@mui/material/Card";
import Divider from '@mui/material/Divider';

import {Chip} from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import Grid from '@mui/material/Grid';


import {CardActions, CardContent, Typography} from "@mui/material";
import { elementAcceptingRef } from '@mui/utils';


interface Props {
    sentence1: string;
    sentence2: string;
    gold_label: string;
    incrCount: any;
    decrCount: any;
    robertaLabel: string;
    setRobertaLabel: any;
}

const get_cmap = (label: string) => {
    console.log(label)
    if (label == 'neutral'){
        return ['#bfdbc6', 'grey.200', 'grey.200']
    }
    if (label == 'entailment'){
        return ['grey.200', '#bfdbc6','grey.200']
    }
    if (label == 'contradiction'){
        return ['grey.200', 'grey.200', '#bfdbc6']
    }
}

const SentencePairBox: React.FunctionComponent<Props> = ({
                                                             sentence1,
                                                             sentence2,
                                                             gold_label,
                                                             incrCount,
                                                             decrCount,
                                                             robertaLabel,
                                                             setRobertaLabel,
                                                         }: Props) => {

    return (
        <Container fixed>
            <Typography variant="h4"> Original Sentence Pairs </Typography>
            <Divider />
            <Box sx={{ my: 4, mx: 2 }}>
            <Stack alignItems="center" justifyContent="center" spacing={2} direction="row" sx={{p: 1}}>
                <Button variant="contained"  onClick={(e) => {decrCount(); setRobertaLabel('-')}}> <ArrowBackIosNewIcon /> </Button>
                <div className="sentencepair_tour">
                <Stack alignItems={"flex"} justifyContent={"flex"} spacing={1} sx={{ my: 3, mx: 2, width: "93%"}}>

                    <Box sx={{backgroundColor: 'grey.200', border: 1, borderRadius: '4px', padding: 1, borderColor: 'grey.500'}}>
                        <Typography variant="body1"> <strong>Premise:</strong> {sentence1} </Typography>
                    </Box>
                    <Box sx={{backgroundColor: 'primary.light', border: 1, borderRadius: '4px', padding: 1, borderColor: 'grey.500'}}>
                        <Typography variant="body1"> <strong>Hypothesis:</strong> {sentence2} </Typography>
                    </Box>
                    <Box sx={{backgroundColor: '#e0eaed', border: 1, borderRadius: '4px', padding: 1, borderColor: 'grey.500'}}>
                        <Stack alignItems={"center"} justifyContent={"center"} direction="row" sx={{p: 1}}>
                            <Box> <strong>Label</strong></Box>
                                <Stack direction="row" spacing={3} sx={{p: 2}}>
                                    <Box sx={{backgroundColor: (get_cmap(gold_label) as string[])[0], border: 1, borderRadius: '4px', padding: 1, borderColor: 'grey.500'}}>  
                                        Neutral
                                    </Box>
                                    <Box sx={{backgroundColor: (get_cmap(gold_label) as string[])[1], border: 1, borderRadius: '4px', padding: 1, borderColor: 'grey.500'}}>

                                        Entailment  
                                    </Box>
                                    <Box sx={{backgroundColor: (get_cmap(gold_label) as string[])[2], border: 1, borderRadius: '4px', padding: 1, borderColor: 'grey.500'}}>
                                        Contradiction
                                    </Box>
                                </Stack>
                            {/* </div> */}
                        </Stack>
                        </Box>
                </Stack>
                </div>

                    <Button variant="contained" onClick={(e) => {incrCount(); setRobertaLabel('-')}}><ArrowForwardIosIcon/></Button>
            </Stack>
            </Box>
        </Container>);
};

export default SentencePairBox