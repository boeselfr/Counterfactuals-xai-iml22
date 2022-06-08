import { NLIDataArray } from "../types/NLIDataArray";
import {NLISubmissionDisplay} from "../types/NLISubmissionDisplay";
import {NLIEmbeddingArray} from "../types/NLIEmbeddingArray";
import {NLISubmissionDisplayGraph} from "../types/NLISubmissionDisplayGraph";

export interface queryBackendProps {
    route: string;
}

export const BASE_URL = 'http://127.0.0.1:8000';

export const queryBackendData = async (route: string): Promise<NLIDataArray> => {
    const requestURL = `${BASE_URL}/${route}`;
    const data = await fetch(requestURL,
        {
            method: 'GET'
        }
    ).then(response => response.json()).then(d => d as NLIDataArray);

    return data;
}

export const queryBackendStr = async (route: string) => {
    const requestURL = `${BASE_URL}/${route}`;
    const data = await fetch(requestURL,
        {
            method: 'GET'
        }
    ).then(response => response.json()).then(d => d as string);
    return data;
}


export const queryBackendInt = async (route: string) => {
    const requestURL = `${BASE_URL}/${route}`;
    const data = await fetch(requestURL,
        {
            method: 'GET'
        }
    ).then(response => response.json()).then(d => d as number);
    return data;
}

export const queryBackendDisplayData = async (route: string): Promise<NLISubmissionDisplay> => {
    const requestURL = `${BASE_URL}/${route}`;
    const data = await fetch(requestURL,
        {
            method: 'GET'
        }
    ).then(response => response.json()).then(d => d as NLISubmissionDisplay);
    return data;
}


export const queryBackendDisplayDataGraph = async (route:string) => {
    const requestURL = `${BASE_URL}/${route}`;
    const data = await fetch(requestURL,
        {
            method: 'GET'
        }
    ).then(response => response.json()).then(d => [d[0] as NLISubmissionDisplayGraph, d[1], d[2]]);
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
