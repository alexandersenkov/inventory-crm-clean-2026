import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Equipment from "./pages/Equipment";
import AddEquipment from "./pages/AddEquipment";
import EditEquipment from "./pages/EditEquipment";
import EquipmentView from "./pages/EquipmentView";
import Login from "./pages/Login";
import History from "./pages/History";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";

function Navbar({ user, setUser }) {
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const menu = [
    { name: "📊 Дашборд", path: "/" },
    { name: "🖥️ Оборудование", path: "/equipment" },
    { name: "📋 История", path: "/history" },
  ];

  if (user?.role === "admin") {
    menu.push({ name: "👥 Пользователи", path: "/users" });
  }

  return (
    <div style={navbarStyle}>
      <div style={logoStyle}>
        <Link to="/" style={logoLinkStyle}>
          <span style={logoIconStyle}>📦</span>
          <span style={logoTextStyle}>Inventory CRM</span>
        </Link>
      </div>

      <div style={menuStyle}>
        {menu.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...menuItemStyle,
                background: isActive ? "#1976d2" : "transparent",
                color: isActive ? "white" : "#555",
                border: isActive ? "1px solid #1976d2" : "1px solid transparent",
              }}
            >
              {item.name}
            </Link>
          );
        })}
      </div>

      <div style={userStyle}>
        {user && (
          <div style={userInfoStyle}>
            <div style={userAvatarStyle}>
              {user.username[0].toUpperCase()}
            </div>
            <div style={userDetailsStyle}>
              <span style={userNameStyle}>{user.username}</span>
              <span style={userRoleStyle}>
                {user.role === "admin" ? "Администратор" : "Пользователь"}
              </span>
            </div>
            <button onClick={logout} style={logoutButtonStyle}>
              🚪 Выйти
            </button>
          </div>
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
      <div style={appStyle}>
        {user && <Navbar user={user} setUser={setUser} />}
        
        <div style={contentStyle}>
          <Routes>
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/equipment" element={<PrivateRoute><Equipment /></PrivateRoute>} />
            <Route path="/equipment/add" element={<PrivateRoute><AddEquipment /></PrivateRoute>} />
            <Route path="/equipment/edit/:id" element={<PrivateRoute><EditEquipment /></PrivateRoute>} />
            <Route path="/equipment/view/:identifier" element={<PrivateRoute><EquipmentView /></PrivateRoute>} />
            <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
            <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

// Стили оставлены без изменений (как в последней версии)
const appStyle = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column"
};

const navbarStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 32px",
  background: "white",
  borderBottom: "1px solid #e0e0e0",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  position: "sticky",
  top: 0,
  zIndex: 100
};

const logoStyle = {
  display: "flex",
  alignItems: "center"
};

const logoLinkStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  textDecoration: "none"
};

const logoIconStyle = {
  fontSize: "28px"
};

const logoTextStyle = {
  fontSize: "20px",
  fontWeight: "700",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text"
};

const menuStyle = {
  display: "flex",
  gap: "8px",
  flex: 1,
  justifyContent: "center"
};

const menuItemStyle = {
  padding: "10px 24px",
  fontSize: "15px",
  fontWeight: "500",
  textDecoration: "none",
  borderRadius: "30px",
  transition: "all 0.25s ease",
  display: "flex",
  alignItems: "center",
  gap: "6px"
};

const userStyle = {
  display: "flex",
  alignItems: "center"
};

const userInfoStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px"
};

const userAvatarStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "600",
  fontSize: "16px"
};

const userDetailsStyle = {
  display: "flex",
  flexDirection: "column"
};

const userNameStyle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#333"
};

const userRoleStyle = {
  fontSize: "11px",
  color: "#999"
};

const logoutButtonStyle = {
  background: "transparent",
  border: "1px solid #ddd",
  padding: "8px 16px",
  borderRadius: "30px",
  fontSize: "13px",
  fontWeight: "500",
  color: "#666",
  cursor: "pointer",
  transition: "all 0.2s ease",
  marginLeft: "8px",
  display: "flex",
  alignItems: "center",
  gap: "6px"
};

const contentStyle = {
  flex: 1,
  background: "#f5f7fa"
};