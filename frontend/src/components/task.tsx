import { Task as ITask } from '../interfaces';

interface Props {
  core: ITask
}

const Task: React.FC<Props> = ({ core }) => {
  return (
    <div>{core.title}</div>
  )
}

export default Task;
