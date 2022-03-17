import { useState, useEffect } from 'react';
import { Habit as IHabit } from '../interfaces';

const HabitTracker: React.FC = () => {
  let [habits, setHabits] = useState<IHabit[]>([]);

  let getHabits = async() => {
    let res = await fetch("http://localhost:8080/habits");

    let json: IHabit[] = await res.json();
    setHabits(json);
  }

  useEffect(() => {
    getHabits();
  }, [])

  let habitsArray = habits.map(x => <h1 key={habits.indexOf(x)}>{x.title}</h1>);

  return (
    <div>
      { habitsArray }
    </div>
  )
}

export default HabitTracker;
