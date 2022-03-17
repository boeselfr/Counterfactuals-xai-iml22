import React from 'react';
import { DataArray } from './types/DataArray';
import {NLIDataArray} from "./types/NLIDataArray";
import { Margins } from './types/Margins';
import { Group } from '@visx/group';
import { GridColumns, GridRows } from '@visx/grid';
import { scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import DataPointComponent from './components/DataPointComponent';
import BoxSentencePair from "./components/BoxSentencePair/BoxSentencePair";
import BoxPolyjuice from "./components/BoxPolyjuice/BoxPolyjuice";
import BoxTable from "./components/BoxTable/BoxTable";
import BoxCF from "./components/BoxCF/BoxCF";


interface Props {
    data: NLIDataArray;
}

const Visualization: React.FunctionComponent<Props> = ({ data }: Props) =>{
    const sentence1 = data.map((d) => d.sentence1);
    const sentence2 = data.map((d) => d.sentence2);
    const gold_label = data.map((d) => d.gold_label);
    const suggestionRP = data.map((d) => d.suggestionRP);
    const suggestionRP_label = data.map((d) => d.suggestionRP_label);
    const suggestionRH = data.map((d) => d.suggestionRH);
    const suggestionRH_label = data.map((d) => d.suggestionRH_label);

    // all const above are lists ( with only one entry )
    // to display the first nli entry we access the first element in each list below
    return  (
        <div className="Vis">
            <BoxSentencePair sentence1={sentence1[0]}
                             sentence2={sentence2[0]}
                             gold_label={gold_label[0]}/>
            <BoxPolyjuice suggestion={suggestionRH[0]} />
            <BoxTable sentence1={sentence1[0]}
                          sentence2={sentence2[0]}
                          gold_label={gold_label[0]}
                          suggestion={suggestionRH[0]}/>
            <BoxCF suggestion={suggestionRH[0]}/>)
        </div>)
};

export default Visualization;

