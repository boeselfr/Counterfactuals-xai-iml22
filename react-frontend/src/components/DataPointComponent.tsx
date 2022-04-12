import React from 'react';
import { Circle } from '@visx/shape';
//import styled from 'styled-components';


interface Props {
    x: number;
    y: number;
    color: string;
    hover: string;
}

const DataPointComponent: React.FunctionComponent<Props> = ({ x, y, color, hover }: Props) => {
    return <Circle cx={x} cy={y} r={5} fill={color}>
                <title>{hover}</title>
                </Circle>
};

export default DataPointComponent;
