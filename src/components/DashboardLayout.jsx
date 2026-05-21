import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Package, Search, Mail, Lock, LayoutDashboard, ClipboardList, LogOut, Moon, Activity, PlusCircle, Menu, X } from 'lucide-react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import toast from 'react-hot-toast';
import { useInventory } from '../context/InventoryContext';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading } = useInventory();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const inactivityTimer = useRef(null);
  const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdminLoggedIn(!!user);
      if (user) {
        sessionStorage.setItem('admin_auth', 'true');
      } else {
        sessionStorage.removeItem('admin_auth');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
        inactivityTimer.current = null;
      }
      await signOut(auth);
      sessionStorage.removeItem('admin_auth');
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  // Inactivity logout: reset timer on activity; logout after INACTIVITY_TIMEOUT
  useEffect(() => {
    const resetTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(async () => {
        if (isAdminLoggedIn) {
          try {
            await signOut(auth);
            sessionStorage.removeItem('admin_auth');
            toast('Logged out due to inactivity');
            navigate('/admin/login');
          } catch (err) {
            console.error('Auto-logout failed', err);
          }
        }
      }, INACTIVITY_TIMEOUT);
    };

    if (!isAdminLoggedIn) {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
        inactivityTimer.current = null;
      }
      return;
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'click'];
    const activityHandler = () => resetTimer();
    events.forEach(ev => window.addEventListener(ev, activityHandler));
    // start the timer
    resetTimer();

    return () => {
      events.forEach(ev => window.removeEventListener(ev, activityHandler));
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
        inactivityTimer.current = null;
      }
    };
  }, [isAdminLoggedIn, navigate]);

  const navLinkStyle = ({ isActive }) => {
    return {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '8px',
      textDecoration: 'none',
      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
      background: isActive ? 'white' : 'transparent',
      fontWeight: isActive ? '600' : '500',
      transition: 'all 0.2s',
      boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
    };
  };

  // Determine header title based on path
  const getPageTitle = () => {
    if (location.pathname === '/') return 'Client Dashboard';
    if (location.pathname === '/contact') return 'Contact Admin';
    if (location.pathname.includes('/admin/inventory')) return 'Inventory Management';
    if (location.pathname.includes('/admin/requests')) return 'Requests & Messages';
    if (location.pathname.includes('/admin/add-item')) return 'Add New Item';
    if (location.pathname.includes('/admin/login')) return 'Admin Login';
    return 'Dashboard';
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', background: 'var(--bg-color)', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid rgba(0,0,0,0.1)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>Loading...</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Please wait while we fetch the inventory data</p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div className="layout-container">
      {/* Background Orbs */}
      <div className="ambient-orb orb-1"></div>
      <div className="ambient-orb orb-2"></div>
      
      {/* Sidebar Overlay for Mobile */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={closeSidebar}></div>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo Section */}
        <div className="flex items-center justify-between" style={{ padding: '24px', borderBottom: '1px solid rgba(0,0,0,0.05)', marginBottom: '24px' }}>
          <div className="flex items-center" style={{ gap: '12px' }}>
            <div style={{ background: 'white', padding: '8px', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={24} color="var(--accent-color)" />
            </div>
            <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: '700' }}>Nazir.</h2>
          </div>
          <button className="hamburger-btn" onClick={closeSidebar} style={{ padding: 0 }}>
            <X size={24} />
          </button>
        </div>
        
        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 16px', flexGrow: 1 }} onClick={closeSidebar}>
          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 16px', marginTop: '8px' }}>
            Client
          </div>
          <NavLink to="/" style={navLinkStyle}>
            <Search size={18} /> Browse Items
          </NavLink>
          <NavLink to="/contact" style={navLinkStyle}>
            <Mail size={18} /> Contact Admin
          </NavLink>

          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 16px', marginTop: '24px' }}>
            Admin
          </div>
          {!isAdminLoggedIn ? (
            <NavLink to="/admin/login" style={navLinkStyle}>
              <Lock size={18} /> Admin Login
            </NavLink>
          ) : (
            <>
              <NavLink to="/admin/inventory" style={navLinkStyle}>
                <Package size={20} /> Inventory
              </NavLink>
              <NavLink to="/admin/add-item" style={navLinkStyle}>
                <PlusCircle size={20} /> Add New Item
              </NavLink>
              <NavLink to="/admin/profile" style={navLinkStyle}>
                <Activity size={18} /> Profile
              </NavLink>
              <NavLink to="/admin/add-admin" style={navLinkStyle}>
                <Lock size={20} /> Add Admin
              </NavLink>
              <NavLink to="/admin/requests" style={navLinkStyle}>
                <ClipboardList size={18} /> Manage Requests
              </NavLink>
            </>
          )}
        </nav>
        
        {/* Footer Area */}
        <div style={{ padding: '24px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>@2026 Nazir</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Top Header */}
        <header className="main-header">
          <div className="flex items-center" style={{ gap: '12px' }}>
            <button className="hamburger-btn" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>{getPageTitle()}</h1>
          </div>
          
          <div className="flex items-center" style={{ gap: '16px' }}>
            {isAdminLoggedIn ? (
              <button className="btn btn-primary" onClick={handleLogout} style={{ borderRadius: '6px' }}>
                Logout
              </button>
            ) : (
              <button className="btn btn-primary hide-on-mobile" onClick={() => navigate('/admin/login')} style={{ borderRadius: '6px' }}>
                Admin
              </button>
            )}
            <button className="btn-secondary hide-on-mobile" style={{ padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Moon size={18} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="main-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
