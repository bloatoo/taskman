import { useState } from 'react';
import styles from '../styles/editableTaskTitle.module.css';

interface Props {
  completed: boolean;
  text: string;
  onRename: (new_title: string) => Promise<any>;
}

const EditableTaskTitle: React.FC<Props> = ({ text, completed, onRename }) => {
  let [state, setState] = useState(false);
  let [name, setName] = useState(text);

  return state ?
    <div className={styles.titleEditor}>
      <input
        onBlur={() => {
          setState(false)
          onRename(name);
        }}
        onChange={(e) => setName(e.target.value)}
        value={name}
        className={styles.nameInput}
        type="text"
      />
      { /* <button className={styles.saveButton}>Save</button>
      <button onClick={() => setName(name)} className={styles.cancelButton}>Cancel</button> */ }
    </div> 
    :
      completed ?
        <h1 className={styles.completed} onClick={() => setState(true)}>{ name }</h1>
      :
        <h1 className={styles.uncompleted} onClick={() => setState(true)}>{ name }</h1>
} 

export default EditableTaskTitle;
