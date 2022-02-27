import Navbar from './navbar';
import styles from '../styles/main.module.css';
import TaskList from './tasklist';

const Main: React.FC = () => {
  return (
    <div>
      <Navbar />
      <div className={styles.mainContainer}>
        <TaskList />
      </div>
    </div>
  )
}

export default Main;
