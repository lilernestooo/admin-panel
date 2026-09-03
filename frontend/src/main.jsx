import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, theme } from 'antd'
import App from './App.jsx'
import './index.css'

const bwTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#000000',
    colorLink: '#000000',
    colorLinkHover: '#404040',
    colorText: '#0a0a0a',
    colorTextSecondary: '#595959',
    colorBorder: '#d9d9d9',
    colorBgLayout: '#ffffff',
    colorBgContainer: '#ffffff',
    borderRadius: 2,
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  components: {
    Button: {
      colorPrimary: '#111111',
      colorPrimaryHover: '#333333',
      colorPrimaryActive: '#000000',
      defaultBorderColor: '#111111',
      defaultColor: '#111111',
    },
    Table: {
      headerBg: '#0a0a0a',
      headerColor: '#ffffff',
      rowHoverBg: '#f5f5f5',
    },
  },
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider theme={bwTheme}>
      <App />
    </ConfigProvider>
  </React.StrictMode>,
)