import { Task as ITask, NewTask } from '../interfaces';
import Task from './task';
import styles from '../styles/tasklist.module.css';
import { useState, useEffect, useRef } from 'react';
import { getDate } from '../dateUtils';

const DEFAULT_TASK_ARRAY: ITask[] = [{
  title: "",
  createdAt: "2020-12-31T10:00:00.1555",
  completed: true,
  id: 9999,
  deadline: null
}]

const TaskList: React.FC = () => {
  let [tasks, setTasks] = useState<ITask[]>(DEFAULT_TASK_ARRAY);

  let [page, setPage] = useState(0);
  let [isNewTask, setIsNewTask] = useState(false);

  let getTasks = async() => {
    let res = await fetch("http://localhost:8080/api/tasks");
    let tasks: ITask[] = await res.json();
    setTasks(tasks);
  }

  let submitTask = async(task: NewTask) => {
    let res = await fetch("http://localhost:8080/api/new_task", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });

    let json: ITask = await res.json();

    return json;
  }

  let completeTask = async(task: ITask) => {
    await fetch("http://localhost:8080/api/complete_task", {
      method: 'POST',
      body: JSON.stringify({ id: task.id, completionState: !task.completed }),
      headers: { 'Content-Type': 'application/json' }
    });

    let arrTask = tasks.find(a => a.id === task.id);
    console.log(arrTask);
    let idx = tasks.indexOf(arrTask!);
    delete tasks[idx!];
    task.completed = !task.completed;

    let newTasks = tasks.filter(x => x != null);

    setTasks([...newTasks.slice(0, idx), task, ...newTasks.slice(idx, newTasks.length)]);
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
                key={elem.id}
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
    let ref = useRef<any>();
    let [title, setTitle] = useState("");
    let [deadlineDate, setDeadlineDate] = useState("");
    let [deadlineTime, setDeadlineTime] = useState("");

    return (
      <div className={styles.newTaskView}>
        <h1 className={styles.noTasksText}>Add New Task</h1>
        <input className={styles.taskTitleInput} placeholder="Task title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className={styles.dateTimePicker}>
          <input
            className={styles.datePicker}
            ref={ref}
            onFocus={() => (ref.current.type = "date")}
            onBlur={() => (ref.current.type = "text")}
            onChange={(e) => setDeadlineDate(e.target.value)}
            placeholder="Deadline date"
            type="text" />
          <input className={styles.timePicker} placeholder="Deadline time" onChange={(e) => setDeadlineTime(e.target.value)} type="text" />
        </div>
        <button className={styles.addTaskButton} onClick={() => {
          let newTask: NewTask = {
            title: title,
            deadline: `${deadlineDate} ${deadlineTime}`
          }

          let valid = validateAndFix(newTask);

          if(valid !== null) {
            setIsNewTask(false);
            submitTask(valid).then(newTask => {
              setTasks([newTask, ...tasks])
              setTitle("");
            })
          }
        }}>Add Task</button>

        <button className={styles.cancelAddingTaskButton} onClick={() => {
          setIsNewTask(false);
          setTitle("");
        }}>Cancel</button>
      </div>
    )
  }

  return isNewTask ? <NewTaskView /> : <TaskListInner />
}

function validateAndFix(task: NewTask): NewTask | null {
  if(task.title === "") {
    return null;
  }

  if(task.deadline !== null) {
    let [date, time] = task.deadline.split(" ");

    if(time != "" && !/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      return null;
    }

    if(date == "") {
      if(time != "") {
        date = getDate(new Date().toISOString());
      } else {
        time = "23:59";
      }
    }

    return {
      title: task.title,
      deadline: [date, time].join(" ")
    }
  }

  return {
    title: task.title,
    deadline: null
  }
}

export default TaskList;
