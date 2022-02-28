import styles from '../styles/main.module.css';
import TaskList from './tasklist';
import Navbar from './navbar';
import Timer from './timer';
import { useState, useEffect } from 'react';

interface Props {
  onDarkMode: (darkMode: boolean) => any;
}

const Main: React.FC<Props> = ({ onDarkMode }) => {
  return (
    <div>
      <Navbar onDarkMode={onDarkMode} />
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
