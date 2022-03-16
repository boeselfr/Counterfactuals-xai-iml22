import React from 'react';
import './boxtable.css'
//import styled from 'styled-components';

interface Props {
    sentence1: string;
    sentence2: string;
    gold_label: string;
    suggestion: string;
}

const Box: React.FunctionComponent<Props> = ({ sentence1, sentence2, gold_label, suggestion }: Props) => {
    return(
        <div className='boxT'>
            <div className='itemT'>

            <span className='titleT'>
                List of Labeled CFs 
            </span>

            <div className='tableT'>
            <table>
            <tr>
                <td width="33%" ><strong> Neutral </strong></td>
                <td width="33%"><strong> Entailment </strong></td>
                <td width="33%"><strong> Contradiction </strong></td>
            </tr>
            <tr>
                <td line-height="0.2">The girl in yellow shorts has a ball in her left pocket. </td>
                <td>The girl in yellow shorts has a tennis ball in both pockets.</td>
                <td>The girl in yellow shorts with empty pockets, …</td>
            </tr>
            <tr>
                <td>The girl in yellow shorts …</td>
                <td>...</td>
                <td>...</td>
            </tr>
            <tr>
                <td>...</td>
                <td>...</td>
                <td>...</td>
            </tr>
            </table>
            </div>
            </div>
        </div>);
};

export default Box