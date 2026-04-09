import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Equipment() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const navigate = useNavigate();

  const fetchData = async () => {
    const res = await axios.get("http://127.0.0.1:8000/equipment");
    setData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Функция сортировки
  const sortData = (items, config) => {
    if (!config.key) return items;
    
    return [...items].sort((a, b) => {
      let aVal = a[config.key];
      let bVal = b[config.key];
      
      // Обработка null/undefined
      if (aVal == null) aVal = "";
      if (bVal == null) bVal = "";
      
      // Числовая сортировка для ID
      if (config.key === "id") {
        aVal = Number(aVal);
        bVal = Number(bVal);
      }
      
      if (aVal < bVal) {
        return config.direction === "asc" ? -1 : 1;
      }
      if (aVal > bVal) {
        return config.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  // Обработчик клика по заголовку
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Иконка сортировки
  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <span style={sortIconStyle}>⇅</span>;
    }
    return sortConfig.direction === "asc" 
      ? <span style={sortIconStyle}>↑</span>
      : <span style={sortIconStyle}>↓</span>;
  };

  // Фильтрация
  const filtered = data.filter(item =>
    Object.values(item).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  // Сортировка отфильтрованных данных
  const sortedData = sortData(filtered, sortConfig);

  const statusColor = (status) => {
    switch (status) {
      case "в работе": return "#4caf50";
      case "в резерве": return "#2196f3";
      case "в ремонте": return "#ff9800";
      case "на списание": return "#f44336";
      case "списан": return "#9e9e9e";
      default: return "#ccc";
    }
  };

  // Фиксированная ширина для колонок
  const columnWidths = {
    id: "70px",
    name: "160px",
    inv_num: "90px",
    sn: "130px",
    mac: "150px",
    zav_num: "90px",
    vendor: "130px",
    model: "130px",
    hostname: "140px",
    street: "130px",
    kor: "70px",
    etaj: "70px",
    kab: "80px",
    status: "120px",
    condition: "110px",
    other: "110px",
    actions: "70px"
  };

  return (
    <div style={{ padding: "24px", maxWidth: "100%", height: "100vh", display: "flex", flexDirection: "column" }}>
      <h2 style={{ marginBottom: "24px", fontSize: "24px", fontWeight: "500", flexShrink: 0 }}>
        Оборудование
      </h2>

      {/* Поиск и кнопка Добавить */}
      <div style={{
        display: "flex",
        gap: "16px",
        marginBottom: "24px",
        alignItems: "center",
        flexShrink: 0
      }}>
        <input
          placeholder="🔍 Поиск по всем полям..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: "12px 16px",
            fontSize: "16px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            outline: "none",
            transition: "border-color 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}
          onFocus={(e) => e.target.style.borderColor = "#1976d2"}
          onBlur={(e) => e.target.style.borderColor = "#ddd"}
        />
        <button
          onClick={() => navigate("/equipment/add")}
          style={{
            padding: "12px 24px",
            background: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "500",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "background 0.2s",
            whiteSpace: "nowrap"
          }}
          onMouseEnter={(e) => e.target.style.background = "#1565c0"}
          onMouseLeave={(e) => e.target.style.background = "#1976d2"}
        >
          <span style={{ fontSize: "20px" }}>+</span> Добавить
        </button>
      </div>

      {/* Контейнер таблицы с горизонтальным скроллом и закреплёнными заголовками */}
      <div style={{
        overflowX: "auto",
        overflowY: "auto",
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        flex: 1,
        minHeight: 0
      }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "14px",
          minWidth: "1900px"
        }}>
          <thead style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "#f5f5f5"
          }}>
            <tr>
              <th 
                onClick={() => handleSort("id")}
                style={{ ...thStyle, width: columnWidths.id, cursor: "pointer" }}
              >
                ID <SortIcon columnKey="id" />
              </th>
              <th 
                onClick={() => handleSort("name")}
                style={{ ...thStyle, width: columnWidths.name, cursor: "pointer" }}
              >
                Название <SortIcon columnKey="name" />
              </th>
              <th 
                onClick={() => handleSort("inv_num")}
                style={{ ...thStyle, width: columnWidths.inv_num, cursor: "pointer" }}
              >
                INV <SortIcon columnKey="inv_num" />
              </th>
              <th 
                onClick={() => handleSort("sn")}
                style={{ ...thStyle, width: columnWidths.sn, cursor: "pointer" }}
              >
                S/N <SortIcon columnKey="sn" />
              </th>
              <th 
                onClick={() => handleSort("mac")}
                style={{ ...thStyle, width: columnWidths.mac, cursor: "pointer" }}
              >
                MAC <SortIcon columnKey="mac" />
              </th>
              <th 
                onClick={() => handleSort("zav_num")}
                style={{ ...thStyle, width: columnWidths.zav_num, cursor: "pointer" }}
              >
                ZAV <SortIcon columnKey="zav_num" />
              </th>
              <th 
                onClick={() => handleSort("vendor")}
                style={{ ...thStyle, width: columnWidths.vendor, cursor: "pointer" }}
              >
                Vendor <SortIcon columnKey="vendor" />
              </th>
              <th 
                onClick={() => handleSort("model")}
                style={{ ...thStyle, width: columnWidths.model, cursor: "pointer" }}
              >
                Model <SortIcon columnKey="model" />
              </th>
              <th 
                onClick={() => handleSort("hostname")}
                style={{ ...thStyle, width: columnWidths.hostname, cursor: "pointer" }}
              >
                Hostname <SortIcon columnKey="hostname" />
              </th>
              <th 
                onClick={() => handleSort("street")}
                style={{ ...thStyle, width: columnWidths.street, cursor: "pointer" }}
              >
                Street <SortIcon columnKey="street" />
              </th>
              <th 
                onClick={() => handleSort("kor")}
                style={{ ...thStyle, width: columnWidths.kor, cursor: "pointer" }}
              >
                Kor <SortIcon columnKey="kor" />
              </th>
              <th 
                onClick={() => handleSort("etaj")}
                style={{ ...thStyle, width: columnWidths.etaj, cursor: "pointer" }}
              >
                Etaj <SortIcon columnKey="etaj" />
              </th>
              <th 
                onClick={() => handleSort("kab")}
                style={{ ...thStyle, width: columnWidths.kab, cursor: "pointer" }}
              >
                Kab <SortIcon columnKey="kab" />
              </th>
              <th 
                onClick={() => handleSort("status")}
                style={{ ...thStyle, width: columnWidths.status, cursor: "pointer" }}
              >
                Status <SortIcon columnKey="status" />
              </th>
              <th 
                onClick={() => handleSort("condition")}
                style={{ ...thStyle, width: columnWidths.condition, cursor: "pointer" }}
              >
                Condition <SortIcon columnKey="condition" />
              </th>
              <th 
                onClick={() => handleSort("other")}
                style={{ ...thStyle, width: columnWidths.other, cursor: "pointer" }}
              >
                Other <SortIcon columnKey="other" />
              </th>
              <th style={{ ...thStyle, width: columnWidths.actions }}>Действия</th>
            </tr>
          </thead>

          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan="17" style={{ padding: "40px", textAlign: "center", color: "#999" }}>
                  {search ? "Ничего не найдено" : "Нет данных"}
                </td>
              </tr>
            ) : (
              sortedData.map(item => (
                <tr 
                  key={item.id} 
                  style={{ borderBottom: "1px solid #eee" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <td style={tdStyle}>{item.id}</td>
                  <td style={tdStyle}>{item.name || "—"}</td>
                  <td style={tdStyle}>{item.inv_num || "—"}</td>
                  <td style={tdStyle}>{item.sn || "—"}</td>
                  <td style={tdStyle}>{item.mac || "—"}</td>
                  <td style={tdStyle}>{item.zav_num || "—"}</td>
                  <td style={tdStyle}>{item.vendor || "—"}</td>
                  <td style={tdStyle}>{item.model || "—"}</td>
                  <td style={tdStyle}>{item.hostname || "—"}</td>
                  <td style={tdStyle}>{item.street || "—"}</td>
                  <td style={tdStyle}>{item.kor || "—"}</td>
                  <td style={tdStyle}>{item.etaj || "—"}</td>
                  <td style={tdStyle}>{item.kab || "—"}</td>

                  <td style={{
                    ...tdStyle,
                    background: statusColor(item.status),
                    color: "#fff",
                    fontWeight: "500",
                    textAlign: "center"
                  }}>
                    {item.status || "—"}
                  </td>

                  <td style={tdStyle}>{item.condition || "—"}</td>
                  <td style={tdStyle}>{item.other || "—"}</td>

                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <button
                      onClick={() => navigate(`/equipment/edit/${item.id}`)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "18px",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        transition: "background 0.2s"
                      }}
                      onMouseEnter={(e) => e.target.style.background = "#f0f0f0"}
                      onMouseLeave={(e) => e.target.style.background = "none"}
                      title="Редактировать"
                    >
                      ✏️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Счётчик записей */}
      <div style={{ 
        marginTop: "12px", 
        color: "#666", 
        fontSize: "14px",
        flexShrink: 0
      }}>
        Всего: {sortedData.length} {sortedData.length === 1 ? "запись" : 
          sortedData.length >= 2 && sortedData.length <= 4 ? "записи" : "записей"}
        {search && data.length !== sortedData.length && ` (отфильтровано из ${data.length})`}
        {sortConfig.key && ` • Сортировка: ${sortConfig.key} (${sortConfig.direction === "asc" ? "↑" : "↓"})`}
      </div>
    </div>
  );
}

// Стили для ячеек таблицы
const thStyle = {
  padding: "12px 8px",
  textAlign: "left",
  fontWeight: "600",
  color: "#333",
  borderBottom: "2px solid #e0e0e0",
  whiteSpace: "nowrap",
  userSelect: "none",
  transition: "background 0.2s"
};

const tdStyle = {
  padding: "10px 8px",
  borderBottom: "1px solid #eee",
  whiteSpace: "nowrap"
};

const sortIconStyle = {
  marginLeft: "4px",
  fontSize: "12px",
  opacity: 0.6
};