import styles from '../styles/main.module.css';
import TaskList from './tasklist';

const Main: React.FC = () => {
  return (
    <div>
      <div className={styles.mainContainer}>
        <div className={styles.placeholder}>
        </div>
        <TaskList />
      </div>
    </div>
  )
}

export default Main;
