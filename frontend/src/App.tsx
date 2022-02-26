import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Main from './components/main';
import HabitView from './components/habit';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<Main />} />
          <Route path="habits" element={<HabitView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
