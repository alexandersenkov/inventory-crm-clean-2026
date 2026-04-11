import { useEffect, useState } from "react";
import axios from "axios";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedItem, setExpandedItem] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://127.0.0.1:8000/history?limit=200", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch (error) {
      console.error("Ошибка загрузки истории:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(item => {
    const matchesFilter = filter === "all" || item.action === filter;
    const matchesSearch = search === "" || 
      item.user?.toLowerCase().includes(search.toLowerCase()) ||
      item.equipment_name?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getActionInfo = (action) => {
    switch (action) {
      case "CREATE": return { icon: "➕", label: "Добавление", color: "#4caf50", bgColor: "#e8f5e9" };
      case "UPDATE": return { icon: "✏️", label: "Изменение", color: "#2196f3", bgColor: "#e3f2fd" };
      case "DELETE": return { icon: "🗑️", label: "Удаление", color: "#f44336", bgColor: "#ffebee" };
      case "LOGIN": return { icon: "🔐", label: "Вход в систему", color: "#9c27b0", bgColor: "#f3e5f5" };
      case "REGISTER": return { icon: "📝", label: "Регистрация", color: "#ff9800", bgColor: "#fff3e0" };
      default: return { icon: "📋", label: action, color: "#9e9e9e", bgColor: "#f5f5f5" };
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "—";
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const dateStr = date.toLocaleDateString("ru-RU");
    const timeStr = date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    
    if (date.toDateString() === today.toDateString()) {
      return `Сегодня, ${timeStr}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Вчера, ${timeStr}`;
    } else {
      return `${dateStr}, ${timeStr}`;
    }
  };

  const parseChanges = (changesJson) => {
    if (!changesJson) return null;
    try {
      return JSON.parse(changesJson);
    } catch {
      return null;
    }
  };

  // Улучшенная функция рендеринга изменений с поддержкой удаления
  const renderChanges = (changesJson) => {
    const changes = parseChanges(changesJson);
    if (!changes) return null;
    
    // Для UPDATE — показываем изменённые поля
    if (changes.changed && Object.keys(changes.changed).length > 0) {
      return (
        <div style={changesContainerStyle}>
          <div style={changesTitleStyle}>📝 Изменённые поля:</div>
          {Object.entries(changes.changed).map(([field, values]) => (
            <div key={field} style={changeItemStyle}>
              <strong style={fieldNameStyle}>{field}:</strong>{" "}
              <span style={oldValueStyle}>{values.before || "пусто"}</span>
              {" → "}
              <span style={newValueStyle}>{values.after || "пусто"}</span>
            </div>
          ))}
        </div>
      );
    }
    
    // Для CREATE — показываем созданные данные
    if (changes.data) {
      return (
        <div style={changesContainerStyle}>
          <div style={changesTitleStyle}>📋 Созданное оборудование:</div>
          {Object.entries(changes.data).slice(0, 8).map(([key, value]) => (
            value && (
              <div key={key} style={changeItemStyle}>
                <strong style={fieldNameStyle}>{key}:</strong> {value}
              </div>
            )
          ))}
        </div>
      );
    }
    
    // Для DELETE — показываем удалённые данные (ВСЕ поля)
    if (changes.deleted_data) {
      const deletedFields = changes.deleted_data;
      return (
        <div style={changesContainerStyle}>
          <div style={changesTitleStyle}>🗑️ Удалённое оборудование (все данные):</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "4px 16px" }}>
            {Object.entries(deletedFields).map(([key, value]) => {
              // Пропускаем служебные поля
              if (key === "_sa_instance_state" || key === "id") return null;
              return (
                <div key={key} style={{ fontSize: "13px" }}>
                  <strong style={{ color: "#555" }}>{key}:</strong>{" "}
                  <span style={{ color: "#333" }}>{value || "—"}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    return null;
  };

  const stats = {
    total: history.length,
    create: history.filter(h => h.action === "CREATE").length,
    update: history.filter(h => h.action === "UPDATE").length,
    delete: history.filter(h => h.action === "DELETE").length,
    login: history.filter(h => h.action === "LOGIN").length,
  };

  if (loading) {
    return (
      <div style={loadingContainerStyle}>
        <div style={spinnerStyle} />
        <p>Загрузка истории...</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={titleStyle}>
            <span style={titleIconStyle}>📋</span>
            История действий
          </h2>
          <p style={subtitleStyle}>
            Всего записей: {stats.total} • 
            <span style={{ color: "#4caf50" }}> Добавлений: {stats.create}</span> • 
            <span style={{ color: "#2196f3" }}> Изменений: {stats.update}</span> • 
            <span style={{ color: "#f44336" }}> Удалений: {stats.delete}</span>
          </p>
        </div>
      </div>

      <div style={filterBarStyle}>
        <div style={filterButtonsStyle}>
          <button onClick={() => setFilter("all")} style={{...filterButtonStyle, background: filter === "all" ? "#1976d2" : "transparent", color: filter === "all" ? "white" : "#666"}}>
            Все ({stats.total})
          </button>
          <button onClick={() => setFilter("CREATE")} style={{...filterButtonStyle, background: filter === "CREATE" ? "#4caf50" : "transparent", color: filter === "CREATE" ? "white" : "#666"}}>
            ➕ Добавления ({stats.create})
          </button>
          <button onClick={() => setFilter("UPDATE")} style={{...filterButtonStyle, background: filter === "UPDATE" ? "#2196f3" : "transparent", color: filter === "UPDATE" ? "white" : "#666"}}>
            ✏️ Изменения ({stats.update})
          </button>
          <button onClick={() => setFilter("DELETE")} style={{...filterButtonStyle, background: filter === "DELETE" ? "#f44336" : "transparent", color: filter === "DELETE" ? "white" : "#666"}}>
            🗑️ Удаления ({stats.delete})
          </button>
        </div>
        
        <input
          type="text"
          placeholder="🔍 Поиск по пользователю или оборудованию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchInputStyle}
        />
      </div>

      <div style={timelineStyle}>
        {filteredHistory.length === 0 ? (
          <div style={emptyStateStyle}>
            <span style={{ fontSize: "48px", marginBottom: "16px" }}>📭</span>
            <p style={{ color: "#999", fontSize: "16px" }}>
              {search ? "Ничего не найдено" : "История пуста"}
            </p>
          </div>
        ) : (
          filteredHistory.map((item, index) => {
            const actionInfo = getActionInfo(item.action);
            const isExpanded = expandedItem === item.id;
            
            return (
              <div key={item.id} style={timelineItemStyle}>
                {index < filteredHistory.length - 1 && <div style={timelineLineStyle} />}
                
                <div style={{...timelineIconStyle, background: actionInfo.bgColor, color: actionInfo.color}}>
                  {actionInfo.icon}
                </div>
                
                <div 
                  style={{...timelineContentStyle, cursor: item.changes ? "pointer" : "default"}}
                  onClick={() => item.changes && setExpandedItem(isExpanded ? null : item.id)}
                >
                  <div style={timelineHeaderStyle}>
                    <div>
                      <span style={{...actionBadgeStyle, background: actionInfo.bgColor, color: actionInfo.color}}>
                        {actionInfo.label}
                      </span>
                      {item.equipment_name && (
                        <span style={equipmentNameStyle}>
                          {item.equipment_name}
                          <span style={equipmentIdStyle}>ID: {item.equipment_id}</span>
                        </span>
                      )}
                    </div>
                    <span style={timestampStyle}>{formatDate(item.timestamp)}</span>
                  </div>
                  
                  <div style={userInfoStyle}>
                    <span>👤</span>
                    <span style={userNameStyle}>{item.user}</span>
                    {item.ip_address && <span style={ipStyle}>🌐 {item.ip_address}</span>}
                  </div>
                  
                  {item.changes && (
                    <div>
                      {isExpanded ? (
                        renderChanges(item.changes)
                      ) : (
                        <div style={expandHintStyle}>
                          👆 Нажмите, чтобы посмотреть детали
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Стили (аналогичны предыдущим)
const expandHintStyle = {
  fontSize: "12px",
  color: "#1976d2",
  marginTop: "8px",
  fontStyle: "italic"
};

const changeItemStyle = {
  marginBottom: "4px",
  fontSize: "13px"
};

const fieldNameStyle = {
  color: "#555",
  minWidth: "100px",
  display: "inline-block"
};

const oldValueStyle = {
  color: "#f44336",
  textDecoration: "line-through"
};

const newValueStyle = {
  color: "#4caf50",
  fontWeight: "500"
};

const changesContainerStyle = {
  background: "#f9f9f9",
  borderRadius: "8px",
  padding: "12px 16px",
  marginTop: "12px"
};

const changesTitleStyle = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#666",
  marginBottom: "8px",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const containerStyle = {
  minHeight: "100vh",
  background: "#f5f7fa",
  padding: "24px"
};

const headerStyle = {
  maxWidth: "900px",
  margin: "0 auto 24px auto"
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

const filterBarStyle = {
  maxWidth: "900px",
  margin: "0 auto 24px auto",
  display: "flex",
  gap: "16px",
  alignItems: "center",
  flexWrap: "wrap"
};

const filterButtonsStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap"
};

const filterButtonStyle = {
  padding: "8px 16px",
  border: "1px solid #ddd",
  borderRadius: "20px",
  fontSize: "14px",
  cursor: "pointer",
  transition: "all 0.2s",
  fontWeight: "500"
};

const searchInputStyle = {
  flex: 1,
  minWidth: "250px",
  padding: "10px 16px",
  fontSize: "14px",
  border: "1px solid #ddd",
  borderRadius: "20px",
  outline: "none"
};

const timelineStyle = {
  maxWidth: "900px",
  margin: "0 auto",
  position: "relative"
};

const timelineItemStyle = {
  position: "relative",
  paddingLeft: "60px",
  marginBottom: "24px"
};

const timelineLineStyle = {
  position: "absolute",
  left: "23px",
  top: "48px",
  bottom: "-24px",
  width: "2px",
  background: "linear-gradient(to bottom, #ddd, #eee)"
};

const timelineIconStyle = {
  position: "absolute",
  left: 0,
  top: 0,
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  zIndex: 2
};

const timelineContentStyle = {
  background: "white",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  border: "1px solid #eee",
  transition: "box-shadow 0.2s"
};

const timelineHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "12px"
};

const actionBadgeStyle = {
  padding: "4px 10px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: "600",
  marginRight: "12px"
};

const equipmentNameStyle = {
  fontSize: "16px",
  fontWeight: "500",
  color: "#333"
};

const equipmentIdStyle = {
  marginLeft: "8px",
  fontSize: "12px",
  color: "#999",
  fontWeight: "normal"
};

const timestampStyle = {
  fontSize: "13px",
  color: "#999"
};

const userInfoStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "8px",
  padding: "8px 0"
};

const userNameStyle = {
  fontWeight: "500",
  color: "#555"
};

const ipStyle = {
  fontSize: "12px",
  color: "#aaa"
};

const emptyStateStyle = {
  textAlign: "center",
  padding: "60px 20px",
  background: "white",
  borderRadius: "12px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
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