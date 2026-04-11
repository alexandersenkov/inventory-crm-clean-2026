import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [equipment, setEquipment] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedStreet, setExpandedStreet] = useState(null); // для спойлера локаций
  const [stats, setStats] = useState({
    total: 0,
    inWork: 0,
    inReserve: 0,
    inRepair: 0,
    toWriteOff: 0,
    writtenOff: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const [equipRes, historyRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/equipment?limit=10000", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("http://127.0.0.1:8000/history?limit=10", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const equipData = equipRes.data.items || equipRes.data;
      const equipArray = Array.isArray(equipData) ? equipData : [];
      
      setEquipment(equipArray);
      setHistory(historyRes.data);

      const statsData = {
        total: equipArray.length,
        inWork: equipArray.filter(e => e.status === "в работе").length,
        inReserve: equipArray.filter(e => e.status === "в резерве").length,
        inRepair: equipArray.filter(e => e.status === "в ремонте").length,
        toWriteOff: equipArray.filter(e => e.status === "на списание").length,
        writtenOff: equipArray.filter(e => e.status === "списан").length
      };
      setStats(statsData);
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
    } finally {
      setLoading(false);
    }
  };

  // ========== ПРОИЗВОДИТЕЛИ: полный список ==========
  const vendorStats = equipment.reduce((acc, item) => {
    const vendor = item.vendor?.trim() || "Не указан";
    acc[vendor] = (acc[vendor] || 0) + 1;
    return acc;
  }, {});

  const allVendors = Object.entries(vendorStats)
    .sort((a, b) => b[1] - a[1]); // по убыванию количества

  // ========== ЛОКАЦИИ: группировка по улицам с раскрытием корпусов ==========
  const locationData = equipment.reduce((acc, item) => {
    const street = item.street?.trim() || "Не указана";
    const frame = item.frame ? `Корпус ${item.frame}` : "Без корпуса";
    
    if (!acc[street]) {
      acc[street] = { total: 0, frames: {} };
    }
    acc[street].total += 1;
    acc[street].frames[frame] = (acc[street].frames[frame] || 0) + 1;
    return acc;
  }, {});

  const streets = Object.entries(locationData)
    .sort((a, b) => b[1].total - a[1].total);

  const toggleStreet = (street) => {
    setExpandedStreet(expandedStreet === street ? null : street);
  };

  // ========== Последние действия ==========
  const recentActions = history.slice(0, 5);

  const getActionIcon = (action) => {
    switch (action) {
      case "CREATE": return "➕";
      case "UPDATE": return "✏️";
      case "DELETE": return "🗑️";
      case "LOGIN": return "🔐";
      default: return "📋";
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "только что";
    if (diffMins < 60) return `${diffMins} мин. назад`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ч. назад`;
    
    return date.toLocaleDateString("ru-RU");
  };

  if (loading) {
    return (
      <div style={loadingContainerStyle}>
        <div style={spinnerStyle} />
        <p>Загрузка дашборда...</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Заголовок */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          <span style={titleIconStyle}>📊</span>
          Дашборд
        </h1>
        <p style={subtitleStyle}>
          Обзор системы инвентаризации оборудования
        </p>
      </div>

      {/* Карточки статистики */}
      <div style={statsGridStyle}>
        <div style={{...statCardStyle, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"}}>
          <div style={statIconStyle}>🖥️</div>
          <div style={statValueStyle}>{stats.total}</div>
          <div style={statLabelStyle}>Всего оборудования</div>
        </div>
        <div style={{...statCardStyle, background: "linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)"}}>
          <div style={statIconStyle}>✅</div>
          <div style={statValueStyle}>{stats.inWork}</div>
          <div style={statLabelStyle}>В работе</div>
          <div style={statPercentStyle}>
            {stats.total > 0 ? Math.round((stats.inWork / stats.total) * 100) : 0}%
          </div>
        </div>
        <div style={{...statCardStyle, background: "linear-gradient(135deg, #2196f3 0%, #1565c0 100%)"}}>
          <div style={statIconStyle}>📦</div>
          <div style={statValueStyle}>{stats.inReserve}</div>
          <div style={statLabelStyle}>В резерве</div>
          <div style={statPercentStyle}>
            {stats.total > 0 ? Math.round((stats.inReserve / stats.total) * 100) : 0}%
          </div>
        </div>
        <div style={{...statCardStyle, background: "linear-gradient(135deg, #ff9800 0%, #e65100 100%)"}}>
          <div style={statIconStyle}>🔧</div>
          <div style={statValueStyle}>{stats.inRepair}</div>
          <div style={statLabelStyle}>В ремонте</div>
          <div style={statPercentStyle}>
            {stats.total > 0 ? Math.round((stats.inRepair / stats.total) * 100) : 0}%
          </div>
        </div>
        <div style={{...statCardStyle, background: "linear-gradient(135deg, #f44336 0%, #b71c1c 100%)"}}>
          <div style={statIconStyle}>⚠️</div>
          <div style={statValueStyle}>{stats.toWriteOff}</div>
          <div style={statLabelStyle}>На списание</div>
          <div style={statPercentStyle}>
            {stats.total > 0 ? Math.round((stats.toWriteOff / stats.total) * 100) : 0}%
          </div>
        </div>
        <div style={{...statCardStyle, background: "linear-gradient(135deg, #9e9e9e 0%, #616161 100%)"}}>
          <div style={statIconStyle}>🗑️</div>
          <div style={statValueStyle}>{stats.writtenOff}</div>
          <div style={statLabelStyle}>Списано</div>
          <div style={statPercentStyle}>
            {stats.total > 0 ? Math.round((stats.writtenOff / stats.total) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Статус-бар */}
      <div style={statusBarContainerStyle}>
        <div style={statusBarTitleStyle}>Распределение по статусам</div>
        <div style={statusBarStyle}>
          {stats.total > 0 && (
            <>
              <div style={{...statusBarSegmentStyle, background: "#4caf50", width: `${(stats.inWork / stats.total) * 100}%`}} />
              <div style={{...statusBarSegmentStyle, background: "#2196f3", width: `${(stats.inReserve / stats.total) * 100}%`}} />
              <div style={{...statusBarSegmentStyle, background: "#ff9800", width: `${(stats.inRepair / stats.total) * 100}%`}} />
              <div style={{...statusBarSegmentStyle, background: "#f44336", width: `${(stats.toWriteOff / stats.total) * 100}%`}} />
              <div style={{...statusBarSegmentStyle, background: "#9e9e9e", width: `${(stats.writtenOff / stats.total) * 100}%`}} />
            </>
          )}
        </div>
        <div style={statusBarLegendStyle}>
          <span><span style={legendDotStyle("#4caf50")} /> В работе ({stats.inWork})</span>
          <span><span style={legendDotStyle("#2196f3")} /> В резерве ({stats.inReserve})</span>
          <span><span style={legendDotStyle("#ff9800")} /> В ремонте ({stats.inRepair})</span>
          <span><span style={legendDotStyle("#f44336")} /> На списание ({stats.toWriteOff})</span>
          <span><span style={legendDotStyle("#9e9e9e")} /> Списано ({stats.writtenOff})</span>
        </div>
      </div>

      {/* Две колонки: Производители и Локации */}
      <div style={twoColumnGridStyle}>
        {/* ПРОИЗВОДИТЕЛИ (полный список) */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <span style={panelIconStyle}>🏢</span>
            <h3 style={panelTitleStyle}>Производители ({allVendors.length})</h3>
          </div>
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {allVendors.length > 0 ? (
              allVendors.map(([vendor, count], index) => (
                <div key={vendor} style={listItemStyle}>
                  <div style={listItemLeftStyle}>
                    <span style={listItemIndexStyle(index)}>{index + 1}</span>
                    <span style={listItemNameStyle}>{vendor}</span>
                  </div>
                  <div style={listItemRightStyle}>
                    <span style={listItemCountStyle}>{count}</span>
                    <span style={listItemUnitStyle}>шт.</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={emptyTextStyle}>Нет данных о производителях</p>
            )}
          </div>
        </div>

        {/* ЛОКАЦИИ (сгруппированы по улицам, с раскрытием корпусов) */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <span style={panelIconStyle}>📍</span>
            <h3 style={panelTitleStyle}>Локации</h3>
          </div>
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {streets.length > 0 ? (
              streets.map(([street, data]) => (
                <div key={street}>
                  <div
                    style={{ ...listItemStyle, cursor: "pointer", background: expandedStreet === street ? "#f5f5f5" : "transparent" }}
                    onClick={() => toggleStreet(street)}
                  >
                    <div style={listItemLeftStyle}>
                      <span style={{ marginRight: "8px", fontSize: "14px" }}>
                        {expandedStreet === street ? "▼" : "▶"}
                      </span>
                      <span style={listItemNameStyle}>{street}</span>
                    </div>
                    <div style={listItemRightStyle}>
                      <span style={listItemCountStyle}>{data.total}</span>
                      <span style={listItemUnitStyle}>шт.</span>
                    </div>
                  </div>
                  {expandedStreet === street && (
                    <div style={{ paddingLeft: "32px", background: "#fafafa" }}>
                      {Object.entries(data.frames)
                        .sort((a, b) => b[1] - a[1])
                        .map(([frame, count]) => (
                          <div key={frame} style={{ ...listItemStyle, borderBottom: "none", padding: "8px 20px" }}>
                            <span style={{ fontSize: "13px", color: "#555" }}>{frame}</span>
                            <span style={{ fontWeight: "500", fontSize: "14px" }}>{count} шт.</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p style={emptyTextStyle}>Нет данных о локациях</p>
            )}
          </div>
        </div>
      </div>

      {/* Последние действия */}
      <div style={panelStyle}>
        <div style={panelHeaderStyle}>
          <span style={panelIconStyle}>📋</span>
          <h3 style={panelTitleStyle}>Последние действия</h3>
          <button onClick={() => navigate("/history")} style={viewAllButtonStyle}>
            Смотреть все →
          </button>
        </div>
        <div style={panelContentStyle}>
          {recentActions.length > 0 ? (
            recentActions.map((action) => (
              <div key={action.id} style={actionItemStyle}>
                <div style={actionIconStyle(getActionColor(action.action))}>
                  {getActionIcon(action.action)}
                </div>
                <div style={actionContentStyle}>
                  <div style={actionHeaderStyle}>
                    <span style={actionUserStyle}>{action.user}</span>
                    <span style={actionTypeStyle(action.action)}>
                      {action.action === "CREATE" && "добавил(а)"}
                      {action.action === "UPDATE" && "изменил(а)"}
                      {action.action === "DELETE" && "удалил(а)"}
                      {action.action === "LOGIN" && "вошёл(ла) в систему"}
                    </span>
                    {action.equipment_name && (
                      <span style={actionEquipmentStyle}>{action.equipment_name}</span>
                    )}
                  </div>
                  <div style={actionTimeStyle}>{formatTime(action.timestamp)}</div>
                </div>
              </div>
            ))
          ) : (
            <p style={emptyTextStyle}>Нет недавних действий</p>
          )}
        </div>
      </div>

      {/* Быстрые действия */}
      <div style={quickActionsStyle}>
        <button onClick={() => navigate("/equipment/add")} style={quickActionButtonStyle}>
          <span style={quickActionIconStyle}>➕</span>
          Добавить оборудование
        </button>
        <button onClick={() => navigate("/equipment")} style={{...quickActionButtonStyle, background: "#f5f5f5", color: "#333"}}>
          <span style={quickActionIconStyle}>🔍</span>
          Смотреть всё оборудование
        </button>
        <button onClick={fetchData} style={{...quickActionButtonStyle, background: "#f5f5f5", color: "#333"}}>
          <span style={quickActionIconStyle}>🔄</span>
          Обновить данные
        </button>
      </div>
    </div>
  );
}

// Вспомогательная функция для цвета действия
const getActionColor = (action) => {
  switch (action) {
    case "CREATE": return "#4caf50";
    case "UPDATE": return "#2196f3";
    case "DELETE": return "#f44336";
    default: return "#9e9e9e";
  }
};

// ================= СТИЛИ =================
const containerStyle = {
  padding: "24px",
  maxWidth: "1400px",
  margin: "0 auto"
};

const headerStyle = {
  marginBottom: "28px"
};

const titleStyle = {
  margin: 0,
  fontSize: "32px",
  fontWeight: "600",
  color: "#1a1a1a",
  display: "flex",
  alignItems: "center",
  gap: "12px"
};

const titleIconStyle = {
  background: "#1976d2",
  color: "white",
  width: "48px",
  height: "48px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "24px"
};

const subtitleStyle = {
  margin: "8px 0 0 60px",
  color: "#666",
  fontSize: "15px"
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(6, 1fr)",
  gap: "16px",
  marginBottom: "24px"
};

const statCardStyle = {
  padding: "20px 16px",
  borderRadius: "12px",
  color: "white",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  position: "relative",
  overflow: "hidden"
};

const statIconStyle = {
  fontSize: "28px",
  marginBottom: "12px",
  opacity: 0.9
};

const statValueStyle = {
  fontSize: "36px",
  fontWeight: "700",
  lineHeight: 1.2
};

const statLabelStyle = {
  fontSize: "13px",
  opacity: 0.9,
  marginTop: "4px"
};

const statPercentStyle = {
  position: "absolute",
  bottom: "12px",
  right: "16px",
  fontSize: "14px",
  fontWeight: "600",
  opacity: 0.8
};

const statusBarContainerStyle = {
  background: "white",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "24px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
};

const statusBarTitleStyle = {
  fontSize: "15px",
  fontWeight: "600",
  color: "#333",
  marginBottom: "16px"
};

const statusBarStyle = {
  display: "flex",
  height: "12px",
  borderRadius: "6px",
  overflow: "hidden",
  marginBottom: "12px"
};

const statusBarSegmentStyle = {
  height: "100%",
  transition: "width 0.3s"
};

const statusBarLegendStyle = {
  display: "flex",
  gap: "20px",
  flexWrap: "wrap",
  fontSize: "13px",
  color: "#666"
};

const legendDotStyle = (color) => ({
  display: "inline-block",
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  background: color,
  marginRight: "6px"
});

const twoColumnGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "24px",
  marginBottom: "24px"
};

const panelStyle = {
  background: "white",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  overflow: "hidden"
};

const panelHeaderStyle = {
  padding: "16px 20px",
  borderBottom: "1px solid #f0f0f0",
  display: "flex",
  alignItems: "center",
  gap: "10px"
};

const panelIconStyle = {
  fontSize: "20px"
};

const panelTitleStyle = {
  margin: 0,
  fontSize: "16px",
  fontWeight: "600",
  color: "#333",
  flex: 1
};

const panelContentStyle = {
  padding: "12px 0"
};

const listItemStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 20px",
  borderBottom: "1px solid #f5f5f5"
};

const listItemLeftStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px"
};

const listItemIndexStyle = (index) => ({
  width: "24px",
  height: "24px",
  borderRadius: "50%",
  background: index === 0 ? "#667eea" : index === 1 ? "#90caf9" : index === 2 ? "#b0bec5" : "#e0e0e0",
  color: index < 3 ? "white" : "#666",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "12px",
  fontWeight: "600"
});

const listItemNameStyle = {
  fontSize: "14px",
  color: "#333",
  fontWeight: "500"
};

const listItemRightStyle = {
  display: "flex",
  alignItems: "center",
  gap: "4px"
};

const listItemCountStyle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#333"
};

const listItemUnitStyle = {
  fontSize: "12px",
  color: "#999"
};

const emptyTextStyle = {
  textAlign: "center",
  color: "#999",
  padding: "30px",
  fontSize: "14px"
};

const viewAllButtonStyle = {
  background: "none",
  border: "none",
  color: "#1976d2",
  fontSize: "13px",
  cursor: "pointer",
  padding: "4px 8px"
};

const actionItemStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  padding: "12px 20px",
  borderBottom: "1px solid #f5f5f5"
};

const actionIconStyle = (color) => ({
  width: "32px",
  height: "32px",
  borderRadius: "8px",
  background: `${color}15`,
  color: color,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "14px",
  flexShrink: 0
});

const actionContentStyle = {
  flex: 1
};

const actionHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  flexWrap: "wrap",
  marginBottom: "4px"
};

const actionUserStyle = {
  fontWeight: "600",
  color: "#333",
  fontSize: "14px"
};

const actionTypeStyle = (action) => ({
  fontSize: "13px",
  color: getActionColor(action)
});

const actionEquipmentStyle = {
  fontSize: "14px",
  color: "#1976d2",
  fontWeight: "500"
};

const actionTimeStyle = {
  fontSize: "12px",
  color: "#999"
};

const quickActionsStyle = {
  display: "flex",
  gap: "12px",
  marginTop: "24px"
};

const quickActionButtonStyle = {
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
  transition: "all 0.2s"
};

const quickActionIconStyle = {
  fontSize: "18px"
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