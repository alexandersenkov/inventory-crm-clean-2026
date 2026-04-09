import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ================= КОМПОНЕНТ МОДАЛЬНОГО ОКНА ДЛЯ СОЗДАНИЯ ПОЛЬЗОВАТЕЛЯ =================
function AddUserModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
	username: "",
	password: "",
	confirmPassword: "",
	role: "user"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateForm = () => {
	if (!form.username.trim()) {
	  setError("Введите логин");
	  return false;
	}
	if (form.username.length < 3) {
	  setError("Логин должен быть не менее 3 символов");
	  return false;
	}
	if (!form.password) {
	  setError("Введите пароль");
	  return false;
	}
	if (form.password.length < 4) {
	  setError("Пароль должен быть не менее 4 символов");
	  return false;
	}
	if (form.password !== form.confirmPassword) {
	  setError("Пароли не совпадают");
	  return false;
	}
	return true;
  };

  const handleSubmit = async (e) => {
	e.preventDefault();
	
	if (!validateForm()) return;

	setLoading(true);
	setError("");

	try {
	  const token = localStorage.getItem("token");
	  
	  await axios.post("http://127.0.0.1:8000/register", {
		username: form.username,
		password: form.password,
		role: form.role
	  }, {
		headers: { Authorization: `Bearer ${token}` }
	  });

	  onSuccess();
	  onClose();
	} catch (err) {
	  if (err.response?.status === 400) {
		setError("Пользователь с таким логином уже существует");
	  } else {
		setError("Ошибка при создании пользователя");
	  }
	} finally {
	  setLoading(false);
	}
  };

  return (
	<div style={modalOverlayStyle} onClick={onClose}>
	  <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
		<div style={modalHeaderStyle}>
		  <h3 style={modalTitleStyle}>➕ Создание пользователя</h3>
		  <button onClick={onClose} style={modalCloseStyle}>✕</button>
		</div>

		<form onSubmit={handleSubmit}>
		  <div style={inputGroupStyle}>
			<label style={labelStyle}>Логин *</label>
			<input
			  type="text"
			  placeholder="Введите логин"
			  value={form.username}
			  onChange={(e) => setForm({ ...form, username: e.target.value })}
			  style={{...inputStyle, borderColor: error && !form.username ? "#f44336" : "#ddd"}}
			  disabled={loading}
			  autoFocus
			/>
		  </div>

		  <div style={inputGroupStyle}>
			<label style={labelStyle}>Пароль *</label>
			<div style={passwordWrapperStyle}>
			  <input
				type={showPassword ? "text" : "password"}
				placeholder="Введите пароль"
				value={form.password}
				onChange={(e) => setForm({ ...form, password: e.target.value })}
				style={{...inputStyle, paddingRight: "40px", borderColor: error && !form.password ? "#f44336" : "#ddd"}}
				disabled={loading}
			  />
			  <button
				type="button"
				onClick={() => setShowPassword(!showPassword)}
				style={passwordToggleStyle}
			  >
				{showPassword ? "👁️" : "👁️‍🗨️"}
			  </button>
			</div>
		  </div>

		  <div style={inputGroupStyle}>
			<label style={labelStyle}>Подтверждение пароля *</label>
			<input
			  type={showPassword ? "text" : "password"}
			  placeholder="Повторите пароль"
			  value={form.confirmPassword}
			  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
			  style={{...inputStyle, borderColor: error && form.password !== form.confirmPassword ? "#f44336" : "#ddd"}}
			  disabled={loading}
			/>
		  </div>

		  <div style={inputGroupStyle}>
			<label style={labelStyle}>Роль *</label>
			<div style={roleSelectorStyle}>
			  <button
				type="button"
				onClick={() => setForm({ ...form, role: "user" })}
				style={{
				  ...roleButtonStyle,
				  background: form.role === "user" ? "#1976d2" : "#f5f5f5",
				  color: form.role === "user" ? "white" : "#666",
				  borderColor: form.role === "user" ? "#1976d2" : "#ddd"
				}}
			  >
				👤 Пользователь
			  </button>
			  <button
				type="button"
				onClick={() => setForm({ ...form, role: "admin" })}
				style={{
				  ...roleButtonStyle,
				  background: form.role === "admin" ? "#1976d2" : "#f5f5f5",
				  color: form.role === "admin" ? "white" : "#666",
				  borderColor: form.role === "admin" ? "#1976d2" : "#ddd"
				}}
			  >
				👑 Администратор
			  </button>
			</div>
		  </div>

		  {error && (
			<div style={errorStyle}>
			  <span>⚠️</span> {error}
			</div>
		  )}

		  <div style={modalActionsStyle}>
			<button
			  type="button"
			  onClick={onClose}
			  style={cancelButtonStyle}
			  disabled={loading}
			>
			  Отмена
			</button>
			<button
			  type="submit"
			  style={submitButtonStyle}
			  disabled={loading}
			>
			  {loading ? (
				<>
				  <span style={spinnerSmallStyle} />
				  Создание...
				</>
			  ) : (
				"Создать"
			  )}
			</button>
		  </div>
		</form>
	  </div>
	</div>
  );
}

// ================= ОСНОВНОЙ КОМПОНЕНТ USERS =================
export default function Users() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
	fetchData();
	getCurrentUser();
  }, []);

  const getCurrentUser = () => {
	const userStr = localStorage.getItem("user");
	if (userStr) {
	  setCurrentUser(JSON.parse(userStr));
	}
  };

  const fetchData = async () => {
	try {
	  const token = localStorage.getItem("token");
	  const [usersRes, statsRes] = await Promise.all([
		axios.get("http://127.0.0.1:8000/users", {
		  headers: { Authorization: `Bearer ${token}` }
		}),
		axios.get("http://127.0.0.1:8000/users/stats", {
		  headers: { Authorization: `Bearer ${token}` }
		})
	  ]);
	  setUsers(usersRes.data);
	  setStats(statsRes.data);
	} catch (error) {
	  if (error.response?.status === 403) {
		alert("Доступ запрещён. Требуются права администратора.");
		navigate("/");
	  }
	  console.error("Ошибка загрузки:", error);
	} finally {
	  setLoading(false);
	}
  };

  const handleDeleteUser = async (userId, username) => {
	if (!confirm(`Удалить пользователя "${username}"?`)) return;
	
	try {
	  const token = localStorage.getItem("token");
	  await axios.delete(`http://127.0.0.1:8000/users/${userId}`, {
		headers: { Authorization: `Bearer ${token}` }
	  });
	  fetchData();
	} catch (error) {
	  alert("Ошибка при удалении: " + (error.response?.data?.detail || "Неизвестная ошибка"));
	}
  };

  const handleUpdateRole = async (userId, newRole) => {
	try {
	  const token = localStorage.getItem("token");
	  await axios.put(`http://127.0.0.1:8000/users/${userId}`, 
		{ role: newRole },
		{ headers: { Authorization: `Bearer ${token}` } }
	  );
	  fetchData();
	  setEditingUser(null);
	} catch (error) {
	  alert("Ошибка при обновлении роли");
	}
  };

  const getRoleBadge = (role) => {
	switch (role) {
	  case "admin":
		return <span style={adminBadgeStyle}>👑 Админ</span>;
	  case "user":
		return <span style={userBadgeStyle}>👤 Пользователь</span>;
	  default:
		return <span style={defaultBadgeStyle}>{role}</span>;
	}
  };

  if (loading) {
	return (
	  <div style={loadingContainerStyle}>
		<div style={spinnerStyle} />
		<p>Загрузка пользователей...</p>
	  </div>
	);
  }

  return (
	<div style={containerStyle}>
	  {showAddModal && (
		<AddUserModal 
		  onClose={() => setShowAddModal(false)} 
		  onSuccess={fetchData}
		/>
	  )}

	  <div style={headerStyle}>
		<div>
		  <h1 style={titleStyle}>
			<span style={titleIconStyle}>👥</span>
			Управление пользователями
		  </h1>
		  <p style={subtitleStyle}>
			Всего пользователей: {stats?.total || 0}
		  </p>
		</div>
		<button
		  onClick={() => setShowAddModal(true)}
		  style={addButtonStyle}
		>
		  ➕ Добавить пользователя
		</button>
	  </div>

	  {stats && (
		<div style={statsGridStyle}>
		  <div style={statCardStyle}>
			<div style={statIconStyle}>👥</div>
			<div style={statValueStyle}>{stats.total}</div>
			<div style={statLabelStyle}>Всего пользователей</div>
		  </div>
		  <div style={statCardStyle}>
			<div style={statIconStyle}>👑</div>
			<div style={statValueStyle}>{stats.by_role?.admin || 0}</div>
			<div style={statLabelStyle}>Администраторов</div>
		  </div>
		  <div style={statCardStyle}>
			<div style={statIconStyle}>👤</div>
			<div style={statValueStyle}>{stats.by_role?.user || 0}</div>
			<div style={statLabelStyle}>Пользователей</div>
		  </div>
		  <div style={statCardStyle}>
			<div style={statIconStyle}>🟢</div>
			<div style={statValueStyle}>{stats.active_today || 0}</div>
			<div style={statLabelStyle}>Активных сегодня</div>
		  </div>
		</div>
	  )}

	  <div style={tableContainerStyle}>
		<table style={tableStyle}>
		  <thead>
			<tr>
			  <th style={thStyle}>ID</th>
			  <th style={thStyle}>Логин</th>
			  <th style={thStyle}>Роль</th>
			  <th style={thStyle}>Действия</th>
			</tr>
		  </thead>
		  <tbody>
			{users.map(user => (
			  <tr key={user.id} style={trStyle}>
				<td style={tdStyle}>{user.id}</td>
				<td style={tdStyle}>
				  <div style={userCellStyle}>
					<span style={userAvatarStyle}>
					  {user.username[0].toUpperCase()}
					</span>
					<span style={userNameStyle}>{user.username}</span>
					{currentUser?.username === user.username && (
					  <span style={youBadgeStyle}>Вы</span>
					)}
				  </div>
				</td>
				<td style={tdStyle}>
				  {editingUser === user.id ? (
					<select
					  defaultValue={user.role}
					  onChange={(e) => handleUpdateRole(user.id, e.target.value)}
					  onBlur={() => setEditingUser(null)}
					  style={roleSelectStyle}
					  autoFocus
					>
					  <option value="user">Пользователь</option>
					  <option value="admin">Администратор</option>
					</select>
				  ) : (
					<span 
					  style={{ cursor: "pointer" }}
					  onClick={() => currentUser?.role === "admin" && setEditingUser(user.id)}
					>
					  {getRoleBadge(user.role)}
					</span>
				  )}
				</td>
				<td style={tdStyle}>
				  {currentUser?.username !== user.username && currentUser?.role === "admin" && (
					<button
					  onClick={() => handleDeleteUser(user.id, user.username)}
					  style={deleteButtonStyle}
					  title="Удалить пользователя"
					>
					  🗑️
					</button>
				  )}
				</td>
			  </tr>
			))}
		  </tbody>
		</table>
	  </div>

	  <style>{`
		@keyframes spin {
		  0% { transform: rotate(0deg); }
		  100% { transform: rotate(360deg); }
		}
	  `}</style>
	</div>
  );
}

// ================= СТИЛИ =================

const containerStyle = {
  padding: "24px",
  maxWidth: "1200px",
  margin: "0 auto"
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "28px"
};

const titleStyle = {
  margin: 0,
  fontSize: "28px",
  fontWeight: "600",
  color: "#1a1a1a",
  display: "flex",
  alignItems: "center",
  gap: "12px"
};

const titleIconStyle = {
  background: "#1976d2",
  color: "white",
  width: "40px",
  height: "40px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px"
};

const subtitleStyle = {
  margin: "8px 0 0 52px",
  color: "#666",
  fontSize: "14px"
};

const addButtonStyle = {
  padding: "12px 24px",
  background: "#1976d2",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "500",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  transition: "background 0.2s"
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "16px",
  marginBottom: "24px"
};

const statCardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  textAlign: "center"
};

const statIconStyle = {
  fontSize: "28px",
  marginBottom: "8px"
};

const statValueStyle = {
  fontSize: "32px",
  fontWeight: "700",
  color: "#333"
};

const statLabelStyle = {
  fontSize: "13px",
  color: "#666",
  marginTop: "4px"
};

const tableContainerStyle = {
  background: "white",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  overflow: "hidden"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse"
};

const thStyle = {
  textAlign: "left",
  padding: "16px 20px",
  background: "#f9f9f9",
  fontWeight: "600",
  fontSize: "14px",
  color: "#555",
  borderBottom: "1px solid #eee"
};

const trStyle = {
  borderBottom: "1px solid #f0f0f0"
};

const tdStyle = {
  padding: "14px 20px",
  fontSize: "14px"
};

const userCellStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px"
};

const userAvatarStyle = {
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  background: "#1976d2",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "600",
  fontSize: "14px"
};

const userNameStyle = {
  fontWeight: "500",
  color: "#333"
};

const youBadgeStyle = {
  background: "#e3f2fd",
  color: "#1976d2",
  padding: "2px 8px",
  borderRadius: "12px",
  fontSize: "11px",
  fontWeight: "600",
  marginLeft: "8px"
};

const adminBadgeStyle = {
  background: "#fff3e0",
  color: "#e65100",
  padding: "4px 12px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: "600"
};

const userBadgeStyle = {
  background: "#e8f5e9",
  color: "#2e7d32",
  padding: "4px 12px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: "600"
};

const defaultBadgeStyle = {
  background: "#f5f5f5",
  color: "#666",
  padding: "4px 12px",
  borderRadius: "20px",
  fontSize: "12px"
};

const deleteButtonStyle = {
  background: "none",
  border: "none",
  fontSize: "16px",
  cursor: "pointer",
  padding: "4px 8px",
  borderRadius: "4px",
  opacity: 0.7,
  transition: "all 0.2s"
};

const roleSelectStyle = {
  padding: "6px 10px",
  borderRadius: "6px",
  border: "1px solid #ddd",
  fontSize: "13px",
  outline: "none"
};

const loadingContainerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "400px"
};

const spinnerStyle = {
  width: "40px",
  height: "40px",
  border: "3px solid #f3f3f3",
  borderTop: "3px solid #1976d2",
  borderRadius: "50%",
  animation: "spin 1s linear infinite"
};

// Стили модального окна
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000
};

const modalStyle = {
  background: "white",
  borderRadius: "16px",
  padding: "24px",
  width: "100%",
  maxWidth: "450px",
  maxHeight: "90vh",
  overflow: "auto",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
};

const modalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "24px"
};

const modalTitleStyle = {
  margin: 0,
  fontSize: "20px",
  fontWeight: "600",
  color: "#333"
};

const modalCloseStyle = {
  background: "none",
  border: "none",
  fontSize: "20px",
  cursor: "pointer",
  color: "#999",
  padding: "4px 8px"
};

const inputGroupStyle = {
  marginBottom: "16px"
};

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontSize: "14px",
  fontWeight: "500",
  color: "#555"
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  fontSize: "14px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  outline: "none",
  boxSizing: "border-box"
};

const passwordWrapperStyle = {
  position: "relative"
};

const passwordToggleStyle = {
  position: "absolute",
  right: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "16px"
};

const roleSelectorStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px"
};

const roleButtonStyle = {
  padding: "10px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "500",
  cursor: "pointer",
  transition: "all 0.2s"
};

const errorStyle = {
  background: "#ffebee",
  color: "#c62828",
  padding: "10px 12px",
  borderRadius: "8px",
  fontSize: "13px",
  marginBottom: "16px",
  display: "flex",
  alignItems: "center",
  gap: "8px"
};

const modalActionsStyle = {
  display: "flex",
  gap: "10px",
  marginTop: "24px"
};

const cancelButtonStyle = {
  flex: 1,
  padding: "12px",
  background: "#f5f5f5",
  border: "none",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "500",
  cursor: "pointer"
};

const submitButtonStyle = {
  flex: 1,
  padding: "12px",
  background: "#1976d2",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "500",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px"
};

const spinnerSmallStyle = {
  width: "16px",
  height: "16px",
  border: "2px solid rgba(255,255,255,0.3)",
  borderTopColor: "white",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite",
  display: "inline-block"
};