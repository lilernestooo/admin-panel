import React from 'react'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const user = localStorage.getItem('admin_user')
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}