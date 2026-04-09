import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AddEquipment() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", inv_num: "", sn: "", mac: "", zav_num: "",
    vendor: "", model: "", hostname: "", street: "",
    kor: "", etaj: "", kab: "",
    status: "в работе",
    condition: "готов к эксплуатации",
    other: ""
  });

  const save = async () => {
    await axios.post("http://127.0.0.1:8000/equipment", form);
    navigate("/equipment");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Добавить оборудование</h2>

      {Object.keys(form).map(key => (
        <div key={key}>
          <input
            placeholder={key}
            value={form[key]}
            onChange={e => setForm({ ...form, [key]: e.target.value })}
          />
        </div>
      ))}

      <br />
      <button onClick={save}>Сохранить</button>
    </div>
  );
}
