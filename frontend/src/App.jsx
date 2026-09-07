import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import User from './pages/User'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import SessionManager from './components/SessionManager'

export default function App() {
  return (
    <BrowserRouter>
      <SessionManager />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <User />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}