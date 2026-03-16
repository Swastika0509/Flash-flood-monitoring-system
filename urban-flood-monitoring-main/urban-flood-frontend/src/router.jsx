import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Login from './pages/Login'
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'settings', element: <Settings /> },
      { path: 'login', element: <Login /> },
    ],
  },
])

export default router
