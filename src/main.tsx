import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { inject } from '@vercel/analytics';
import { ConfigProvider } from 'antd'
import { primaryColor } from './someVar.ts';

inject();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: primaryColor,
          
        }
      }}
    >
      {/* <div
      className='bg'
      >の</div> */}
      <App />
    </ConfigProvider>
  </React.StrictMode>,
)
