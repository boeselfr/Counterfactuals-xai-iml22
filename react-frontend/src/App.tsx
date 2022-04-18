import React, { useEffect, useState } from 'react';
import './App.css';
import {queryBackendData} from './backend/BackendQueryEngine';
import {queryBackendInt} from "./backend/BackendQueryEngine";
import Visualization from './Visualization';
import {NLIDataArray} from "./types/NLIDataArray";


function App() {
  const [exampleData, setExampleData] = useState<NLIDataArray>();
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0)


  useEffect(() => {
      queryBackendInt(`data-count`).then((maxCount) => {
      setTotalCount(maxCount);
    });
  }, []);

  useEffect(() => {
      queryBackendData(`upload-data?count=${count}`).then((exampleData) => {
          setExampleData(exampleData);
      });
  }, [count]);



  const incrCount = () => {
      console.log(totalCount)
      if (count < totalCount - 1){
          console.log("here?")
            setCount(count+1)
        }
  };

  const decrCount = () => {
      if (count > 0){
            setCount(count-1)
        }
  };

  return (
    <div className="App">
      <header className="App-header"> Counterfactual Generation
      </header>
      <div>
        {exampleData && <Visualization
            data={exampleData}
            incrCount={incrCount}
            decrCount={decrCount}/>}
      </div>
    </div>
  )
}

export default App;
