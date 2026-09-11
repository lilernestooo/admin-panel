import React from 'react'
import { Navigate } from 'react-router-dom'
import { message } from 'antd'
import { isSessionExpired, clearSession } from '../utils/session'
import { logoutUser } from '../api/userApi'

// Best-effort: tell the backend to destroy the real session too, not just
// the local display copy. Fire-and-forget so it never blocks the redirect.
function endSessionEverywhere() {
  logoutUser().catch(() => {})
  clearSession()
}

export default function ProtectedRoute({ children, allowedRoles }) {
  const storedUser = localStorage.getItem('admin_user')

  if (!storedUser) {
    return <Navigate to="/login" replace />
  }

  if (isSessionExpired()) {
    endSessionEverywhere()
    message.warning('Your session has expired. Please log in again.')
    return <Navigate to="/login" replace />
  }

  let user
  try {
    user = JSON.parse(storedUser)
  } catch (err) {
    endSessionEverywhere()
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.user_rights)) {
    // Wrong role for THIS route -- the session itself may still be valid,
    // so don't log them out. Just refuse this page.
    message.error('You do not have permission to access this page')
    return <Navigate to="/dashboard" replace />
  }

  return children
}