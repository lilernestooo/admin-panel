import React from 'react'
import { Navigate } from 'react-router-dom'
import { message } from 'antd'

export default function ProtectedRoute({ children, allowedRoles }) {
  const storedUser = localStorage.getItem('admin_user')

  if (!storedUser) {
    return <Navigate to="/login" replace />
  }

  let user
  try {
    user = JSON.parse(storedUser)
  } catch (err) {
    localStorage.removeItem('admin_user')
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.user_rights)) {
    localStorage.removeItem('admin_user')
    message.error('You do not have permission to access this page')
    return <Navigate to="/login" replace />
  }

  return children
}