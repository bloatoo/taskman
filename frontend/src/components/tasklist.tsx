import { Task as ITask } from '../interfaces';
import Task from './task';
import styles from '../styles/tasklist.module.css';
import { useState, useEffect } from 'react';

const DEFAULT_TASK_ARRAY: ITask[] = [{
  title: "",
  created_at: "2020-12-31T10:00:00.1555",
  completed: true,
  id: 9999
}]

const TaskList: React.FC = () => {
  let [tasks, setTasks] = useState<ITask[]>(DEFAULT_TASK_ARRAY);

  let [page, setPage] = useState(0);
  let [isNewTask, setIsNewTask] = useState(false);

  let getTasks = async() => {
    let res = await fetch("http://localhost:8080/api/tasks");
    let tasks: ITask[] = await res.json();
    console.log(tasks);

    setTasks(tasks);
  }

  let submitTask = async(title: string, deadline: string | null) => {
    let res = await fetch("http://localhost:8080/api/new_task", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title }),
    });

    let json: ITask = await res.json();

    return json;
  }

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

  useEffect(() => {
    getTasks();
  }, []);

  let nPages = Math.floor(tasks.length % 4 === 0 ? tasks.length / 4 : tasks.length / 4 + 1);

  useEffect(() => {
    if(page + 1 > nPages && nPages > 0) {
      setPage(prev => prev - 1);
    }
  }, [tasks])

  let TaskListInner: React.FC = () => {

  if(tasks == DEFAULT_TASK_ARRAY) { 
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
          <button className={styles.addTaskButton} onClick={() => {
             setIsNewTask(true);
          }}>
            Add Task
          </button>

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

  let NewTaskView: React.FC = () => {
    let [title, setTitle] = useState("");

    return (
      <div className={styles.newTaskView}>
        <input className={styles.taskTitleInput} placeholder="Task title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button className={styles.addTaskButton} onClick={() => {
          setIsNewTask(false);
          submitTask(title, null).then(newTask => {
            setTasks([newTask, ...tasks])
            setTitle("");
          })
        }}>Add Task</button>
      </div>
    )
  }

  return isNewTask ? <NewTaskView /> : <TaskListInner />
}

export default TaskList;
