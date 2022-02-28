import { Task as ITask } from '../interfaces';
import Task from './task';
import styles from '../styles/tasklist.module.css';
import { useState, useEffect } from 'react';

interface State {
  loaded: boolean,
  new_task: boolean,
  new_task_title: string
  start_idx: number
}


const default_state: State = {
  new_task: false,
  new_task_title: "",
  loaded: false,
  start_idx: 0
}

const TaskList: React.FC = () => {
  let [state, setState] = useState<State>(default_state);
  let [tasks, setTasks] = useState<ITask[]>([]);
  let [page, setPage] = useState(0);

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

  let completeTask = async(task: ITask) => {
    await fetch("http://localhost:8080/api/complete_task", {
      method: 'POST',
      body: JSON.stringify({ id: task.id, completion_state: !task.completed }),
      headers: { 'Content-Type': 'application/json' }
    });

    let arr_task = tasks.find(a => a.id == task.id);
    let idx = tasks.indexOf(arr_task!);
    delete tasks[idx!];
    task.completed = !task.completed;

    let new_tasks = tasks.filter(x => x != null);
    switch(task.completed) {
      case true: {
        setTasks([...new_tasks.slice(0, idx), task, ...new_tasks.slice(idx, new_tasks.length)]);
        break;
      }
      case false: {
        setTasks([...new_tasks.slice(0, idx), task, ...new_tasks.slice(idx, new_tasks.length)]);
        break;
      }
    }
  }

  useEffect(() => {
    getTasks();
  }, []);

  let task_array = tasks
    .slice(page * 4 + state.start_idx, page * 4 + 4)
    .map(elem =>
      <Task
        onComplete={() => completeTask(elem)}
        key={tasks.indexOf(elem)}
        core={elem} 
      />
    )

  if(!state.loaded) { 
    return (
      <div>Loading...</div>
    )
  } else {
    return (
      <div className={styles.taskList}>
        { task_array.length == 0 ?
          <div className={styles.noTasksText}>You have no tasks.</div>
            :
          task_array
        }
          <div className={styles.newTask}>
            <input className={styles.taskTitleInput} type="text" value={state.new_task_title} onChange={(event) => {
              setState({ ...state, new_task_title: event.target.value });
            }} placeholder="Task title" />

            <button className={styles.addTaskButton} onClick={() => {
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
          <div className={styles.paginator}>
            <button className={styles.switchPage} onClick={() => setPage(page - 1)}>{ "<" }</button>
            <button className={styles.mainPage} onClick={() => setPage(page + 1)}>{page + 1}</button>
            <button className={styles.switchPage} onClick={() => setPage(page + 1)}>{ ">" }</button>
          </div>
      </div>
    )
  }
}

export default TaskList;
