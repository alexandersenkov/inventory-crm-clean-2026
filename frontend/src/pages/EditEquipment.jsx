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
    inv_num: "",
    sn: "",
    mac: "",
    zav_num: "",
    vendor: "",
    model: "",
    hostname: "",
    street: "",
    kor: "",
    etaj: "",
    kab: "",
    status: "в работе",
    condition: "готов к эксплуатации",
    other: ""
  });

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://127.0.0.1:8000/equipment?limit=10000", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Новый API возвращает объект с полем items
        const items = res.data.items || res.data;
        const item = items.find(i => i.id === parseInt(id));
        
        if (item) {
          setForm({
            name: item.name || "",
            inv_num: item.inv_num || "",
            sn: item.sn || "",
            mac: item.mac || "",
            zav_num: item.zav_num || "",
            vendor: item.vendor || "",
            model: item.model || "",
            hostname: item.hostname || "",
            street: item.street || "",
            kor: item.kor || "",
            etaj: item.etaj || "",
            kab: item.kab || "",
            status: item.status || "в работе",
            condition: item.condition || "готов к эксплуатации",
            other: item.other || ""
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

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

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
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "50px" }}>
        <p>⏳ Загрузка...</p>
      </div>
    );
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
            <input 
              style={inputStyle} 
              value={form.name} 
              onChange={(e) => handleChange("name", e.target.value)} 
              placeholder="Например: Ноутбук Dell XPS"
            />
          </div>
          <div>
            <label style={labelStyle}>Инвентарный номер</label>
            <input style={inputStyle} value={form.inv_num} onChange={(e) => handleChange("inv_num", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Серийный номер (S/N)</label>
            <input style={inputStyle} value={form.sn} onChange={(e) => handleChange("sn", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>MAC адрес</label>
            <input style={inputStyle} value={form.mac} onChange={(e) => handleChange("mac", e.target.value)} placeholder="00:1A:2B:3C:4D:5E" />
          </div>
          <div>
            <label style={labelStyle}>Заводской номер</label>
            <input style={inputStyle} value={form.zav_num} onChange={(e) => handleChange("zav_num", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Производитель</label>
            <input style={inputStyle} value={form.vendor} onChange={(e) => handleChange("vendor", e.target.value)} placeholder="Dell, HP, Apple..." />
          </div>
          <div>
            <label style={labelStyle}>Модель</label>
            <input style={inputStyle} value={form.model} onChange={(e) => handleChange("model", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Имя хоста</label>
            <input style={inputStyle} value={form.hostname} onChange={(e) => handleChange("hostname", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Улица</label>
            <input style={inputStyle} value={form.street} onChange={(e) => handleChange("street", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Корпус</label>
            <input style={inputStyle} value={form.kor} onChange={(e) => handleChange("kor", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Этаж</label>
            <input style={inputStyle} value={form.etaj} onChange={(e) => handleChange("etaj", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Кабинет</label>
            <input style={inputStyle} value={form.kab} onChange={(e) => handleChange("kab", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Статус</label>
            <select style={inputStyle} value={form.status} onChange={(e) => handleChange("status", e.target.value)}>
              {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Состояние</label>
            <select style={inputStyle} value={form.condition} onChange={(e) => handleChange("condition", e.target.value)}>
              {conditionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <label style={labelStyle}>Примечания</label>
            <textarea 
              style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} 
              value={form.other} 
              onChange={(e) => handleChange("other", e.target.value)} 
              placeholder="Дополнительная информация..."
            />
          </div>
        </div>

        <div style={{ marginTop: "32px", display: "flex", gap: "12px", borderTop: "1px solid #eee", paddingTop: "24px" }}>
          <button 
            onClick={handleSave} 
            disabled={saving} 
            style={{
              padding: "12px 32px",
              background: saving ? "#ccc" : "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: saving ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            {saving ? "⏳ Сохранение..." : "💾 Сохранить"}
          </button>
          <button 
            onClick={() => navigate("/equipment")} 
            style={{
              padding: "12px 24px",
              background: "transparent",
              color: "#666",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer"
            }}
          >
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