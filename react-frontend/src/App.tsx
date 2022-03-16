import React, { useEffect, useState } from 'react';
import './App.css';
import { DataArray } from './types/DataArray';
import queryBackend from './backend/BackendQueryEngine';
import Visualization from './Visualization';
// import Visualization_Box from './Visualization_Box';
import BoxSentencePair from './components/BoxSentencePair/BoxSentencePair'
import BoxPolyjuice from './components/BoxPolyjuice/BoxPolyjuice'
import BoxTable from './components/BoxTable/BoxTable'
import BoxCF from './components/BoxCF/BoxCF'


function App() {
  const [exampleData, setExampleData] = useState<DataArray>();

  useEffect(() => {
    queryBackend(`upload-data?name=blobs`).then((exampleData) => {
      setExampleData(exampleData);
    });
  }, []);
  console.log('we are in the app script')
  console.log(exampleData);
  return (
    <div className="App">
      <header className="App-header"> Counterfactual Generation
      </header>
      {/* <div>{exampleData && <Visualization width={1100} height={550} data={exampleData} />}</div> */}
      {/* <div>{exampleData && <Visualization_Box width={1100} height={550} data={exampleData} />}</div> */}
      <div className='Vis'>
        <BoxSentencePair sentence1={"A girl with a tennis ball in her bag."} 
                      sentence2={"The girl in yellow shorts has a tennis ball in her left pocket."} 
                      gold_label={"Entailment"}
                      suggestion={"The girl in yellow shorts has a tennis ball."}/>
        <BoxPolyjuice suggestion={"The girl in yellow shorts has a tennis ball."} />   
        <BoxTable sentence1={"A girl with a tennis ball in her bag."} 
                      sentence2={"The girl in yellow shorts has a tennis ball in her left pocket."} 
                      gold_label={"Entailment"}
                      suggestion={"The girl in yellow shorts has a tennis ball."}/>
        <BoxCF suggestion={"The girl in yellow shorts has a tennis ball."}/>
    </div>
    </div>
  )
}

export default App;
