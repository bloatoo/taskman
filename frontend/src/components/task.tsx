import { Task as ITask } from '../interfaces';
import styles from '../styles/task.module.css';
import EditableTaskTitle from './editableTaskTitle';
import { isToday, formatTimeHm } from '../dateUtils';

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

  let time = formatTimeHm(core.created_at_time);
  let dateString = isToday(core.created_at_date) ? `Today at ${time}` : `On ${core.created_at_date.replace("-", "/")} at ${time}`;

  return (
    <div onClick={onComplete} className={styles.task}>
      <div onClick={(e) => e.stopPropagation()} className={styles.textContainer}>
        <EditableTaskTitle
          text={core.title}
          completed={core.completed}
          onRename={onRename}
        />
        <p className={styles.completionState}>{dateString}</p>
      </div>
      <div onClick={(e) => e.stopPropagation()} className={styles.buttonContainer}>
        <button onClick={() => onDelete()} className={styles.deleteButton}>🞩</button>
      </div>
    </div>
  )
}


export default Task;
