import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { InventoryProvider } from './context/InventoryContext';
import DashboardLayout from './components/DashboardLayout';

// Client Views
import ClientHome from './pages/client/ClientHome';
import ContactAdmin from './components/ContactAdmin';

// Admin Views
import AdminLogin from './pages/admin/AdminLogin';
import InventoryManager from './pages/admin/InventoryManager';
import ItemForm from './pages/admin/ItemForm';
import RequestsManager from './pages/admin/RequestsManager';
import AddAdmin from './pages/admin/AddAdmin';
import Profile from './pages/admin/Profile';

// Simple Auth Guard for Admin
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('admin_auth') === 'true';
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" />;
  }
  return children;
};

function App() {
  return (
    <InventoryProvider>
      <Toaster position="bottom-right" toastOptions={{ 
        style: { fontFamily: 'Outfit, sans-serif', borderRadius: '8px' } 
      }} />
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            {/* Client Routes */}
            <Route path="/" element={<ClientHome />} />
            <Route path="/contact" element={
              <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <ContactAdmin />
              </div>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/inventory" element={
              <ProtectedRoute>
                <InventoryManager />
              </ProtectedRoute>
            } />
            <Route path="/admin/add-item" element={
              <ProtectedRoute>
                <ItemForm />
              </ProtectedRoute>
            } />
            <Route path="/admin/edit-item/:id" element={
              <ProtectedRoute>
                <ItemForm />
              </ProtectedRoute>
            } />
            <Route path="/admin/add-admin" element={
              <ProtectedRoute>
                <AddAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/admin/requests" element={
              <ProtectedRoute>
                <RequestsManager />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </InventoryProvider>
  );
}

export default App;
