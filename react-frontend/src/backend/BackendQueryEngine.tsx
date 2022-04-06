import { NLIDataArray } from "../types/NLIDataArray";
import {NLISubmissionDisplay} from "../types/NLISubmissionDisplay";
import {NLIEmbeddingArray} from "../types/NLIEmbeddingArray";

export interface queryBackendProps {
    route: string;
}

export const BASE_URL = 'http://127.0.0.1:8000';

export const queryBackendData = async (route: string): Promise<NLIDataArray> => {
    const requestURL = `${BASE_URL}/${route}`;
    const formData = new FormData();
    const data = await fetch(requestURL,
        {
            method: 'GET'
        }
    ).then(response => response.json()).then(d => d as NLIDataArray);

    return data;
}

export const queryBackendDisplayData = async (route: string): Promise<NLISubmissionDisplay> => {
    const requestURL = `${BASE_URL}/${route}`;
    const formData = new FormData();
    const data = await fetch(requestURL,
        {
            method: 'GET'
        }
    ).then(response => response.json()).then(d => d as NLISubmissionDisplay);

    return data;
}


export const queryBackendEmbedding = async (route: string): Promise<NLIEmbeddingArray> => {
    const requestURL = `${BASE_URL}/${route}`;
    const formData = new FormData();
    const data = await fetch(requestURL,
        {
            method: 'GET'
        }
    ).then(response => response.json()).then(d => d as NLIEmbeddingArray);

    return data;
}




