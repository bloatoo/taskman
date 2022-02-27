import { useState, useEffect } from 'react';
import Navbar from './navbar';
import styles from '../styles/main.module.css';
import { Task } from '../interfaces';

import TaskList from './tasklist';

interface State {
  loaded: boolean,
  tasks: Task[]
  new_task: boolean,
}

const default_state: State = {
  loaded: false,
  tasks: [],
  new_task: false,
};

const Main: React.FC = () => {
  let [state, setState] = useState<State>(default_state);

  let getTasks = async() => {
    let res = await fetch("http://localhost:8080/api/tasks");
    let tasks: Task[] = await res.json();

    let new_state: State = {
      loaded: true,
      tasks: tasks,
      new_task: state.new_task,
    }

    setState(new_state);
  }

  useEffect(() => {
    getTasks();
  }, []);


  return (
    <div>
      <Navbar />
      <div className={styles.mainContainer}>
        <TaskList loaded={state.loaded} tasks={state.tasks}/>
      </div>
    </div>
  )
}

export default Main;
