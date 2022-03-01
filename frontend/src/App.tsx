import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Main from './components/main';
import HabitView from './components/habit';

interface Props {
  switchColors: (darkMode: boolean) => any;
}

const App: React.FC<Props> = ({ switchColors }) => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<Main onDarkMode={switchColors}/>} />
          <Route path="habits" element={<HabitView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
