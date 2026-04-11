import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function EditEquipment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", inv_number: "", serial_number: "", MAC_address: "", factory_number: "",
    vendor: "", model: "", hostname: "", street: "",
    frame: "", floor: "", room: "",
    status: "в работе", condition: "готов к эксплуатации", other: "",
    Mol: "", Mol_fio: "", Inventory_dt: "", update_dt: ""
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
            name: item.name || "", inv_number: item.inv_number || "", serial_number: item.serial_number || "",
            MAC_address: item.MAC_address || "", factory_number: item.factory_number || "",
            vendor: item.vendor || "", model: item.model || "", hostname: item.hostname || "",
            street: item.street || "", frame: item.frame ?? "", floor: item.floor || "", room: item.room || "",
            status: item.status || "в работе", condition: item.condition || "готов к эксплуатации", other: item.other || "",
            Mol: item.Mol || "", Mol_fio: item.Mol_fio || "",
            Inventory_dt: item.Inventory_dt || "", update_dt: item.update_dt || ""
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
    if (!form.name) { alert("Название обязательно!"); return; }
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

  if (loading) return <div style={{ padding: 50, textAlign: "center" }}>Загрузка...</div>;

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <h2>✏️ Редактирование (ID: {id})</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Поля аналогично AddEquipment, используя правильные ключи */}
        <input placeholder="Название" value={form.name} onChange={e => handleChange("name", e.target.value)} />
        <input placeholder="Инв. номер" value={form.inv_number} onChange={e => handleChange("inv_number", e.target.value)} />
        <input placeholder="Серийный номер" value={form.serial_number} onChange={e => handleChange("serial_number", e.target.value)} />
        <input placeholder="MAC" value={form.MAC_address} onChange={e => handleChange("MAC_address", e.target.value)} />
        <input placeholder="Зав. номер" value={form.factory_number} onChange={e => handleChange("factory_number", e.target.value)} />
        <input placeholder="Vendor" value={form.vendor} onChange={e => handleChange("vendor", e.target.value)} />
        <input placeholder="Model" value={form.model} onChange={e => handleChange("model", e.target.value)} />
        <input placeholder="Hostname" value={form.hostname} onChange={e => handleChange("hostname", e.target.value)} />
        <input placeholder="Street" value={form.street} onChange={e => handleChange("street", e.target.value)} />
        <input type="number" placeholder="Корпус" value={form.frame} onChange={e => handleChange("frame", e.target.value)} />
        <input placeholder="Этаж" value={form.floor} onChange={e => handleChange("floor", e.target.value)} />
        <input placeholder="Кабинет" value={form.room} onChange={e => handleChange("room", e.target.value)} />
        <input placeholder="МОЛ" value={form.Mol} onChange={e => handleChange("Mol", e.target.value)} />
        <input placeholder="ФИО МОЛ" value={form.Mol_fio} onChange={e => handleChange("Mol_fio", e.target.value)} />
        <input type="date" value={form.Inventory_dt} onChange={e => handleChange("Inventory_dt", e.target.value)} />
        <input type="date" value={form.update_dt} onChange={e => handleChange("update_dt", e.target.value)} />
        {/* Select'ы для статуса и состояния оставьте как были */}
      </div>
      <div style={{ marginTop: 24 }}>
        <button onClick={handleSave} disabled={saving} style={{ padding: "12px 32px", background: "#1976d2", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>
          {saving ? "Сохранение..." : "💾 Сохранить"}
        </button>
        <button onClick={() => navigate("/equipment")} style={{ marginLeft: 12, padding: "12px 24px", background: "none", border: "1px solid #ddd", borderRadius: 8, cursor: "pointer" }}>← Отмена</button>
      </div>
    </div>
  );
}