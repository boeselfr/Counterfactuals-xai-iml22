import React from 'react';
import {NLISubmissionDisplay} from "../../types/NLISubmissionDisplay";
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import {Divider, IconButton, Typography} from "@mui/material";
import Box from '@mui/material/Box';

import DeleteIcon from "@mui/icons-material/Delete";
import CopyIcon from "@mui/icons-material/ContentCopy";

import {DataGrid, GridColDef} from '@mui/x-data-grid';


interface Props {
    CFLabeled: NLISubmissionDisplay;
    sentence1: string;
    sentence2: string;
    UpdateLabeled: any;
    UpdateLabeledOld: any;
}

const LabeledTable: React.FunctionComponent<Props> = ({CFLabeled, sentence1, sentence2, UpdateLabeled, UpdateLabeledOld}: Props) => {
    const [hoveredRow, setHoveredRow] = React.useState(-1);

    const onMouseEnterRow = (event: any) => {
      const id = Number(event.currentTarget.getAttribute("data-id"));
      setHoveredRow(id);
    };

    const onMouseLeaveRow = (event: any) => {
      setHoveredRow(-1);
    };

    const columns: GridColDef[] = [
        {field: 'New Hypothesis', headerName: 'Hypothesis', flex: 0.3},
        {field: 'Robot Label', headerName: 'Robot Label', flex: 0.3},
        {field: 'Human Label', headerName: 'Human Label', flex: 0.3},
        {field: "actions", headerName: "", width: 120,
            disableColumnMenu: true,
            renderCell: (params) => {
                let hoveredRow = params.id;
                // Could add hover behavior for paricular cell. This might be important
                //    for making sure dashboard fits in one place.
                //
                // Let's introduce copy functionality first.
                if (hoveredRow === params.id) {
                    return (
                        <Box sx={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                        }}>
                            <IconButton onClick={() => console.log(params)}>
                                <CopyIcon/>
                            </IconButton>
                            <IconButton onClick={() => fetch("http://127.0.0.1:8000/delete-data?sentence1=" + sentence1 + "&sentence2=" + sentence2 + "&counterfactual=" + params.row["New Hypothesis"],
                                {method: "POST"
                                }).then(UpdateLabeled()).then(UpdateLabeledOld())}>
                                <DeleteIcon/>
                            </IconButton>
                        </Box>
                    );
                } else return -1;
            }
        }
    ];



    return (
        <Container fixed>
            <Paper elevation={3} sx={{p: 4}}>
                <Typography variant="h4"> Hypotheses: Table View </Typography>
                <Divider />
                <Box sx={{ my: 3, mx: 2 }}>
                <div style={{ height: 400, width: '100%' }}>
                    <DataGrid
                        rows={CFLabeled}
                        columns={columns}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        componentsProps={{
                            row: {
                                onMouseEnter: onMouseEnterRow,
                                onMouseLeave: onMouseLeaveRow
                            }
                        }}
                        sx={{
                            "& .MuiDataGrid-iconSeparator": {
                                display: "none"
                            },
                            "& .MuiDataGrid-pinnedColumnHeaders": {
                                boxShadow: "none",
                                backgroundColor: "transparent"
                            },
                            "& .MuiDataGrid-pinnedColumns": {
                                boxShadow: "none",
                                // backgroundColor: "transparent",
                                "& .MuiDataGrid-cell": {
                                    padding: 0
                                }
                            },
                            "& .MuiDataGrid-row": {
                                cursor: "pointer",
                                "&:hover": {
                                    backgroundColor: "whitesmoke"
                                },
                                "&:first-child": {
                                    borderTop: "1px solid rgba(224, 224, 224, 1)"
                                }
                            },
                            "& .MuiDataGrid-cell:focus": {
                                outline: "none"
                            },
                            "& .MuiDataGrid-cell:focus-within": {
                                outline: "none"
                            }
                        }}
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
