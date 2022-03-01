import { Task as ITask } from '../interfaces';
import styles from '../styles/task.module.css';
import EditableTaskTitle from './editableTaskTitle';
import { formatDate, formatTimeHm, getTime, getDate } from '../dateUtils';

interface Props {
  core: ITask
  onComplete: () => Promise<any>
  onDelete: () => Promise<any>
}

const Task: React.FC<Props> = ({ core, onComplete, onDelete }) => {
  let onRename = async(new_title: string) => {
    await fetch("http://localhost:8080/api/rename_task", {
      method: 'POST',
      body: JSON.stringify({ id: core.id, new_title: new_title }),
      headers: { 'Content-Type': 'application/json' }
    })
  }

  let time = formatTimeHm(getTime(core.created_at));

  return (
    <div onClick={onComplete} className={styles.task}>
      <div className={styles.textContainer}>
        <EditableTaskTitle
          text={core.title}
          completed={core.completed}
          onRename={onRename}
        />
        <p className={styles.completionState}>
        </p>
      </div>
      <div onClick={(e) => e.stopPropagation()} className={styles.buttonContainer}>
        <button onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }} className={styles.deleteButton}>🞩</button>
      </div>
    </div>
  )
}


export default Task;
