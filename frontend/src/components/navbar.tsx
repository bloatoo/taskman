import styles from '../styles/navbar.module.css';
import { useState, useEffect } from 'react';

interface Props {
  onDarkMode: (darkMode: boolean) => any;
}

const Navbar: React.FC<Props> = ({ onDarkMode }) => {
  let [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const json = JSON.parse(localStorage.getItem("site-dark-mode")!);

    if(json !== null) {
      if(json === true) {
        onDarkMode(true);
      }
      setDarkMode(json);
    }
  }, []);

  return (
    <div className={styles.navbar}>
      <div></div>
      <div className={styles.items}>
          <a onClick={() => {
              const json = JSON.stringify(!darkMode);
              localStorage.setItem("site-dark-mode", json);
              onDarkMode(!darkMode);
              setDarkMode(prev => !prev);
          }}>{ darkMode ? "Light Mode" : "Dark Mode" }</a>
      </div>
    </div>
  )
}

export default Navbar;
