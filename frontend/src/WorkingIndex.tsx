import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import WorkingApp from './WorkingApp';
import './index.css';

// Working entry point
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <WorkingApp />
    </BrowserRouter>
  </React.StrictMode>
);