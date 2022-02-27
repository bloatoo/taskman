import { Task as ITask } from '../interfaces';
import Task from './task';
import styles from '../styles/tasklist.module.css';
import { useState, useEffect } from 'react';

interface State {
  loaded: boolean,
  new_task: boolean,
  new_task_title: string
}


const default_state: State = {
  new_task: false,
  new_task_title: "",
  loaded: false,
}

const TaskList: React.FC = () => {
  let [state, setState] = useState<State>(default_state);
  let [tasks, setTasks] = useState<ITask[]>([]);

  let getTasks = async() => {
    let res = await fetch("http://localhost:8080/api/tasks");
    let tasks: ITask[] = await res.json();

    setState({ ...state, loaded: true });
    setTasks(tasks);
  }

  let submitTask = async(title: string) => {
    let res = await fetch("http://localhost:8080/api/new_task", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title }),
    });

    let json = await res.json();

    setState({ ...state, new_task_title: "" });

    return json.id;
  }

  useEffect(() => {
    getTasks();
  }, []);

  let task_array = tasks.map(elem => <Task key={tasks.indexOf(elem)} core={elem} />)

  if(!state.loaded) { 
    return (
      <div>Loading...</div>
    )
  } else {
    return (
      <div>
        { task_array.length == 0 ?
          <div>No tasks</div>
            :
          <div className={styles.taskList}>{ task_array }</div> 
        }
        { state ?
          <div className={styles.newTask}>
            <input type="text" value={state.new_task_title} onChange={(event) => {
              setState({ ...state, new_task_title: event.target.value });
            }} placeholder="Task title" />

            <button onClick={() => {
              submitTask(state.new_task_title).then(id => {
                let new_task: ITask = {
                  title: state.new_task_title,
                  id: id,
                  completed: false,
                };
                setTasks([...tasks, new_task])
              });
            }}>
              Add Task
            </button>
          </div>
        : 
          <button onClick={() => {
            setState({ ...state, new_task: !state.new_task })
          }} className={styles.newTaskButton}>
            New Task
          </button>
        }
      </div>
    )
  }
}

export default TaskList;
