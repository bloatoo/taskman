import { Task as ITask } from '../interfaces';
import Task from './task';
import styles from '../styles/tasklist.module.css';

interface Props {
  loaded: boolean,
  tasks: ITask[]
}

const TaskList: React.FC<Props> = ({ tasks, loaded }) => {
  let task_array = [];

  task_array = tasks.map(elem => <Task key={tasks.indexOf(elem)} core={elem} />)

  if(!loaded) { 
    return (
      <div>Loading...</div>
    )
  } else {
    return (
      task_array.length == 0 ?
        <div>No tasks</div>
    :
      <div className={styles.taskList}>{ task_array }</div>
    )
  }
}

export default TaskList;
