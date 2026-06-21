import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Import pages
import Landing from "../pages/Landing/Landing";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import CreateRequest from "../pages/CreateRequest/CreateRequest";
import RequestDetails from "../pages/RequestDetails/RequestDetails";
import RunnerRequests from "../pages/RunnerRequests/RunnerRequests";
import MyRequests from "../pages/MyRequests/MyRequests";
import Payments from "../pages/Payments/Payments";
import Profile from "../pages/Profile/Profile";
import Admin from "../pages/Admin/Admin";

// Layout components
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", color: "var(--text-secondary)"
      }}>
        <h2>Loading Session...</h2>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !user.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ flex: 1, paddingBottom: "3rem" }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

/* Dashboard and Profile have their own layouts (sidebar/header), so no Navbar/Footer */
function ProtectedRouteNoNav({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", color: "var(--text-secondary)"
      }}>
        <h2>Loading Session...</h2>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !user.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Dashboard — uses its own sidebar layout */}
      <Route path="/dashboard" element={
        <ProtectedRouteNoNav>
          <Dashboard />
        </ProtectedRouteNoNav>
      } />

      {/* Profile — uses its own header layout */}
      <Route path="/profile" element={
        <ProtectedRouteNoNav>
          <Profile />
        </ProtectedRouteNoNav>
      } />

      {/* Standard Protected Routes with Navbar/Footer */}
      <Route path="/create-request" element={
        <ProtectedRoute>
          <CreateRequest />
        </ProtectedRoute>
      } />
      
      <Route path="/requests/:id" element={
        <ProtectedRoute>
          <RequestDetails />
        </ProtectedRoute>
      } />
      
      <Route path="/requests/runs" element={
        <ProtectedRoute>
          <RunnerRequests />
        </ProtectedRoute>
      } />
      
      <Route path="/requests/my" element={
        <ProtectedRoute>
          <MyRequests />
        </ProtectedRoute>
      } />

      <Route path="/payments" element={
        <ProtectedRoute>
          <Payments />
        </ProtectedRoute>
      } />

      {/* Admin Protected Routes */}
      <Route path="/admin" element={
        <ProtectedRoute adminOnly={true}>
          <Admin />
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

