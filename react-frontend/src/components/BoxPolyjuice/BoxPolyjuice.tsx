import React, { useState } from 'react';
import './boxpolyjuice.css'

interface Props {
    suggestion:string[];
    count:number;
    setCount:any;
    mode:string;
    UpdateLabeled:any;
}

const BoxPolyjuice: React.FunctionComponent<Props> = ({ suggestion, count, setCount, mode, UpdateLabeled}: Props) => {
    // const [count, setCount] = useState(0);


    const incrSuggestion = () =>{
        if (count < suggestion.length - 1){
            setCount(count+1)
        }
        // need to update corresponding displayed table in case sentence pair changes
        UpdateLabeled()
    };

    const decrSuggestion = () =>{
        if (count >= 1){
            setCount(count-1)
        }
        UpdateLabeled()
    };

    return(
        <div className='boxS'>
        <div className='itemS'>
            <span className='titleS'> Polyjuice / GPT-3 Suggestion </span>
            <div className='suggestionS'>
               <span> <strong>New {mode}:</strong> {suggestion[count]} </span>
            </div>
            <div className='buttonsS'>
                <button className='buttonS'
                    onClick={() =>  navigator.clipboard.writeText(suggestion[count])}>
                    Copy
                    </button>
                <button className='buttonS' onClick={incrSuggestion}>
                    Next
                </button>
                <button className='buttonS' onClick={decrSuggestion}>
                    Previous
                </button>
                </div>
            </div>
        </div>
    );
};

export default BoxPolyjuice