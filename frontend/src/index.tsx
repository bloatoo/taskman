import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

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
    setVar('--buttonHoverBackground', 'orange');
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
    setVar('--buttonBackground', '#0b75f9');
  }
}

const json = JSON.parse(localStorage.getItem("site-dark-mode")!);

if(json !== null) {
  if(json === true) {
    switchColors(true);
  }
}

ReactDOM.render(
  <React.StrictMode>
    <App switchColors={switchColors} />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
