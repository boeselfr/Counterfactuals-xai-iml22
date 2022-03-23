import React, {useState}from 'react';
import './boxcf.css'


interface Props {
    suggestion: string[];
    count: number;
    setCount: any;
    cflist: string[];
    setCFList: any;
    cflabellist: string[];
    setCFLabelList: any;
    cfsimilaritylist: string[];
    setCFSimilarityList: any;
}

interface FormElements extends HTMLFormControlsCollection {
    counterfactual: HTMLInputElement
    cf_label: HTMLInputElement
    similarity: HTMLInputElement
}

interface YourFormElement extends HTMLFormElement {
    readonly elements: FormElements
}

const BoxCF: React.FunctionComponent<Props> = ({suggestion, count, cflist, cflabellist, cfsimilaritylist}: Props) => {
    const [cf, setCF] = useState('')

    const handleSubmit = (e: React.FormEvent<YourFormElement>) =>{
        e.preventDefault()
        const input_cf = e.currentTarget.elements.counterfactual.value;
        const input_cf_label = e.currentTarget.elements.cf_label.value;
        // const input_similarity = e.currentTarget.elements.similarity.value;
        if(!(cflist.indexOf(input_cf) > -1)){
            cflist.push(input_cf);
            // cflabellist.push(input_cf_label);
            // cfsimilaritylist.push(input_similarity);
            alert(`${e.currentTarget.elements.cf_label.value[0]}`)
        }else{
            alert(`The counterfactual \"${input_cf}\" already exists`);
        }
        cflist.push()

    }

    return(
        <div  className='boxCF'>
            <div className='itemCF'>
            <div className='titleCF'>
                Submit Counterfactuals Here
            </div>
            <form action="/action_page.php" onSubmit={handleSubmit}>
                <input id="counterfactual" type="text" placeholder={suggestion[count]}/>
            <div className='textCF'>
                What label would you give this CF?
                <div className='buttonsCF'>
                {/* <div className='buttonCF'> <span> Neutral </span> </div>
                <div className='buttonCF'> <span> Entailment </span> </div>
                <div className='buttonCF'> <span> Contradiction </span> </div> */}
                {/* <input type='button' className='buttonCF'> Neutral</input> */}

                {/* TODO: make it to only select one of the options & pass onto table*/}
                <input id="button" type="cf_label" className='buttonCF' value='Neutral' /> 
                <input id="button" type="cf_label" className='buttonCF' value='Entailment' /> 
                <input id="button" type="cf_label" className='buttonCF' value='Contradiction'/> 
                </div>
            </div>
            <div className='slideContainer'>
                How similar is this CF to the previous ones?
                <div>
                <input type="range" min="0" max="100" ></input>
                </div>
            </div>
            <input type="submit" value="Submit"/>
            </form>
            </div>
        </div>
    )

};

export default BoxCF