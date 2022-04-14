import React from 'react';
import './boxsentencepair.css'

//import styled from 'styled-components';

interface Props {
    sentence1: string[];
    sentence2: string[];
    gold_label: string[];
    count:number;
    setCount:any;
}

const Box: React.FunctionComponent<Props> = ({ sentence1, sentence2, gold_label, count, setCount }: Props) => {
    return(
        <div className='boxSP'>
            <div className='itemSP'>
                <span className='titleSP'>
                Original Dataset </span>
                <div className='originalPremiseSP'>
                    <span> <strong>Premise:</strong> {sentence1[count]} </span>
                </div>
                <div className='hypothesisSP'>
                    <span> <strong>Hypothesis:</strong> {sentence2[count]} </span>
                </div>
                <div>
                    <span> <strong>Label:</strong> {gold_label[count]} </span>
                </div>
            </div>
        </div>);
};

export default Box