import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { Analytics } from '@vercel/analytics/react';
import './index.css'
import { ConfigProvider } from 'antd'

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
    <Analytics></Analytics>
    </ConfigProvider>
  </React.StrictMode>,
)
