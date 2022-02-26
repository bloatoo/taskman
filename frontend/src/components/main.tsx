import { useState, useEffect } from 'react';
import Navbar from './navbar';
import styles from '../styles/main.module.css';
import { Task } from '../interfaces';

interface State {
  loaded: boolean,
  tasks: Task[]
}

const default_state: State = {
  loaded: false,
  tasks: []
};

const Main: React.FC = () => {
  let [state, setState] = useState<State>(default_state);

  let getTasks = async() => {
    let res = await fetch("http://localhost:8080/api/tasks");
    let tasks: Task[] = await res.json();

    let new_state: State = {
      loaded: true,
      tasks: tasks,
    }

    setState(new_state);
  }

  useEffect(() => {
    getTasks();
  }, []);


  let d;
  if(state.loaded) {
    d = <div className={styles.title}>
      { state.tasks.map(elem => {
        return <div key={state.tasks.indexOf(elem)}>
          {elem.title}
        </div>
      }) }
    </div>
  } else {
    d = <div>Loading...</div>
  }

  return (
    <div>
      <Navbar />
      <div className="navbar" />
      <div className={styles.mainContainer} />
      { d }
    </div>
  )
}

export default Main;
