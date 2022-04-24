import React from 'react';
import './boxsentencepair.css'
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Card from "@mui/material/Card";
import Divider from '@mui/material/Divider';

import {CardActions, CardContent, Typography} from "@mui/material";


interface Props {
    sentence1: string;
    sentence2: string;
    gold_label: string;
    incrCount: any;
    decrCount: any
}


const SentencePairBox: React.FunctionComponent<Props> = ({
                                                             sentence1,
                                                             sentence2,
                                                             gold_label,
                                                             incrCount,
                                                             decrCount
                                                         }: Props) => {
    return (
        <Container fixed>
            <Card elevation={3}>
                <CardContent>
                    <Typography variant="h4"> Original Dataset </Typography>
                    <Divider />
                    <Box sx={{ my: 3, mx: 2 }}>
                    <Typography variant="body1"> <strong>Premise:</strong> {sentence1}
                    </Typography>
                    <Typography variant="body1"> <strong>Hypothesis:</strong> {sentence2}
                    </Typography>
                    <Typography variant="body1"> <strong>Label:</strong> {gold_label}
                    </Typography>
                    </Box>
                </CardContent>

                <CardActions>
                    <Stack spacing={2} direction="row" sx={{ p: 2 }}>
                        <Button variant="contained" onClick={decrCount}>Previous</Button>
                        <Button variant="contained" onClick={incrCount}>Next</Button>
                    </Stack>
                </CardActions>
            </Card>
        </Container>);
};

export default SentencePairBox