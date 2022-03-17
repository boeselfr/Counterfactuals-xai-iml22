import { JsonDecoder } from 'ts.data.json';
import { NLIDataPoint } from "../types/NLIDataPoint";
import {NLIDataArray} from "../types/NLIDataArray";


const NLIDataPointDecoder = JsonDecoder.object<NLIDataPoint>(
    {
        sentence1: JsonDecoder.string,
        sentence2: JsonDecoder.string,
        gold_label: JsonDecoder.string,
        suggestionRP: JsonDecoder.string,
        suggestionRP_label: JsonDecoder.string,
        suggestionRH: JsonDecoder.string,
        suggestionRH_label: JsonDecoder.string,

    },
    'NLIDataPoint'
);

export const NLIDataPointArrayDecoder = JsonDecoder.array<NLIDataPoint>(NLIDataPointDecoder, 'NLIDataArray');

