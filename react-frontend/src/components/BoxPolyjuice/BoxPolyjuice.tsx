import React from 'react';
import { Circle } from '@visx/shape';
import './boxpolyjuice.css'
//import styled from 'styled-components';

interface Props {
    suggestion:string;
}


const BoxPolyjuice: React.FunctionComponent<Props> = ({ suggestion }: Props) => {
    return(
        <div className='boxS'>
        <div className='itemS'>
            <span className='titleS'> Polyjuice / GPT-3 Suggestion </span>
            <div className='suggestionS'>
                {suggestion}
            </div>
            <div className='buttonsS'>
                <div className='buttonS'>
                    <span>Copy </span>
                </div>
                <div className='buttonS'>
                    <span> Next </span>
                </div>
                </div>
            </div>
        </div>
    );
};

export default BoxPolyjuice