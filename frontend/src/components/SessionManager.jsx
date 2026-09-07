import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'
import { isSessionExpired, refreshActivity, clearSession } from '../utils/session'

export default function SessionManager() {
  const navigate = useNavigate()

  useEffect(() => {
    const checkExpiry = () => {
      const storedUser = localStorage.getItem('admin_user')
      if (!storedUser) return

      if (isSessionExpired()) {
        clearSession()
        message.warning('Your session has expired. Please log in again.')
        navigate('/login', { replace: true })
      }
    }

    const handleActivity = () => {
      const storedUser = localStorage.getItem('admin_user')
      if (storedUser && !isSessionExpired()) {
        refreshActivity()
      }
    }

    const interval = setInterval(checkExpiry, 15000) // check every 15s

    const events = ['mousemove', 'keydown', 'click', 'scroll']
    events.forEach((event) => window.addEventListener(event, handleActivity))

    return () => {
      clearInterval(interval)
      events.forEach((event) => window.removeEventListener(event, handleActivity))
    }
  }, [navigate])

  return null
}