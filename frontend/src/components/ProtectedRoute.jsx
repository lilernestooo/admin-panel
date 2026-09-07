import React from 'react'
import { Navigate } from 'react-router-dom'
import { message } from 'antd'

export default function ProtectedRoute({ children, allowedRoles }) {
  const storedUser = localStorage.getItem('admin_user')

  if (!storedUser) {
    return <Navigate to="/login" replace />
  }

  const user = JSON.parse(storedUser)

  if (allowedRoles && !allowedRoles.includes(user.user_rights)) {
    localStorage.removeItem('admin_user')
    message.error('You do not have permission to access this page')
    return <Navigate to="/login" replace />
  }

  return children
}