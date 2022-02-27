import { Task as ITask } from '../interfaces';
import styles from '../styles/task.module.css';

interface Props {
  core: ITask
  onClick: () => Promise<any>
}

const Task: React.FC<Props> = ({ core, onClick }) => {
  let completion_string = core.completed ? "Completed" : "Not completed";

  return (
    <div onClick={onClick} className={styles.task}>
      { core.completed ?
        <h1 className={styles.completedTaskTitle}>{core.title}</h1>
      :
        <h1 className={styles.uncompletedTaskTitle}>{core.title}</h1>
      }
      <p className={styles.completionState}>{completion_string}</p>
    </div>
  )
}

export default Task;
