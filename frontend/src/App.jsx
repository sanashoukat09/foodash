import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/common/Toast';
import { ProtectedRoute } from './components/common';
import Navbar from './components/layout/Navbar';

import Home from './pages/Home';
import Restaurants from './pages/Restaurants';
import RestaurantDetail from './pages/RestaurantDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import OrderTracking from './pages/OrderTracking';
import CustomerOrders from './pages/CustomerOrders';
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import DriverDashboard from './pages/driver/DriverDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <Navbar />
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/restaurants" element={<Restaurants />} />
              <Route path="/restaurant/:id" element={<RestaurantDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Customer */}
              <Route path="/cart" element={
                <ProtectedRoute roles={['customer']}>
                  <Cart />
                </ProtectedRoute>
              } />
              <Route path="/order/:id" element={
                <ProtectedRoute>
                  <OrderTracking />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute roles={['customer']}>
                  <CustomerOrders />
                </ProtectedRoute>
              } />

              {/* Restaurant Owner */}
              <Route path="/restaurant" element={
                <ProtectedRoute roles={['restaurant_owner']}>
                  <RestaurantDashboard />
                </ProtectedRoute>
              } />

              {/* Driver */}
              <Route path="/driver" element={
                <ProtectedRoute roles={['driver']}>
                  <DriverDashboard />
                </ProtectedRoute>
              } />

              {/* Admin */}
              <Route path="/admin" element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              {/* 404 */}
              <Route path="*" element={
                <div className="page">
                  <div className="container" style={{textAlign:'center',paddingTop:100}}>
                    <p style={{fontSize:80,marginBottom:20}}>🍕</p>
                    <h1 style={{fontFamily:'Syne',fontSize:48,fontWeight:800,marginBottom:12}}>404</h1>
                    <p style={{color:'var(--text-muted)',marginBottom:32,fontSize:18}}>Oops! This page got delivered to the wrong address.</p>
                    <a href="/" className="btn btn-primary btn-lg">Back to Home</a>
                  </div>
                </div>
              } />
            </Routes>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
