import React from 'react';
import './boxtable.css';
import {NLISubmissionDisplay} from "../../types/NLISubmissionDisplay";
//import styled from 'styled-components';
import { MDBTable, MDBTableBody, MDBTableHead } from 'mdbreact';
import { MDBDataTable } from 'mdbreact';


interface Props {
    CFLabeled: NLISubmissionDisplay;
    mode: string;

}

const LabeledTable: React.FunctionComponent<Props> = ({CFLabeled, mode}: Props) => {
  const data={
    columns: [
      {
        label: 'Neutral',
      }, 
      {
        label: 'Entailment',
      },
      {
        label: 'Contradiction',
      }
    ],
    rows: CFLabeled
  }
  return (
    <div className='itemT'>
      <span className='titleT'>
            List of Labeled CFs
        </span>
        <div className='tableContainer'>
          <MDBTable scrollY>
          <MDBTableHead columns={data.columns} />
          <MDBTableBody rows={data.rows} />
          </MDBTable>
        </div>
    </div>
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