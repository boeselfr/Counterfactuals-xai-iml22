import React from 'react';
import { Circle } from '@visx/shape';
import './boxsentencepair.css'
//import styled from 'styled-components';

interface Props {
    sentence1: string;
    sentence2: string;
    gold_label: string;
    suggestion: string;
}

const Box: React.FunctionComponent<Props> = ({ sentence1, sentence2, gold_label, suggestion }: Props) => {
    return(
        <div className='boxSP'>
        <div className='itemSP'>
            <span className='titleSP'>
            Original Dataset </span>
            <div className='hypothesisSP'>
                <span> <strong>Hypothesis:</strong> {sentence1} </span>
            <div className='originalPremiseSP'>
                <span> <strong>Premise</strong>: {sentence2}</span>
            </div>
            <div>
                <span> <strong>Label</strong>: {gold_label} </span>
            </div>
            </div>
        </div>
    
        </div>);
};

export default Box