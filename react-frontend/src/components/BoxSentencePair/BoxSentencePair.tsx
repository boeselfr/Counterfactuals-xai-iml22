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

const get_initial_cmap = (label: string) => {
    console.log(label)
    if (label == 'Neutral'){
        return ['#bfdbc6', 'grey.200', 'grey.200']
    }
    if (label == 'Entailment'){
        return ['grey.200', '#bfdbc6','grey.200']
    }
    if (label == 'Contradiction'){
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


    const [cmap, setcmap] = useState<string[]>(get_initial_cmap(gold_label) as string[])

    function getcmap(label: string) {
        console.log(label)
        if (label == 'Neutral'){
            setcmap(['#bfdbc6', 'grey.200', 'grey.200'])
        }
        if (label == 'Entailment'){
            setcmap(['grey.200', '#bfdbc6','grey.200'])
        }
        if (label  == 'Contradiction'){
            setcmap(['grey.200', 'grey.200', '#bfdbc6'])
        }
    }
    // getcmap(gold_label)

    return (
        <Container fixed>
            <Card elevation={3}>
                <CardContent>
                    <Typography variant="h4"> Original Sentence Pairs </Typography>
                    <Divider />
                        {/* <Stack alignItems="center" justifyContent="center" spacing={2} direction="row" sx={{ p: 2, my: 2}}>
                            <Button variant="contained" onClick={decrCount}>Previous Sentence Pair</Button>
                            <Button variant="contained" onClick={incrCount}>Next Sentence Pair</Button>
                        </Stack> */}
                    <Box sx={{ my: 4, mx: 2 }}>
                    <Stack alignItems="center" justifyContent="center" spacing={2} direction="row" sx={{p: 1}}>
                        <Button variant="contained"  onClick={(e) => {decrCount(); getcmap(gold_label); setRobertaLabel('-')}}> <ArrowBackIosNewIcon /> </Button>
                        <Stack alignItems={"flex"} justifyContent={"flex"} spacing={1} sx={{ my: 3, mx: 2, width: "80%"}}>

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
                                            <Box sx={{backgroundColor: cmap[0], border: 1, borderRadius: '4px', padding: 1, borderColor: 'grey.500'}}>  
                                                Neutral
                                            </Box>
                                            <Box sx={{backgroundColor: cmap[1], border: 1, borderRadius: '4px', padding: 1, borderColor: 'grey.500'}}>
                                                Entailment  
                                            </Box>
                                            <Box sx={{backgroundColor: cmap[2], border: 1, borderRadius: '4px', padding: 1, borderColor: 'grey.500'}}>
                                                Contradiction
                                            </Box>
                                        </Stack>
                                </Stack>
                                </Box>

                        </Stack>

                        {/* <Stack spacing={2}>
                            <Chip icon={<CheckIcon />} label={"Premise: " + sentence1} color="success"/>
                            <Chip icon={<QuestionMarkIcon />} label={"Hypothesis: " + sentence2} color="secondary"/>
                        </Stack> */}
                            <Button variant="contained" onClick={(e) => {incrCount(); getcmap(gold_label); setRobertaLabel('-')}}><ArrowForwardIosIcon/></Button>
                    </Stack>
                    </Box>
                </CardContent>

            </Card>
        </Container>);
};

export default SentencePairBox