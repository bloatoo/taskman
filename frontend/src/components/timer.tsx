import { useState } from 'react';
import styles from '../styles/timer.module.css';

interface Props {
  initialSeconds: number
}

const formatTime = (seconds: number)=> {
  let formattedSeconds = seconds % 60 > 10 ? `${seconds % 60}` : `0${seconds % 60}`; 
  return `${Math.floor(seconds / 60)}:${formattedSeconds}`;
}

const Timer: React.FC<Props> = ({ initialSeconds }) => {
  let [seconds, setSeconds] = useState(initialSeconds);
  let [f, setF] = useState<any>(null);
  let [isBreak, setBreak] = useState(false);

  return (
    <div className={styles.timerContainer}>
      <h1 className={styles.timer}>{ formatTime(seconds) }</h1>
      <div className={styles.buttons}>
        { f == null ?
          <button className={styles.startButton} onClick={() =>{
            setF(setInterval(() => {
              if(seconds === 0) {
                if(isBreak) {
                  setSeconds(initialSeconds)
                } else {
                  setSeconds(5 * 60);
                }
                setBreak(prevBreak => !prevBreak);
              } else {
                setSeconds(prevSeconds =>  prevSeconds - 1)
              }
            }, 1000));
          }}>{ seconds === initialSeconds ? "Start" : "Resume" }</button>
          :
          <button className={styles.pauseButton} onClick={() => {
            clearInterval(f);
            setF(null);
          }}>Pause</button> }
        <button className={styles.resetButton} onClick={() => setSeconds(initialSeconds)}>Reset</button>
      </div>
    </div>
  )
}

export default Timer;
