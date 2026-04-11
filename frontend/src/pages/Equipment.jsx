import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Equipment() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://127.0.0.1:8000/equipment?limit=10000", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const items = res.data.items || res.data;
      setData(Array.isArray(items) ? items : []);
      setTotal(res.data.total || (Array.isArray(items) ? items.length : 0));
    } catch (error) {
      console.error("Ошибка загрузки:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Удалить оборудование "${name}" (ID: ${id})?`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:8000/equipment/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error("Ошибка удаления:", error);
      alert("Не удалось удалить оборудование");
    }
  };

  const filtered = data.filter(item =>
    Object.values(item).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const sortData = (items, config) => {
    if (!config.key) return items;
    return [...items].sort((a, b) => {
      let aVal = a[config.key] ?? "";
      let bVal = b[config.key] ?? "";
      if (config.key === "id" || config.key === "frame") {
        aVal = Number(aVal);
        bVal = Number(bVal);
      }
      if (aVal < bVal) return config.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return config.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <span style={sortIconStyle}>⇅</span>;
    return sortConfig.direction === "asc" ? <span style={sortIconStyle}>↑</span> : <span style={sortIconStyle}>↓</span>;
  };

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

  const columnWidths = {
    id: "60px", name: "150px", inv_number: "90px", serial_number: "130px", MAC_address: "150px",
    factory_number: "100px", vendor: "120px", model: "120px", hostname: "130px",
    street: "120px", frame: "70px", floor: "60px", room: "70px",
    status: "110px", condition: "110px", other: "100px",
    Mol: "80px", Mol_fio: "150px", Inventory_dt: "110px", update_dt: "110px", actions: "90px"
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("ru-RU");
  };

  if (loading) {
    return <div style={{ padding: 50, textAlign: "center" }}>Загрузка оборудования...</div>;
  }

  return (
    <div style={{ padding: "24px", height: "100vh", display: "flex", flexDirection: "column" }}>
      <h2 style={{ marginBottom: "24px", fontSize: "24px", fontWeight: 500 }}>
        Оборудование ({total})
      </h2>

      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexShrink: 0 }}>
        <input
          placeholder="🔍 Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: "12px 16px", fontSize: 16, border: "1px solid #ddd", borderRadius: 8 }}
        />
        <button
          onClick={() => navigate("/equipment/add")}
          style={{ padding: "12px 24px", background: "#1976d2", color: "white", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}
        >
          <span>+</span> Добавить
        </button>
      </div>

      <div style={{ overflow: "auto", borderRadius: 8, border: "1px solid #e0e0e0", flex: 1 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 2300 }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "#f5f5f5" }}>
            <tr>
              {Object.entries({
                id: "ID", name: "Название", inv_number: "INV", serial_number: "S/N", MAC_address: "MAC",
                factory_number: "Зав.№", vendor: "Vendor", model: "Model", hostname: "Hostname",
                street: "Street", frame: "Корпус", floor: "Этаж", room: "Каб.",
                status: "Статус", condition: "Состояние", other: "Other",
                Mol: "МОЛ", Mol_fio: "ФИО МОЛ", Inventory_dt: "Инвент-ция", update_dt: "Обновлено"
              }).map(([key, label]) => (
                <th key={key} onClick={() => handleSort(key)} style={{ ...thStyle, width: columnWidths[key], cursor: "pointer" }}>
                  {label} <SortIcon columnKey={key} />
                </th>
              ))}
              <th style={{ ...thStyle, width: columnWidths.actions }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr><td colSpan={22} style={{ padding: 40, textAlign: "center", color: "#999" }}>Нет данных</td></tr>
            ) : (
              sortedData.map(item => (
                <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={tdStyle}>{item.id}</td>
                  <td style={tdStyle}>{item.name || "—"}</td>
                  <td style={tdStyle}>{item.inv_number || "—"}</td>
                  <td style={tdStyle}>{item.serial_number || "—"}</td>
                  <td style={tdStyle}>{item.MAC_address || "—"}</td>
                  <td style={tdStyle}>{item.factory_number || "—"}</td>
                  <td style={tdStyle}>{item.vendor || "—"}</td>
                  <td style={tdStyle}>{item.model || "—"}</td>
                  <td style={tdStyle}>{item.hostname || "—"}</td>
                  <td style={tdStyle}>{item.street || "—"}</td>
                  <td style={tdStyle}>{item.frame ?? "—"}</td>
                  <td style={tdStyle}>{item.floor || "—"}</td>
                  <td style={tdStyle}>{item.room || "—"}</td>
                  <td style={{ ...tdStyle, background: statusColor(item.status), color: "#fff", fontWeight: 500, textAlign: "center" }}>
                    {item.status || "—"}
                  </td>
                  <td style={tdStyle}>{item.condition || "—"}</td>
                  <td style={tdStyle}>{item.other || "—"}</td>
                  <td style={tdStyle}>{item.Mol || "—"}</td>
                  <td style={tdStyle}>{item.Mol_fio || "—"}</td>
                  <td style={tdStyle}>{formatDate(item.Inventory_dt)}</td>
                  <td style={tdStyle}>{formatDate(item.update_dt)}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                      <button onClick={() => navigate(`/equipment/edit/${item.id}`)} style={iconButtonStyle} title="Редактировать">✏️</button>
                      <button onClick={() => handleDelete(item.id, item.name)} style={{ ...iconButtonStyle, color: "#f44336" }} title="Удалить">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = { padding: "12px 8px", textAlign: "left", fontWeight: 600, color: "#333", borderBottom: "2px solid #e0e0e0", whiteSpace: "nowrap", userSelect: "none" };
const tdStyle = { padding: "10px 8px", borderBottom: "1px solid #eee", whiteSpace: "nowrap" };
const sortIconStyle = { marginLeft: 4, fontSize: 12, opacity: 0.6 };
const iconButtonStyle = { background: "none", border: "1px solid #ddd", cursor: "pointer", fontSize: 16, padding: "4px 8px", borderRadius: 4, display: "inline-flex", alignItems: "center", justifyContent: "center" };