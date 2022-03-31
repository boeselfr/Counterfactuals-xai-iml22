import React, { useEffect, useState } from 'react';
import './App.css';
import {queryBackendData} from './backend/BackendQueryEngine';
import Visualization from './Visualization';
import {NLIDataArray} from "./types/NLIDataArray";
import umap_all from '../umap_all_edited.png';


function App() {
  const [exampleData, setExampleData] = useState<NLIDataArray>();

  useEffect(() => {
    queryBackendData(`upload-data?split=cfs_example`).then((exampleData) => {
      setExampleData(exampleData);
    });
  }, []);


  console.log('we are in the app script')
  console.log(exampleData);
  return (
    <div className="App">
      <header className="App-header"> Counterfactual Generation
      </header>
      <div>
        {exampleData && <Visualization data={exampleData} />}
      </div>
    </div>
  )
}

export default App;
