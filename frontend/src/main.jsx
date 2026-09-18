import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, theme } from 'antd'
import App from './App.jsx'
import { ThemeProvider, useTheme } from './context/ThemeContext.jsx'
import './index.css'

function ThemedApp() {
  const { isDark } = useTheme()

  const bwTheme = {
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: isDark ? '#f0f0f0' : '#000000',
      colorLink: isDark ? '#f0f0f0' : '#000000',
      colorLinkHover: isDark ? '#bfbfbf' : '#404040',
      colorText: isDark ? '#f0f0f0' : '#0a0a0a',
      colorTextSecondary: isDark ? '#bfbfbf' : '#595959',
      colorBorder: isDark ? '#333333' : '#d9d9d9',
      colorBgLayout: isDark ? '#111111' : '#ffffff',
      colorBgContainer: isDark ? '#1c1c1c' : '#ffffff',
      borderRadius: 2,
      fontFamily: "'Inter', -apple-system, sans-serif",
    },
    components: {
      Button: {
        colorPrimary: isDark ? '#f0f0f0' : '#111111',
        colorPrimaryHover: isDark ? '#d9d9d9' : '#333333',
        colorPrimaryActive: isDark ? '#ffffff' : '#000000',
        primaryColor: isDark ? '#0a0a0a' : '#ffffff',
        defaultBorderColor: isDark ? '#f0f0f0' : '#111111',
        defaultColor: isDark ? '#f0f0f0' : '#111111',
      },
      Table: {
        headerBg: isDark ? '#2a2a2a' : '#534f4f',
        headerColor: isDark ? '#f0f0f0' : '#0a0a0a',
        rowHoverBg: isDark ? '#262626' : '#f5f5f5',
        colorBgContainer: isDark ? '#1c1c1c' : '#ffffff',
      },
    },
  }

  return (
    <ConfigProvider theme={bwTheme}>
      <App />
    </ConfigProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  </React.StrictMode>,
)