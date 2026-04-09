import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
	username: "",
	password: "",
	confirmPassword: "",
	role: "user"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  // Проверка, является ли текущий пользователь админом
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = currentUser?.role === "admin";

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
	  const headers = token ? { Authorization: `Bearer ${token}` } : {};
	  
	  await axios.post("http://127.0.0.1:8000/register", {
		username: form.username,
		password: form.password,
		role: form.role
	  }, { headers });

	  // Если админ создаёт пользователя, возвращаемся к списку
	  if (isAdmin) {
		navigate("/users");
	  } else {
		// Обычная регистрация — перенаправляем на логин
		alert("Регистрация успешна! Теперь вы можете войти.");
		navigate("/login");
	  }
	} catch (err) {
	  if (err.response?.status === 400) {
		setError("Пользователь с таким логином уже существует");
	  } else {
		setError("Ошибка при регистрации. Попробуйте позже.");
	  }
	} finally {
	  setLoading(false);
	}
  };

  const handleInputChange = (field, value) => {
	setForm({ ...form, [field]: value });
	setError("");
  };

  const handleKeyDown = (e) => {
	if (e.key === "Enter") {
	  handleSubmit(e);
	}
  };

  return (
	<div style={containerStyle}>
	  {/* Декоративный фон */}
	  <div style={backgroundDecorationStyle}>
		<div style={gradientCircle1Style} />
		<div style={gradientCircle2Style} />
		<div style={gradientCircle3Style} />
	  </div>

	  {/* Карточка регистрации */}
	  <div style={cardStyle}>
		<div style={headerStyle}>
		  <div style={logoStyle}>
			<span style={logoIconStyle}>📦</span>
			<span style={logoTextStyle}>Inventory CRM</span>
		  </div>
		  <h1 style={titleStyle}>
			{isAdmin ? "Создание пользователя" : "Регистрация"}
		  </h1>
		  <p style={subtitleStyle}>
			{isAdmin 
			  ? "Создайте нового пользователя системы" 
			  : "Создайте аккаунт для доступа к системе"}
		  </p>
		</div>

		<form onSubmit={handleSubmit} style={formStyle}>
		  {/* Поле Логин */}
		  <div style={inputGroupStyle}>
			<label style={labelStyle}>
			  Логин
			  <span style={requiredStarStyle}>*</span>
			</label>
			<div style={{
			  ...inputWrapperStyle,
			  borderColor: focusedField === "username" ? "#1976d2" : error ? "#f44336" : "#e0e0e0",
			  boxShadow: focusedField === "username" ? "0 0 0 3px rgba(25, 118, 210, 0.1)" : "none"
			}}>
			  <span style={inputIconStyle}>👤</span>
			  <input
				type="text"
				placeholder="Придумайте логин"
				value={form.username}
				onChange={(e) => handleInputChange("username", e.target.value)}
				onFocus={() => setFocusedField("username")}
				onBlur={() => setFocusedField(null)}
				onKeyDown={handleKeyDown}
				style={inputStyle}
				disabled={loading}
				autoComplete="off"
			  />
			</div>
			<span style={hintStyle}>Минимум 3 символа</span>
		  </div>

		  {/* Поле Пароль */}
		  <div style={inputGroupStyle}>
			<label style={labelStyle}>
			  Пароль
			  <span style={requiredStarStyle}>*</span>
			</label>
			<div style={{
			  ...inputWrapperStyle,
			  borderColor: focusedField === "password" ? "#1976d2" : error ? "#f44336" : "#e0e0e0",
			  boxShadow: focusedField === "password" ? "0 0 0 3px rgba(25, 118, 210, 0.1)" : "none"
			}}>
			  <span style={inputIconStyle}>🔒</span>
			  <input
				type={showPassword ? "text" : "password"}
				placeholder="Придумайте пароль"
				value={form.password}
				onChange={(e) => handleInputChange("password", e.target.value)}
				onFocus={() => setFocusedField("password")}
				onBlur={() => setFocusedField(null)}
				onKeyDown={handleKeyDown}
				style={inputStyle}
				disabled={loading}
				autoComplete="new-password"
			  />
			  <button
				type="button"
				onClick={() => setShowPassword(!showPassword)}
				style={passwordToggleStyle}
				disabled={loading}
			  >
				{showPassword ? "👁️" : "👁️‍🗨️"}
			  </button>
			</div>
			<span style={hintStyle}>Минимум 4 символа</span>
		  </div>

		  {/* Поле Подтверждение пароля */}
		  <div style={inputGroupStyle}>
			<label style={labelStyle}>
			  Подтверждение пароля
			  <span style={requiredStarStyle}>*</span>
			</label>
			<div style={{
			  ...inputWrapperStyle,
			  borderColor: focusedField === "confirmPassword" ? "#1976d2" : (error && form.password !== form.confirmPassword) ? "#f44336" : "#e0e0e0",
			  boxShadow: focusedField === "confirmPassword" ? "0 0 0 3px rgba(25, 118, 210, 0.1)" : "none"
			}}>
			  <span style={inputIconStyle}>✓</span>
			  <input
				type={showConfirmPassword ? "text" : "password"}
				placeholder="Повторите пароль"
				value={form.confirmPassword}
				onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
				onFocus={() => setFocusedField("confirmPassword")}
				onBlur={() => setFocusedField(null)}
				onKeyDown={handleKeyDown}
				style={inputStyle}
				disabled={loading}
				autoComplete="off"
			  />
			  <button
				type="button"
				onClick={() => setShowConfirmPassword(!showConfirmPassword)}
				style={passwordToggleStyle}
				disabled={loading}
			  >
				{showConfirmPassword ? "👁️" : "👁️‍🗨️"}
			  </button>
			</div>
		  </div>

		  {/* Выбор роли (только для админов) */}
		  {isAdmin && (
			<div style={inputGroupStyle}>
			  <label style={labelStyle}>
				Роль
				<span style={requiredStarStyle}>*</span>
			  </label>
			  <div style={roleSelectorStyle}>
				<button
				  type="button"
				  onClick={() => handleInputChange("role", "user")}
				  style={{
					...roleButtonStyle,
					background: form.role === "user" ? "#1976d2" : "#f5f5f5",
					color: form.role === "user" ? "white" : "#666"
				  }}
				>
				  <span>👤</span> Пользователь
				</button>
				<button
				  type="button"
				  onClick={() => handleInputChange("role", "admin")}
				  style={{
					...roleButtonStyle,
					background: form.role === "admin" ? "#1976d2" : "#f5f5f5",
					color: form.role === "admin" ? "white" : "#666"
				  }}
				>
				  <span>👑</span> Администратор
				</button>
			  </div>
			</div>
		  )}

		  {/* Сообщение об ошибке */}
		  {error && (
			<div style={errorStyle}>
			  <span style={errorIconStyle}>⚠️</span>
			  {error}
			</div>
		  )}

		  {/* Кнопка отправки */}
		  <button
			type="submit"
			disabled={loading}
			style={{
			  ...submitButtonStyle,
			  opacity: loading ? 0.7 : 1,
			  cursor: loading ? "not-allowed" : "pointer"
			}}
			onMouseEnter={(e) => !loading && (e.target.style.background = "#1565c0")}
			onMouseLeave={(e) => !loading && (e.target.style.background = "#1976d2")}
		  >
			{loading ? (
			  <>
				<span style={spinnerSmallStyle} />
				{isAdmin ? "Создание..." : "Регистрация..."}
			  </>
			) : (
			  <>
				<span>{isAdmin ? "➕" : "📝"}</span>
				{isAdmin ? "Создать пользователя" : "Зарегистрироваться"}
			  </>
			)}
		  </button>

		  {/* Ссылки */}
		  <div style={footerStyle}>
			{!isAdmin && (
			  <>
				<span style={footerTextStyle}>Уже есть аккаунт?</span>
				<Link to="/login" style={footerLinkStyle}>
				  Войти
				</Link>
			  </>
			)}
			{isAdmin && (
			  <button
				type="button"
				onClick={() => navigate("/users")}
				style={cancelButtonStyle}
			  >
				← Назад к списку
			  </button>
			)}
		  </div>
		</form>

		{/* Пароль не для демо */}
		{!isAdmin && (
		  <div style={demoHintStyle}>
			<span style={demoHintTextStyle}>
			  ⚠️ Придумайте надёжный пароль ⚠️
			</span>
		  </div>
		)}
	  </div>

	  <style>{`
		@keyframes float {
		  0%, 100% { transform: translateY(0px); }
		  50% { transform: translateY(-20px); }
		}
		
		@keyframes pulse {
		  0%, 100% { opacity: 0.15; }
		  50% { opacity: 0.25; }
		}
		
		@keyframes spin {
		  0% { transform: rotate(0deg); }
		  100% { transform: rotate(360deg); }
		}
		
		@keyframes slideUp {
		  from {
			opacity: 0;
			transform: translateY(20px);
		  }
		  to {
			opacity: 1;
			transform: translateY(0);
		  }
		}
	  `}</style>
	</div>
  );
}

// ================= СТИЛИ =================

const containerStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  position: "relative",
  overflow: "hidden",
  padding: "20px"
};

const backgroundDecorationStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: "hidden",
  pointerEvents: "none"
};

const gradientCircle1Style = {
  position: "absolute",
  width: "300px",
  height: "300px",
  borderRadius: "50%",
  background: "rgba(255, 255, 255, 0.1)",
  top: "-150px",
  right: "-150px",
  animation: "float 6s ease-in-out infinite"
};

const gradientCircle2Style = {
  position: "absolute",
  width: "200px",
  height: "200px",
  borderRadius: "50%",
  background: "rgba(255, 255, 255, 0.08)",
  bottom: "-100px",
  left: "-100px",
  animation: "float 8s ease-in-out infinite reverse"
};

const gradientCircle3Style = {
  position: "absolute",
  width: "150px",
  height: "150px",
  borderRadius: "50%",
  background: "rgba(255, 255, 255, 0.05)",
  top: "50%",
  left: "10%",
  animation: "pulse 4s ease-in-out infinite"
};

const cardStyle = {
  background: "white",
  borderRadius: "20px",
  padding: "48px 40px",
  width: "100%",
  maxWidth: "460px",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  position: "relative",
  zIndex: 1,
  animation: "slideUp 0.5s ease-out"
};

const headerStyle = {
  textAlign: "center",
  marginBottom: "32px"
};

const logoStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  marginBottom: "24px"
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

const titleStyle = {
  margin: "0 0 8px 0",
  fontSize: "28px",
  fontWeight: "700",
  color: "#1a1a1a"
};

const subtitleStyle = {
  margin: 0,
  fontSize: "14px",
  color: "#666"
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px"
};

const inputGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px"
};

const labelStyle = {
  fontSize: "14px",
  fontWeight: "500",
  color: "#333"
};

const requiredStarStyle = {
  color: "#f44336",
  marginLeft: "4px"
};

const inputWrapperStyle = {
  display: "flex",
  alignItems: "center",
  border: "2px solid #e0e0e0",
  borderRadius: "10px",
  transition: "all 0.2s ease",
  background: "white"
};

const inputIconStyle = {
  padding: "0 0 0 14px",
  display: "flex",
  alignItems: "center",
  fontSize: "16px"
};

const inputStyle = {
  flex: 1,
  padding: "14px 12px",
  border: "none",
  outline: "none",
  fontSize: "15px",
  background: "transparent",
  fontFamily: "inherit"
};

const passwordToggleStyle = {
  background: "none",
  border: "none",
  padding: "0 14px 0 0",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  fontSize: "16px"
};

const hintStyle = {
  fontSize: "12px",
  color: "#999",
  marginTop: "4px"
};

const roleSelectorStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px"
};

const roleButtonStyle = {
  padding: "12px",
  border: "2px solid #e0e0e0",
  borderRadius: "10px",
  fontSize: "14px",
  fontWeight: "500",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  transition: "all 0.2s ease"
};

const errorStyle = {
  background: "#ffebee",
  color: "#c62828",
  padding: "12px 14px",
  borderRadius: "8px",
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  animation: "slideUp 0.3s ease-out"
};

const errorIconStyle = {
  fontSize: "16px"
};

const submitButtonStyle = {
  background: "#1976d2",
  color: "white",
  border: "none",
  borderRadius: "10px",
  padding: "14px",
  fontSize: "16px",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  transition: "all 0.2s ease",
  marginTop: "8px"
};

const spinnerSmallStyle = {
  width: "18px",
  height: "18px",
  border: "2px solid rgba(255,255,255,0.3)",
  borderTopColor: "white",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite",
  display: "inline-block"
};

const footerStyle = {
  textAlign: "center",
  marginTop: "16px"
};

const footerTextStyle = {
  fontSize: "14px",
  color: "#666",
  marginRight: "6px"
};

const footerLinkStyle = {
  fontSize: "14px",
  color: "#1976d2",
  textDecoration: "none",
  fontWeight: "600",
  cursor: "pointer"
};

const cancelButtonStyle = {
  background: "none",
  border: "none",
  color: "#666",
  fontSize: "14px",
  cursor: "pointer",
  padding: "8px 16px"
};

const demoHintStyle = {
  marginTop: "20px",
  textAlign: "center",
  paddingTop: "16px",
  borderTop: "1px solid #eee"
};

const demoHintTextStyle = {
  fontSize: "13px",
  color: "#999"
};