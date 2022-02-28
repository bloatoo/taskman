import styles from '../styles/navbar.module.css';

function Navbar() {
  return (
    <div className={styles.navbar}>
      <div></div>
      <div className={styles.items}>
        <a>Tasks</a>
        <a>Timer</a>
      </div>
    </div>
  )
}

export default Navbar;
