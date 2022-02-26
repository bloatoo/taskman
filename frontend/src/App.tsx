import { useEffect, useState } from 'react';
import styles from './App.module.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Main from './components/main';
import HabitView from './components/habit';

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


  let d = state == undefined ? <div></div> : <div className={styles.title}>Title is {state}</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<Main />} />
          <Route path="habits" element={<HabitView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
