import React from 'react';
import './boxsentencepair.css'

//import styled from 'styled-components';

interface Props {
    sentence1: string;
    sentence2: string;
    gold_label: string;
    incrCount:any;
    decrCount: any
}

const Box: React.FunctionComponent<Props> = ({ sentence1, sentence2, gold_label, incrCount, decrCount }: Props) => {
    return(
        <div className='boxSP'>
            <div className='itemSP'>
                <span className='titleSP'>
                Original Dataset
                </span>
                <div className='originalPremiseSP'>
                    <span> <strong>Premise:</strong> {sentence1} </span>
                </div>
                <div className='hypothesisSP'>
                    <span> <strong>Hypothesis:</strong> {sentence2} </span>
                </div>
                <div>
                    <span> <strong>Label:</strong> {gold_label} </span>
                </div>
                <div className='buttonsS'>
                    <button className='buttonS' onClick={decrCount}>
                        Previous
                    </button>
                    <button className='buttonS' onClick={incrCount}>
                        Next
                    </button>
                </div>
            </div>
        </div>);
};

export default Box