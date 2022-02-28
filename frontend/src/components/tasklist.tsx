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

  let deleteTask = async(task: ITask) => {
    await fetch("http://localhost:8080/api/delete_task", {
      method: 'POST',
      body: JSON.stringify({ id: task.id }),
      headers: { 'Content-Type': 'application/json' },
    });

    setTasks(tasks.filter(x => x.id != task.id));
  }

  useEffect(() => {
    getTasks();
  }, []);

  let taskArray = tasks
    .slice(page * 4 + state.start_idx, page * 4 + 4)
    .map(elem =>
      <Task
        onComplete={() => completeTask(elem)}
        onDelete={() => deleteTask(elem)}
        key={tasks.indexOf(elem)}
        core={elem} 
      />
    )

  if(!state.loaded) { 
    return (
      <div>Loading...</div>
    )
  } else {
    let pageArray = [];

    for(let i = 0; i < Math.floor(tasks.length % 4 == 0 ? tasks.length / 4 : (tasks.length / 4) + 1); i++) {
      let name = i == page ? styles.currentPageIndicator : styles.pageIndicator;
      pageArray.push(<button key={i} onClick={() => setPage(i)} className={name}>{ i + 1 }</button>);
    }
    return (
      <div className={styles.taskList}>
        { taskArray.length == 0 ?
          <div className={styles.noTasksText}>You have no tasks.</div>
            :
          taskArray
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
            { tasks.length != 0 ?
            <button
              className={styles.switchPage}
              onClick={() => { if(page > 0) setPage(page - 1) }}
            >{ "<" }</button> : null }

            { /* <button className={styles.mainPage}>{page + 1}</button> */ }
            { pageArray }

            { tasks.length != 0 ?
            <button
              className={styles.switchPage}
              onClick={() => { if(page * 4 <= taskArray.length) setPage(page + 1) }}
                >{ ">" }</button>
              : null }
          </div>
      </div>
    )
  }
}

export default TaskList;
