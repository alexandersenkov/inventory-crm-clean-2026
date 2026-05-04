import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function EquipmentView() {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
	const fetchItem = async () => {
	  try {
		const token = localStorage.getItem("token");
		const res = await axios.get(`http://127.0.0.1:8000/equipment/view/${identifier}`, {
		  headers: { Authorization: `Bearer ${token}` }
		});
		setItem(res.data);
	  } catch (error) {
		console.error("Ошибка загрузки:", error);
		navigate("/equipment");
	  } finally {
		setLoading(false);
	  }
	};
	fetchItem();
  }, [identifier, navigate]);

  const formatDate = (dateStr) => {
	if (!dateStr) return "—";
	const d = new Date(dateStr);
	return d.toLocaleDateString("ru-RU");
  };

  if (loading) {
	return <div style={{ padding: 50, textAlign: "center" }}>Загрузка...</div>;
  }

  if (!item) {
	return <div style={{ padding: 50, textAlign: "center" }}>Оборудование не найдено</div>;
  }

  return (
	<div style={{ minHeight: "100vh", background: "#f5f7fa", padding: "24px" }}>
	  <div style={{ maxWidth: "900px", margin: "0 auto", background: "white", borderRadius: "12px", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
		<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
		  <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 600 }}>
			{item.name || "Без названия"}
		  </h2>
		  <div style={{ display: "flex", gap: "12px" }}>
			<button
			  onClick={() => navigate(`/equipment/edit/${item.id}`)}
			  style={{
				padding: "10px 20px",
				background: "#1976d2",
				color: "white",
				border: "none",
				borderRadius: "8px",
				cursor: "pointer",
				fontSize: "14px",
				fontWeight: 500
			  }}
			>
			  ✏️ Редактировать
			</button>
			<button
			  onClick={() => navigate("/equipment")}
			  style={{
				padding: "10px 20px",
				background: "transparent",
				border: "1px solid #ddd",
				borderRadius: "8px",
				cursor: "pointer",
				fontSize: "14px"
			  }}
			>
			  ← К списку
			</button>
		  </div>
		</div>

		<dl style={dlStyle}>
		  <dt style={dtStyle}>Инвентарный номер</dt>
		  <dd style={ddStyle}>{item.inv_number || "—"}</dd>

		  <dt style={dtStyle}>Серийный номер</dt>
		  <dd style={ddStyle}>{item.serial_number || "—"}</dd>

		  <dt style={dtStyle}>MAC-адрес</dt>
		  <dd style={ddStyle}>{item.MAC_address || "—"}</dd>

		  <dt style={dtStyle}>Заводской номер</dt>
		  <dd style={ddStyle}>{item.factory_number || "—"}</dd>

		  <dt style={dtStyle}>Производитель</dt>
		  <dd style={ddStyle}>{item.vendor || "—"}</dd>

		  <dt style={dtStyle}>Модель</dt>
		  <dd style={ddStyle}>{item.model || "—"}</dd>

		  <dt style={dtStyle}>Имя хоста</dt>
		  <dd style={ddStyle}>{item.hostname || "—"}</dd>

		  <dt style={dtStyle}>Адрес</dt>
		  <dd style={ddStyle}>{item.street || "—"}</dd>

		  <dt style={dtStyle}>Корпус / Этаж / Кабинет</dt>
		  <dd style={ddStyle}>
			{item.frame ? `Корпус ${item.frame}, ` : ""}
			{item.floor || "—"} этаж, каб. {item.room || "—"}
		  </dd>

		  <dt style={dtStyle}>Статус</dt>
		  <dd style={ddStyle}>
			<span style={{ background: getStatusColor(item.status), color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "13px" }}>
			  {item.status || "—"}
			</span>
		  </dd>

		  <dt style={dtStyle}>Состояние</dt>
		  <dd style={ddStyle}>{item.condition || "—"}</dd>

		  <dt style={dtStyle}>МОЛ</dt>
		  <dd style={ddStyle}>{item.Mol || "—"}</dd>

		  <dt style={dtStyle}>ФИО МОЛ</dt>
		  <dd style={ddStyle}>{item.Mol_fio || "—"}</dd>

		  <dt style={dtStyle}>Дата инвентаризации</dt>
		  <dd style={ddStyle}>{formatDate(item.Inventory_dt)}</dd>

		  <dt style={dtStyle}>Дата обновления карточки</dt>
		  <dd style={ddStyle}>{formatDate(item.update_dt)}</dd>

		  <dt style={dtStyle}>Примечания</dt>
		  <dd style={ddStyle}>{item.other || "—"}</dd>
		</dl>

		<div style={{ marginTop: "30px", textAlign: "center", color: "#999", fontSize: "13px" }}>
		  QR-код будет доступен в будущем обновлении
		</div>
	  </div>
	</div>
  );
}

function getStatusColor(status) {
  switch (status) {
	case "в работе": return "#4caf50";
	case "в резерве": return "#2196f3";
	case "в ремонте": return "#ff9800";
	case "на списание": return "#f44336";
	case "списан": return "#9e9e9e";
	default: return "#ccc";
  }
}

const dlStyle = {
  display: "grid",
  gridTemplateColumns: "200px 1fr",
  gap: "8px 16px",
  alignItems: "baseline"
};

const dtStyle = {
  fontWeight: 600,
  color: "#555",
  fontSize: "14px"
};

const ddStyle = {
  margin: 0,
  fontSize: "14px",
  color: "#222",
  wordBreak: "break-word"
};