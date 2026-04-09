import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Equipment from "./pages/Equipment";
import AddEquipment from "./pages/AddEquipment";
import EditEquipment from "./pages/EditEquipment";
import Login from "./pages/Login";
import History from "./pages/History";
import Dashboard from "./pages/Dashboard";

function Navbar({ user, setUser }) {
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const menu = [
    { name: "Dashboard", path: "/" },
    { name: "Оборудование", path: "/equipment" },
    { name: "История", path: "/history" },
  ];

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "15px 30px",
      background: "#fff",
      borderBottom: "1px solid #ddd"
    }}>
      <div style={{ display: "flex", gap: "20px" }}>
        {menu.map(item => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              textDecoration: "none",
              color: location.pathname === item.path ? "#1976d2" : "#333",
              fontWeight: location.pathname === item.path ? "bold" : "normal"
            }}
          >
            {item.name}
          </Link>
        ))}
      </div>

      <div>
        {user && (
          <>
            <span style={{ marginRight: "15px" }}>
              👤 {user.username} ({user.role})
            </span>
            <button onClick={logout}>Выйти</button>
          </>
        )}
      </div>
    </div>
  );
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  const [user, setUser] = React.useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  return (
    <Router>
      {user && <Navbar user={user} setUser={setUser} />}

      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />

        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/equipment" element={<PrivateRoute><Equipment /></PrivateRoute>} />
        <Route path="/equipment/add" element={<PrivateRoute><AddEquipment /></PrivateRoute>} />
        <Route path="/equipment/edit/:id" element={<PrivateRoute><EditEquipment /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;