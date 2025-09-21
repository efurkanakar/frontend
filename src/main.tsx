/** @file Application entry point configuring React Query and routing. */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import DashboardPage from './pages/DashboardPage'
import PlanetsPage from './pages/PlanetsPage'
import EndpointsPage from './pages/EndpointsPage'
import AdminDeletedPage from './pages/AdminDeletedPage'
import './styles.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'planets', element: <PlanetsPage /> },
      { path: 'endpoints', element: <EndpointsPage /> },
      { path: 'admin/deleted', element: <AdminDeletedPage /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
)
