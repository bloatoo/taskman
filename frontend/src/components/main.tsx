import styles from '../styles/main.module.css';
import TaskList from './tasklist';
import Navbar from './navbar';
import Timer from './timer';
import { useState, useEffect } from 'react';

const setVar = (key: string, value: string) => {
  document.documentElement.style.setProperty(key, value);
}

const switchColors = (darkMode: boolean) => {
  if(darkMode) {
    setVar('--background', '#141414');
    setVar('--inputBackground', '#191919');
    setVar('--placeholder', '#999');
    setVar('--foreground', '#fff');
    setVar('--lightForeground', '#aaa');
    setVar('--inverseForeground', '#fff');
    setVar('--taskListBackground', '#121212');
    setVar('--border', '#181818');
    setVar('--hoverBackground', '#181818');
    setVar('--buttonBackground', 'orange');
  } else {
    setVar('--background', '#fff');
    setVar('--inputBackground', '#fff');
    setVar('--foreground', '#1d1f21');
    setVar('--lightForeground', '#aaa');
    setVar('--inverseForeground', '#fff');
    setVar('--taskListBackground', '#fbfbfb');
    setVar('--border', '#eaeaea');
    setVar('--hoverBackground', '#f9f9f9');
    setVar('--buttonBackground', 'blue');
  }
}

const Main: React.FC = () => {
  return (
    <div>
      <Navbar onDarkMode={switchColors} />
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
