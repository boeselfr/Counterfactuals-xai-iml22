import React, { useEffect, useState } from 'react';
import './App.css';
import { DataArray } from './types/DataArray';
import { NLIDataPoint} from "./types/NLIDataPoint";
import queryBackend from './backend/BackendQueryEngine';
import Visualization from './Visualization';
// import Visualization_Box from './Visualization_Box';
import BoxSentencePair from './components/BoxSentencePair/BoxSentencePair'
import BoxPolyjuice from './components/BoxPolyjuice/BoxPolyjuice'
import BoxTable from './components/BoxTable/BoxTable'
import BoxCF from './components/BoxCF/BoxCF'
import {NLIDataArray} from "./types/NLIDataArray";


function App() {
  const [exampleData, setExampleData] = useState<NLIDataArray>();

  useEffect(() => {
    queryBackend(`upload-data?split=train`).then((exampleData) => {
      setExampleData(exampleData);
    });
  }, []);
  console.log('we are in the app script')
  console.log(exampleData);
  return (
    <div className="App">
      <header className="App-header"> Counterfactual Generation
      </header>
      {/*<div>{exampleData && <Visualization data={exampleData} />}</div> */}
      {/* <div>{exampleData && <Visualization_Box width={1100} height={550} data={exampleData} />}</div> */}
      <div>
        {exampleData && <Visualization data={exampleData} />}
      </div>
    </div>
  )
}

export default App;
