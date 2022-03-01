import { Task as ITask } from '../interfaces';
import styles from '../styles/task.module.css';
import EditableTaskTitle from './editableTaskTitle';
import { formatDeadline } from '../dateUtils';

interface Props {
  core: ITask
  onComplete: () => Promise<any>
  onDelete: () => Promise<any>
}

const Task: React.FC<Props> = ({ core, onComplete, onDelete }) => {
  let onRename = async(newTitle: string) => {
    await fetch("http://localhost:8080/api/rename_task", {
      method: 'POST',
      body: JSON.stringify({ id: core.id, newTitle: newTitle }),
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return (
    <div onClick={onComplete} className={styles.task}>
      <div className={styles.textContainer}>
        <EditableTaskTitle
          text={core.title}
          completed={core.completed}
          onRename={onRename}
        />
        { core.deadline ? 
          <p className={styles.completionState}>
            { formatDeadline(core.deadline) }
          </p>
          : 
          null
        }
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
