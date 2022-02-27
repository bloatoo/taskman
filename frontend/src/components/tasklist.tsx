import { Task as ITask } from '../interfaces';
import Task from './task';
import styles from '../styles/tasklist.module.css';
import { useState } from 'react';

interface Props {
  loaded: boolean,
  tasks: ITask[]
}

interface State {
  new_task: boolean,
  new_task_title: string
}

const submitTask = async(title: string) => {
  let res = await fetch("http://localhost:8080/api/new_task", {
    method: "POST",
    body: JSON.stringify({ title: title }),
  });

  let json = await res.json();

  return json.id;
}

const default_state: State = {
  new_task: false,
  new_task_title: ""
}

const TaskList: React.FC<Props> = ({ tasks, loaded }) => {
  let task_array = [];

  let [state, setState] = useState<State>(default_state);

  task_array = tasks.map(elem => <Task key={tasks.indexOf(elem)} core={elem} />)

  if(!loaded) { 
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
            <input type="text" onChange={(e) => setState({ ...state, new_task_title: e.target.value })} placeholder="Task title" />
            <button onClick={() => {
              submitTask(state.new_task_title).then(id => {
                task_array.push(<Task key={tasks.length} core={{ title: state.new_task_title, id: id, completed: false }} />)
              });
            }}>Add Task</button>
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
