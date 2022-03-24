import React, {useState}from 'react';
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
}

interface FormElements extends HTMLFormControlsCollection {
    counterfactual: HTMLInputElement
    cf_label: HTMLInputElement
    similarity: HTMLInputElement
}

interface YourFormElement extends HTMLFormElement {
    readonly elements: FormElements
}

const BoxCF: React.FunctionComponent<Props> = ({sentence1, sentence2, gold_label, suggestion, count, cflist, cflabellist, cfsimilaritylist, mode}: Props) => {
    const [cf, setCF] = useState('')

    const handleSubmit = (e: React.FormEvent<YourFormElement>) =>{
        e.preventDefault()
        const input_cf = e.currentTarget.elements.counterfactual.value;
        const input_cf_label = e.currentTarget.elements.cf_label.value;
        const similarity = e.currentTarget.elements.similarity.value;

        if(!(cflist.indexOf(input_cf) > -1)){
            cflist.push(input_cf);
            // cflabellist.push(input_cf_label);
            // cfsimilaritylist.push(input_similarity);
            alert(`${e.currentTarget.elements.cf_label.value[0]}`)
        }else{
            alert(`The counterfactual \"${input_cf}\" already exists`);
        }
        cflist.push()

        console.log(input_cf)
        console.log(input_cf_label)
        console.log(similarity)

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