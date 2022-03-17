import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Main from './components/main';
import HabitTracker from './components/habitTracker';

interface Props {
  switchColors: (darkMode: boolean) => any;
}

const App: React.FC<Props> = ({ switchColors }) => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<Main onDarkMode={switchColors}/>} />
          <Route path="habits" element={<HabitTracker />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
