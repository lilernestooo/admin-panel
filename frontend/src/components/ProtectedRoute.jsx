import React from 'react'
import { Navigate } from 'react-router-dom'
import { message } from 'antd'
import { isSessionExpired, clearSession } from '../utils/session'

export default function ProtectedRoute({ children, allowedRoles }) {
  const storedUser = localStorage.getItem('admin_user')

  if (!storedUser) {
    return <Navigate to="/login" replace />
  }

  if (isSessionExpired()) {
    clearSession()
    message.warning('Your session has expired. Please log in again.')
    return <Navigate to="/login" replace />
  }

  let user
  try {
    user = JSON.parse(storedUser)
  } catch (err) {
    clearSession()
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.user_rights)) {
    clearSession()
    message.error('You do not have permission to access this page')
    return <Navigate to="/login" replace />
  }

  return children
}