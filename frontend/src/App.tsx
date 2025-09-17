import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import LoadingSpinner from './components/LoadingSpinner'

const HomePage = lazy(() => import('./pages/HomePage'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const CheckIn = lazy(() => import('./pages/CheckIn'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/check-in" element={<CheckIn />} />
      </Routes>
    </Suspense>
  )
}

export default App