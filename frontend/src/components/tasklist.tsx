/// FIXME: the task names get shifted
import { Task as ITask } from '../interfaces';
import Task from './task';
import styles from '../styles/tasklist.module.css';
import { useState, useEffect } from 'react';

interface State {
  loaded: boolean,
  new_task_title: string
}

const default_state: State = {
  new_task_title: "",
  loaded: false,
}

interface Props {
  str: ITask;
}

const Ta: React.FC<Props> = ({ str }) => {
  return (
    <h1>{ str.title }</h1>
  )
}

const TaskList: React.FC = () => {
  let [state, setState] = useState<State>(default_state);
  let [tasks, setTasks] = useState<ITask[]>([]);
  let [page, setPage] = useState(0);

  let getTasks = async() => {
    let res = await fetch("http://localhost:8080/api/tasks");
    let tasks: ITask[] = await res.json();

    tasks.map(x => x.created_at_time = x.created_at_time.split(".")[0]);

    setState({ ...state, loaded: true });
    setTasks(tasks);
  }

  let submitTask = async(title: string) => {
    let res = await fetch("http://localhost:8080/api/new_task", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title }),
    });

    let json: ITask = await res.json();

    setState({ ...state, new_task_title: "" });

    return json;
  }

  console.log(tasks);

  let completeTask = async(task: ITask) => {
    await fetch("http://localhost:8080/api/complete_task", {
      method: 'POST',
      body: JSON.stringify({ id: task.id, completion_state: !task.completed }),
      headers: { 'Content-Type': 'application/json' }
    });

    let arr_task = tasks.find(a => a.id === task.id);
    let idx = tasks.indexOf(arr_task!);
    delete tasks[idx!];
    task.completed = !task.completed;

    let new_tasks = tasks.filter(x => x != null);

    setTasks([...new_tasks.slice(0, idx), task, ...new_tasks.slice(idx, new_tasks.length)]);
  }

  let deleteTask = async(task: ITask) => {
    await fetch("http://localhost:8080/api/delete_task", {
      method: 'POST',
      body: JSON.stringify({ id: task.id }),
      headers: { 'Content-Type': 'application/json' },
    });

    let newTasks = tasks.filter(x => x.id !== task.id);
    setTasks(newTasks);
  }

  let renameTask = async(task: ITask) => {}

  useEffect(() => {
    getTasks();
  }, []);

  let nPages = Math.floor(tasks.length % 4 === 0 ? tasks.length / 4 : tasks.length / 4 + 1);

  useEffect(() => {
    if(page + 1 > nPages && nPages > 0) {
      setPage(prev => prev - 1);
    }
  }, [tasks])

  if(!state.loaded) { 
    return (
      <div>Loading...</div>
    )
  } else {
    let pageArray = [];

    for(let i = 0; i < nPages; i++) {
      let name = i === page ? styles.currentPageIndicator : styles.pageIndicator;
      pageArray.push(<button key={i} onClick={() => setPage(i)} className={name}>{ i + 1 }</button>);
    }
    return (
      <div className={styles.taskList}>
        { tasks.length === 0 ?
          <div className={styles.noTasksText}>You have no tasks.</div>
            :
            tasks
            .slice(page * 4, page * 4 + 4)
            .map(elem =>
              <Task
                onComplete={() => completeTask(elem)}
                onDelete={() => deleteTask(elem)}
                key={tasks.indexOf(elem)}
                core={elem} 
              />
              )
        }
          <div className={styles.newTask}>
            <input className={styles.taskTitleInput} type="text" value={state.new_task_title} onChange={(event) => {
              setState({ ...state, new_task_title: event.target.value });
            }} placeholder="Task title" />

            <button className={styles.addTaskButton} onClick={() => {
              submitTask(state.new_task_title).then(task => {
                task.created_at_time = task.created_at_time.split(".")[0];
                setTasks([task, ...tasks])
              });
            }}>
              Add Task
            </button>
          </div>

          { nPages > 1 ?
          <div className={styles.paginator}>
            { tasks.length !== 0 ?
            <button
              className={styles.switchPage}
              onClick={() => { if(page > 0) setPage(page - 1) }}
            >{ "<" }</button> : null }
            { pageArray }
            { tasks.length !== 0 ?
            <button
              className={styles.switchPage}
              onClick={() => { if(page + 1 < nPages) setPage(page + 1) }}
                >{ ">" }</button>
              : null }
          </div>
          : null }
      </div>
    )
  }
}

export default TaskList;
