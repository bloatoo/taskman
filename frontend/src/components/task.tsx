import { Task as ITask } from '../interfaces';
import styles from '../styles/task.module.css';

interface Props {
  core: ITask
}

const Task: React.FC<Props> = ({ core }) => {
  return (
    <div className={styles.task}>
      <h1 className={styles.taskTitle}>{core.title}</h1>
    </div>
  )
}

export default Task;
