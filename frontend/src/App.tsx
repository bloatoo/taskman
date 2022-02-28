import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Main from './components/main';
import HabitView from './components/habit';

const setVar = (key: string, value: string) => {
  document.documentElement.style.setProperty(key, value);
}

const switchColors = (darkMode: boolean) => {
  if(darkMode) {
    setVar('--background', '#141414');
    setVar('--inputBackground', '#191919');
    setVar('--placeholder', '#999');
    setVar('--foreground', '#fff');
    setVar('--lightForeground', '#aaa');
    setVar('--inverseForeground', '#fff');
    setVar('--taskListBackground', '#121212');
    setVar('--border', '#181818');
    setVar('--hoverBackground', '#181818');
    setVar('--buttonBackground', 'orange');
  } else {
    setVar('--background', '#fff');
    setVar('--inputBackground', '#fff');
    setVar('--foreground', '#1d1f21');
    setVar('--lightForeground', '#aaa');
    setVar('--inverseForeground', '#fff');
    setVar('--taskListBackground', '#fbfbfb');
    setVar('--border', '#eaeaea');
    setVar('--hoverBackground', '#f9f9f9');
    setVar('--buttonBackground', 'blue');
  }
}

function App() {
  useEffect(() => {
    const json = JSON.parse(localStorage.getItem("site-dark-mode")!);

    if(json !== null) {
      if(json === true) {
        switchColors(true);
      }
    }
  }, []);

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
