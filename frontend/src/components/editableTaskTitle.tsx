import { useState, useEffect } from 'react';
import styles from '../styles/editableTaskTitle.module.css';

interface Props {
  completed: boolean;
  text: string;
  onRename: (new_title: string) => Promise<any>;
}

const EditableTaskTitle: React.FC<Props> = ({ text, completed, onRename }) => {
  let [state, setState] = useState(false);
  let [name, setName] = useState(text);
  let [prevName, setPrevName] = useState(text);

  useEffect(() => {
    setName(text);
  }, [text])

  return state ?
  <div onClick={(e) => e.stopPropagation() } className={styles.titleEditor}>
      <input
        onKeyDown={(e) => {
          if(e.key == "Enter") {
            setState(false);
            onRename(name);
            setPrevName(name);
          } else if(e.key == "Escape") {
            setState(false);
            setName(prevName);
          }
        }}
        onBlur={() => {
          setState(false);
          onRename(name);
          setPrevName(name);
        }}
        onChange={(e) => setName(e.target.value)}
        value={name}
        className={styles.nameInput}
        type="text"
      />
    </div> 
    :
      completed ?
      <h1 className={styles.completed} onClick={(e) => {
        e.stopPropagation();
        setState(true)
      }}>{ name }</h1>
      :
      <h1 className={styles.uncompleted} onClick={(e) => {
        e.stopPropagation();
        setState(true)
      }}>{ name }</h1>
}

export default EditableTaskTitle;
