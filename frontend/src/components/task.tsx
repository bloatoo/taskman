import { Task as ITask } from '../interfaces';
import styles from '../styles/task.module.css';
import EditableTaskTitle from './editableTaskTitle';

interface Props {
  core: ITask
  onComplete: () => Promise<any>
  onDelete: () => Promise<any>
}

const Task: React.FC<Props> = ({ core, onComplete, onDelete }) => {
  let completion_string = core.completed ? "Completed" : "Not completed";

  let onRename = async(new_title: string) => {
    await fetch("http://localhost:8080/api/rename_task", {
      method: 'POST',
      body: JSON.stringify({ id: core.id, new_title: new_title }),
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return (
    <div className={styles.task}>
      <div className={styles.textContainer}>
        <EditableTaskTitle
          text={core.title}
          completed={core.completed}
          onRename={onRename}
        />
        <p
          onClick={onComplete}
          className={styles.completionState}
        >{completion_string} { `| ID: ${core.id}` }</p>
      </div>
      <button onClick={() => onDelete()} className={styles.deleteButton}>🞩</button>
    </div>
  )
}


export default Task;
