import React, {useEffect, useState} from 'react';
import './App.css';
import {queryBackendData, queryBackendEmbedding} from './backend/BackendQueryEngine';
import {queryBackendInt} from "./backend/BackendQueryEngine";
import Visualization from './Visualization';
import {NLIDataArray} from "./types/NLIDataArray";
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

import {ThemeProvider, createTheme} from '@mui/material/styles';
// import {Typography} from "@mui/material";
import EmbeddingPlot from "./components/EmbeddingPlot/EmbeddingPlot";
import {NLIEmbeddingArray} from "./types/NLIEmbeddingArray";

const theme = createTheme({
    palette: {
        primary: {
            main: '#7c6daa',
        },
        secondary: {
            main: '#7f2c56',
        },
        error: {
            main: '#9e3030',
        },
        text: {
            primary: 'rgb(0,0,0)',
        },
    },
    typography: {
        fontFamily: 'Nunito',
    },
});

function App() {

const [exampleData, setExampleData] = useState<NLIDataArray>();
const [count, setCount] = useState(0);
const [totalCount, setTotalCount] = useState(0);
const [value, setValue] = React.useState('1');
const [Embeddings, setEmbeddings] = useState<NLIEmbeddingArray>();


useEffect(() => {
    queryBackendInt(`data-count`).then((maxCount) => {
        setTotalCount(maxCount);
    });
    queryBackendEmbedding('upload-embeddings-plot').then((response) => {
        setEmbeddings(response);
    });
}, []);

useEffect(() => {
    queryBackendData(`upload-data?count=${count}`).then((exampleData) => {
        setExampleData(exampleData);
    });
}, [count]);


const incrCount = () => {
    console.log(totalCount)
    if (count < totalCount - 1) {
        console.log("here?")
        setCount(count + 1)
    }
};

const decrCount = () => {
    if (count > 0) {
        setCount(count - 1)
    }
};

const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
};

return (
    <ThemeProvider theme={theme}>
            <Box sx={{width: '100%', typography: 'body1'}}>
                <TabContext value={value}>
                    <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                        <TabList onChange={handleChange} aria-label="lab API tabs example">
                                <Tab label="Dashboard" value="1"/>
                                <Tab label="Visualizations" value="2"/>
                        </TabList>
                    </Box>
                    <TabPanel value="1">{exampleData && <Visualization
                        data={exampleData}
                        incrCount={incrCount}
                        decrCount={decrCount}/>}</TabPanel>
                    <TabPanel value="2">
                        <div className='titleUMAP'>
                            {Embeddings && <EmbeddingPlot data={Embeddings}/>}
                        </div>
                    </TabPanel>
                </TabContext>
            </Box>
    </ThemeProvider>
)   
}

export default App;
