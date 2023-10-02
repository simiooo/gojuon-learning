import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { inject } from '@vercel/analytics';
import { ConfigProvider } from 'antd'

inject();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
    theme={{
      token: {
        colorPrimary: '#80aa51'
      }
    }}
    >
    <App />
    </ConfigProvider>
  </React.StrictMode>,
)
