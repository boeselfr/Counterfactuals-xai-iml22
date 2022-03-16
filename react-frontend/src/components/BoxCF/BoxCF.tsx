import React from 'react';
import './boxcf.css'


interface Props {
    suggestion: string;
}

const BoxCF: React.FunctionComponent<Props> = ({suggestion }: Props) => {
    return(
        <div  className='boxCF'>
            <div className='itemCF'>
            <div className='titleCF'>
                Submit Counterfactuals Here
            </div>
            <form action="/action_page.php">
                <input type="text" placeholder={suggestion}/>
            </form>
            <div className='textCF'>
                What label would you give this CF?
                <div className='buttonsCF'>
                <div className='buttonCF'> <span> Neutral </span> </div>
                <div className='buttonCF'> <span> Entailment </span> </div>
                <div className='buttonCF'> <span> Contradiction </span> </div>
                </div>
            </div>
            <div className='slideContainer'>
                How similar is this CF to the previous ones?
                <div>
                <input type="range" min="0" max="100" ></input>
                </div>
            </div>
            <input type="submit"/>
            </div>
        </div>
    )

};

export default BoxCF