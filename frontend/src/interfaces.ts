export interface Task {
  title: string,
  completed: boolean,
  id: number,
  createdAt: string;
}

export interface NewTask {
  title: string;
  deadlineTimestamp: string | null;
}
