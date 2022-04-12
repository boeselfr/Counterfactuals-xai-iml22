import React, {useState} from 'react';
import Visualization from "../../Visualization";
import './boxcf.css'


interface Props {
    sentence1: string[];
    sentence2: string[];
    gold_label: string[];
    suggestion: string[];
    count: number;
    setCount: any;
    cflist: string[];
    setCFList: any;
    cflabellist: string[];
    setCFLabelList: any;
    cfsimilaritylist: string[];
    setCFSimilarityList: any;
    mode:string;
    UpdateLabeled:any;
}

interface FormElements extends HTMLFormControlsCollection {
    counterfactual: HTMLInputElement
    cf_label: HTMLInputElement
    similarity: HTMLInputElement
}

interface YourFormElement extends HTMLFormElement {
    readonly elements: FormElements
}

const BoxCF : React.FunctionComponent<Props> = ({sentence1, sentence2, gold_label, suggestion, count, cflist, cflabellist, cfsimilaritylist, mode, UpdateLabeled}: Props) => {
    const [cf, setCF] = useState('')
    const [cflabel, setcflabel] = useState('Neutral')
    const [similarity, setsimilarity] = useState('50')
    const [buttonState, setButtonState] = useState(['buttonCF', 'buttonCF', 'buttonCF'])

    const handleSubmit = (e: React.FormEvent<YourFormElement>) =>{
        e.preventDefault()
        const input_cf = cf;
        const input_cf_label = cflabel;
        const input_similarity = similarity;

        if (input_cf == ''){
            alert('Please enter a counterfactual')
            return
        }

        console.log(input_cf)
        console.log(input_cf_label)
        console.log(input_similarity)

        // create new data submission entry for backend:
        const data = {
            "sentence1": sentence1[count],
            "sentence2": sentence2[count],
            "gold_label": gold_label[count],
            "suggestionRP": "",
            "suggestionRP_label": "",
            "suggestionRH": "",
            "suggestionRH_label": "",
            "estimated_similarity": similarity
        }

        // insert suggestion and labels depending on mode:
        if (mode=="Hypothesis"){
            data["suggestionRH"] = input_cf
            data["suggestionRH_label"] = input_cf_label
        } else if (mode=="Premise"){
            data["suggestionRP"] = input_cf
            data["suggestionRP_label"] = input_cf_label
        }

        fetch("http://127.0.0.1:8000/submit-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then()

        // trigger an update of the labeled list as there is a new entry now:
        UpdateLabeled()
    }

    return(
        <div className='boxCF'>
            <div className='itemCF'>
            <div className='titleCF'>
                Submit Counterfactuals Here
            </div>
            <form onSubmit={handleSubmit}>
                <input id="counterfactual" type="text" placeholder={suggestion[count]} onChange={(e) => setCF(e.target.value)}/>
                <div className='textCF'>
                    What label would you give this CF?
                    <div className='buttonsCF'>
                        <input id='cf_label' type='button' className={buttonState[0]} value='Neutral' onClick={(e)=>{setcflabel('Neutral'); 
                                setButtonState(['buttonsCF_clicked', 'buttonCF', 'buttonCF'])}} />
                        <input id='cf_label' type='button' className={buttonState[1]} value='Entailment' onClick={(e)=>{setcflabel('Entailment'); 
                                setButtonState(['buttonCF', 'buttonsCF_clicked', 'buttonCF'])}} />
                        <input id='cf_label' type='button' className={buttonState[2]} value='Contradiction' onClick={(e)=>{setcflabel('Contradiction'); 
                                setButtonState(['buttonCF', 'buttonCF', 'buttonsCF_clicked'])}} />
                    </div>
                </div>
                <div className='slideContainer'>
                    How similar is this CF to the previous ones?
                    <div>
                    <input id="similarity" type="range" min="0" max="100" value={similarity} onChange={(e) => {
                        setsimilarity(e.target.value)}}></input>
                        {similarity}
                    </div>
                </div>
                <input type="submit" value="Submit" onClick={(e)=>{setButtonState(['buttonCF', 'buttonCF', 'buttonCF']); setsimilarity('50')}}/>
            </form>
            </div>
        </div>
    )

};

export default BoxCF