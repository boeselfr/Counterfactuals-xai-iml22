import React from 'react';
import './boxtable.css';
import {NLISubmissionDisplay} from "../../types/NLISubmissionDisplay";
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import {Divider, Typography} from "@mui/material";
import Box from '@mui/material/Box';

import {DataGrid, GridColDef} from '@mui/x-data-grid';


interface Props {
    CFLabeled: NLISubmissionDisplay;
    mode: string;
}

const LabeledTable: React.FunctionComponent<Props> = ({CFLabeled, mode}: Props) => {
    const columns: GridColDef[] = [
        {field: 'id', headerName: 'ID', flex: 0.1, },
        {field: 'Neutral', headerName: 'Neutral', flex: 0.3},
        {field: 'Entailment', headerName: 'Entailment', flex: 0.3},
        {field: 'Contradiction', headerName: 'Contradiction', flex: 0.3},
    ];

    return (
        <Container fixed>
            <Paper elevation={3} sx={{p: 2}}>
                <Typography variant="h4"> List of Generated Counterfactuals </Typography>
                <Divider />
                <Box sx={{ my: 3, mx: 2 }}>
                <div style={{ height: 400, width: '100%' }}>
                    <DataGrid
                        rows={CFLabeled}
                        columns={columns}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        checkboxSelection
                     />
                </div>
                </Box>
            </Paper>
        </Container>
    );
};
export default LabeledTable

// const LabeledTable: React.FunctionComponent<Props> = ({CFLabeled, mode}: Props) => {
//     // put the mode in here for future switches between hypothesis and premise lookups
//     // console.log(CFLabeled.map((key, item) => {key}))
//     return <div>
//          <span className='titleT'>
//                 List of Labeled CFs
//             </span>
//             <table>
//       <thead>
//         <tr>
//           <th>Neutral</th>
//           <th>Entailment</th>
//           <th>Contradiction</th>
//         </tr>
//       </thead>
//       <tbody>

//         {CFLabeled.map(item => {
//           return (
//             <tr >
//               <td>{ item.Neutral }</td>
//               <td>{ item.Entailment }</td>
//               <td>{ item.Contradiction }</td>
//             </tr>
//           );
//         })}
//       </tbody>
//     </table>
//     </div>
// }

// export default LabeledTable