import { Task as ITask } from '../interfaces';
import Task from './task';
import styles from '../styles/tasklist.module.css';
import { useState, useEffect } from 'react';

interface State {
  loaded: boolean,
  new_task: boolean,
  new_task_title: string
  tasks: ITask[]
}

const submitTask = async(title: string) => {
  let res = await fetch("http://localhost:8080/api/new_task", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: title }),
  });

  let json = await res.json();

  console.log(json);

  return json.id;
}

const default_state: State = {
  new_task: false,
  new_task_title: "",
  tasks: [],
  loaded: false,
}

const TaskList: React.FC = () => {
  let task_array = [];

  let getTasks = async() => {
    let res = await fetch("http://localhost:8080/api/tasks");
    let tasks: ITask[] = await res.json();

    let new_state: State = {
      loaded: true,
      tasks: tasks,
      new_task: state.new_task,
      new_task_title: state.new_task_title
    }

    setState(new_state);
  }

  useEffect(() => {
    getTasks();
  }, []);

  let [state, setState] = useState<State>(default_state);

  task_array = state.tasks.map(elem => <Task key={state.tasks.indexOf(elem)} core={elem} />)

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
            <input type="text" onChange={(e) => {
              setState({ ...state, new_task_title: e.target.value });
              e.target.value = "";
            }} placeholder="Task title" />

            <button onClick={() => {
              submitTask(state.new_task_title).then(id => {
                console.log(id);
                setState({ ...state, tasks: [...state.tasks, { title: state.new_task_title, id: id, completed: false } ]})
              });
            }}>
              Add Task
            </button>
          </div>
        : 
          <button onClick={() => setState({ ...state, new_task: !state.new_task })} className={styles.newTaskButton}>
            New Task
          </button>
        }
      </div>
    )
  }
}

export default TaskList;
