import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function EditEquipment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    inv_number: "",
    serial_number: "",
    MAC_address: "",
    factory_number: "",
    vendor: "",
    model: "",
    hostname: "",
    street: "",
    frame: "",
    floor: "",
    room: "",
    status: "в работе",
    condition: "готов к эксплуатации",
    other: "",
    Mol: "",
    Mol_fio: "",
    Inventory_dt: "",
    update_dt: ""
  });

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://127.0.0.1:8000/equipment?limit=10000", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const items = res.data.items || res.data;
        const item = items.find(i => i.id === parseInt(id));
        if (item) {
          setForm({
            name: item.name || "",
            inv_number: item.inv_number || "",
            serial_number: item.serial_number || "",
            MAC_address: item.MAC_address || "",
            factory_number: item.factory_number || "",
            vendor: item.vendor || "",
            model: item.model || "",
            hostname: item.hostname || "",
            street: item.street || "",
            frame: item.frame ?? "",
            floor: item.floor || "",
            room: item.room || "",
            status: item.status || "в работе",
            condition: item.condition || "готов к эксплуатации",
            other: item.other || "",
            Mol: item.Mol || "",
            Mol_fio: item.Mol_fio || "",
            Inventory_dt: item.Inventory_dt || "",
            update_dt: item.update_dt || ""
          });
        }
      } catch (error) {
        console.error("Ошибка загрузки:", error);
        alert("Не удалось загрузить данные");
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, [id]);

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleSave = async () => {
    if (!form.name) {
      alert("Название обязательно!");
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://127.0.0.1:8000/equipment/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate("/equipment");
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      alert("Не удалось сохранить изменения");
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = ["в работе", "в резерве", "в ремонте", "на списание", "списан"];
  const conditionOptions = ["готов к эксплуатации", "требует обслуживания", "неисправен", "в ремонте"];

  if (loading) {
    return <div style={{ padding: 50, textAlign: "center" }}>Загрузка...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fa", padding: "24px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", background: "white", borderRadius: "12px", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <h2 style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>✏️</span> Редактирование оборудования (ID: {id})
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
          <div>
            <label style={labelStyle}>Название *</label>
            <input style={inputStyle} value={form.name} onChange={e => handleChange("name", e.target.value)} placeholder="Например: Ноутбук Dell XPS" />
          </div>
          <div>
            <label style={labelStyle}>Инвентарный номер</label>
            <input style={inputStyle} value={form.inv_number} onChange={e => handleChange("inv_number", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Серийный номер (S/N)</label>
            <input style={inputStyle} value={form.serial_number} onChange={e => handleChange("serial_number", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>MAC адрес</label>
            <input style={inputStyle} value={form.MAC_address} onChange={e => handleChange("MAC_address", e.target.value)} placeholder="00:1A:2B:3C:4D:5E" />
          </div>
          <div>
            <label style={labelStyle}>Заводской номер</label>
            <input style={inputStyle} value={form.factory_number} onChange={e => handleChange("factory_number", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Производитель</label>
            <input style={inputStyle} value={form.vendor} onChange={e => handleChange("vendor", e.target.value)} placeholder="Dell, HP, Apple..." />
          </div>
          <div>
            <label style={labelStyle}>Модель</label>
            <input style={inputStyle} value={form.model} onChange={e => handleChange("model", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Имя хоста</label>
            <input style={inputStyle} value={form.hostname} onChange={e => handleChange("hostname", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Улица</label>
            <input style={inputStyle} value={form.street} onChange={e => handleChange("street", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Корпус</label>
            <input type="number" style={inputStyle} value={form.frame} onChange={e => handleChange("frame", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Этаж</label>
            <input style={inputStyle} value={form.floor} onChange={e => handleChange("floor", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Кабинет</label>
            <input style={inputStyle} value={form.room} onChange={e => handleChange("room", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Статус</label>
            <select style={inputStyle} value={form.status} onChange={e => handleChange("status", e.target.value)}>
              {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Состояние</label>
            <select style={inputStyle} value={form.condition} onChange={e => handleChange("condition", e.target.value)}>
              {conditionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>МОЛ</label>
            <input style={inputStyle} value={form.Mol} onChange={e => handleChange("Mol", e.target.value)} placeholder="Код/идентификатор МОЛ" />
          </div>
          <div>
            <label style={labelStyle}>ФИО МОЛ</label>
            <input style={inputStyle} value={form.Mol_fio} onChange={e => handleChange("Mol_fio", e.target.value)} placeholder="Фамилия И.О." />
          </div>
          <div>
            <label style={labelStyle}>Дата инвентаризации</label>
            <input type="date" style={inputStyle} value={form.Inventory_dt} onChange={e => handleChange("Inventory_dt", e.target.value)} />
          </div>
<div>
<label style={labelStyle}>Дата обновления карточки</label>
<div style={{ padding: "10px 0", color: "#666" }}>
  {form.update_dt || "Не задана"}
</div>
</div>
          <div style={{ gridColumn: "span 2" }}>
            <label style={labelStyle}>Примечания</label>
            <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} value={form.other} onChange={e => handleChange("other", e.target.value)} placeholder="Дополнительная информация..." />
          </div>
        </div>

        <div style={{ marginTop: "32px", display: "flex", gap: "12px", borderTop: "1px solid #eee", paddingTop: "24px" }}>
          <button onClick={handleSave} disabled={saving} style={{ padding: "12px 32px", background: saving ? "#ccc" : "#1976d2", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "500", cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
            {saving ? "⏳ Сохранение..." : "💾 Сохранить"}
          </button>
          <button onClick={() => navigate("/equipment")} style={{ padding: "12px 24px", background: "transparent", color: "#666", border: "1px solid #ddd", borderRadius: "8px", fontSize: "16px", cursor: "pointer" }}>
            ← Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontSize: "14px",
  fontWeight: "500",
  color: "#444"
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  fontSize: "14px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s"
};