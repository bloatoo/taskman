import styles from '../styles/main.module.css';
import TaskList from './tasklist';
import Navbar from './navbar';

const Main: React.FC = () => {
  return (
    <div>
      <Navbar />
      <div className={styles.mainContainer}>
        <div className={styles.placeholder}>
          <h1 className={styles.title}>Get to WORK!</h1>
        </div>
        <TaskList />
      </div>
    </div>
  )
}

export default Main;
