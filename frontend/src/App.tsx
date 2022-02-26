import { useEffect, useState } from 'react';
import styles from './App.module.css';

function App() {
  let [state, setState] = useState("");

  let getTask = async() => {
    let res = await fetch("http://localhost:8080/task/69");
    let jsn = await res.json();
    console.log(jsn);
    setState(jsn.title);
  }

  useEffect(() => {
    getTask();
  }, []);


  let d = state == undefined ? <div></div> : <div>Title is {state}</div>;

  return (
    <div className="App">
      {d}
    </div>
  );
}

export default App;
