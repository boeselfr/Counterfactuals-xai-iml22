import React from 'react';
import {NLISubmissionDisplay} from "../../types/NLISubmissionDisplay";
import {NLISubmissionDisplayPoint} from "../../types/NLISubmissionDisplayPoint";
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import {Divider, IconButton, Typography} from "@mui/material";
import Box from '@mui/material/Box';

import DeleteIcon from "@mui/icons-material/Delete";
import CopyIcon from "@mui/icons-material/ContentCopy";

import {DataGrid, GridColDef} from '@mui/x-data-grid';

import Snackbar from '@mui/material/Snackbar';
import CloseIcon from '@mui/icons-material/Close';
import {Exception} from "sass";

interface StringObj {[key: string]: string}

interface Props {
    CFLabeled: NLISubmissionDisplay;
    sentence1: string;
    sentence2: string;
    UpdateLabeled: any;
    UpdateLabeledOld: any;
    colorpalette: StringObj;
}


const ai_header = 'Robot Label';
const human_header = 'Human Label';
const ai_field = '🤖 AI Label';
const human_field = '🧑✍ Human Label';
const field_to_header: StringObj = {}
field_to_header[ai_field] = ai_header;
field_to_header[human_field] = human_header;

function convertCFLabeled(CFLabeled: NLISubmissionDisplay): NLISubmissionDisplay {
    let result: NLISubmissionDisplay = [];
    for (const value of CFLabeled) {
        let newValue: NLISubmissionDisplayPoint = Object.assign({}, value)
        for (const [newHeader, oldHeader] of Object.entries(field_to_header)) {
            // @ts-ignore
            newValue[newHeader] = value[oldHeader];
        }
        result.push(newValue);
    }
    return result;
}

const LabeledTable: React.FunctionComponent<Props> = (
    {CFLabeled, sentence1, sentence2, UpdateLabeled, UpdateLabeledOld, colorpalette}: Props) => {
    const [hoveredRow, setHoveredRow] = React.useState(-1);
    const [open, setOpen] = React.useState(false);

    const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
          return;
        }
        setOpen(false);
      };
    
      const action = (
        <React.Fragment>
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </React.Fragment>
      );


    const onMouseEnterRow = (event: any) => {
      const id = Number(event.currentTarget.getAttribute("data-id"));
      setHoveredRow(id);
    };

    const onMouseLeaveRow = (event: any) => {
      setHoveredRow(-1);
    };

    const renderColoredLabels = (params: any) => {
        let mismatch: boolean = params.row[ai_header] !== params.row[human_header];
        let header: string = field_to_header[params.field];
        let label: string = params.row[header];
        let color: any = colorpalette[label];
        if (label === "Neutral") {
            color = "black";  // Gray is too light for the table
        }
        let box_text = label;
        let decoration = "none";
        let decoration_thickness = "none";
        if (mismatch && header === ai_header) {
            decoration = "line-through black 2px";
        }
        return (<Box sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: color,
            textDecoration: decoration,
            textDecorationThickness: decoration_thickness,
        }}>
            {box_text}
        </Box>)
    };

    const columns: GridColDef[] = [
        {field: 'New Hypothesis', headerName: 'Hypothesis', flex: 0.3, headerAlign: "center"},
        {field: ai_field, headerName: ai_field, headerAlign: "center",
            renderCell: renderColoredLabels,
            flex: 0.3},
        {field: human_field, headerName: human_field, headerAlign: "center",
            renderCell: renderColoredLabels,
            flex: 0.3},
        {field: "actions", headerName: "", width: 120,
            disableColumnMenu: true,
            renderCell: (params) => {
                return (
                    <Box sx={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            justifyContent: "left",
                            alignItems: "left",
                    }}>
                    <IconButton onClick={() => {navigator.clipboard.writeText(params.row["New Hypothesis"]); setOpen(true)}}>
                        <CopyIcon/>
                    </IconButton>
                        <Snackbar
                            open={open}
                            autoHideDuration={1000}
                            onClose={handleClose}
                            message="Copied to Clipboard"
                            action={action}
                            />
                        <IconButton onClick={() => fetch("http://127.0.0.1:8000/delete-data?sentence1=" + sentence1 + "&sentence2=" + sentence2 + "&counterfactual=" + params.row["New Hypothesis"],
                            {method: "POST"
                            }).then(UpdateLabeled()).then(UpdateLabeledOld())}>
                            <DeleteIcon/>
                        </IconButton>
                    </Box>
                );
            }
        }
    ];



    return (
        <Container fixed>
            <Paper elevation={0} sx={{p: 3}}>
                <Typography variant="h4"> Hypotheses: Table View </Typography>
                <Divider />
                <Box sx={{ my: 3, mx: 2 }}>
                <div style={{ height: 400, width: '100%' }}>
                    <DataGrid
                        rows={convertCFLabeled(CFLabeled)}
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
