export interface Task {
  title: string,
  completed: boolean,
  id: number,
  createdAt: string;
  deadline: string | null;
}

export interface NewTask {
  title: string;
  deadline: string | null;
}

export interface Habit {
  title: string;
  day: string;
  id: number;
  last_completed: string;
}
