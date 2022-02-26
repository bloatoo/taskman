import { useEffect } from 'react';
import styles from './App.module.css';

function App() {
  useEffect(() => {
    fetch("http://localhost:8080/task/69").then(res=>res.json()).then(json=>console.log(json));
  }, [])

  return (
    <div className="App">
    </div>
  );
}

export default App;
