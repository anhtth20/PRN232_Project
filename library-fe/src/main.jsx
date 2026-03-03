import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider, App as AntApp } from 'antd'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2563eb',
          colorLink: '#2563eb',
          borderRadius: 8,
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
        },
        components: {
          Layout: {
            headerBg: '#ffffff',
            footerBg: '#f8fafc',
            bodyBg: '#ffffff',
          },
          Menu: {
            itemSelectedBg: '#eff6ff',
            itemSelectedColor: '#2563eb',
            itemHoverBg: '#eff6ff',
            itemHoverColor: '#2563eb',
          },
        },
      }}
    >
      <AntApp>
        <App />
      </AntApp>
    </ConfigProvider>
  </StrictMode>,
)
