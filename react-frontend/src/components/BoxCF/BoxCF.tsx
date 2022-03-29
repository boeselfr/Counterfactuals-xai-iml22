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


    const handleSubmit = (e: React.FormEvent<YourFormElement>) =>{
        e.preventDefault()
        const input_cf = cf;
        const input_cf_label = cflabel;
        const input_similarity = similarity;

        if (input_cf == ''){
            alert('Please enter a counterfactual')
            return
        }

        // we can do the duplicate filtering in the backend
        /*if(!(cflist.indexOf(input_cf) > -1)){
            cflist.push(input_cf);
            // cflabellist.push(input_cf_label);
            // cfsimilaritylist.push(input_similarity);
            alert(`${e.currentTarget.elements.cf_label.value[0]}`)
        }else{
            alert(`The counterfactual \"${input_cf}\" already exists`);
        }
        cflist.push()*/

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
        <div  className='boxCF'>
            <div className='itemCF'>
            <div className='titleCF'>
                Submit Counterfactuals Here
            </div>
            <form onSubmit={handleSubmit}>
                <input id="counterfactual" type="text" placeholder={suggestion[count]} onChange={(e) => setCF(e.target.value)}/>
                <div className='textCF'>
                    What label would you give this CF?
                    <div className='buttonsCF'>

                    <input id="cf_label" type="button" className='buttonCF' value='Neutral' onClick={(e) => setcflabel('Neutral')}/>
                    <input id="cf_label" type="button" className='buttonCF' value='Entailment' onClick={(e) => setcflabel('Entailment')}/>
                    <input id="cf_label" type="button" className='buttonCF' value='Contradiction' onClick={(e) => setcflabel('Contradiction')}/>
                    </div>
                </div>
                <div className='slideContainer'>
                    How similar is this CF to the previous ones?
                    <div>
                    <input id="similarity" type="range" min="0" max="100" onChange={(e) => setsimilarity(e.target.value)}></input>
                    </div>
                </div>
                <input type="submit" value="Submit"/>
            </form>
            </div>
        </div>
    )

};

export default BoxCF