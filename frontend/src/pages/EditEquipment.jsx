import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function EditEquipment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({});

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/equipment")
      .then(res => {
        const item = res.data.find(i => i.id == id);
        setForm(item);
      });
  }, []);

  const save = async () => {
    await axios.put(`http://127.0.0.1:8000/equipment/${id}`, form);
    navigate("/equipment");
  };

  if (!form) return null;

  return (
    <div style={{ padding: 20 }}>
      <h2>Редактирование</h2>

      {Object.keys(form).map(key => (
        key !== "id" && (
          <div key={key}>
            <input
              value={form[key]}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
            />
          </div>
        )
      ))}

      <br />
      <button onClick={save}>Сохранить</button>
    </div>
  );
}
