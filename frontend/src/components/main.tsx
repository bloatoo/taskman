import styles from '../styles/main.module.css';
import TaskList from './tasklist';
import Navbar from './navbar';
import Timer from './timer';

const Main: React.FC = () => {
  return (
    <div>
      <Navbar />
      <div className={styles.mainContainer}>
        <div className={styles.placeholder}>
          <Timer initialSeconds={25*60} />
        </div>
        <TaskList />
      </div>
    </div>
  )
}

export default Main;
