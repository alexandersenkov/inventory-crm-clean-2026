import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Equipment() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchData = async () => {
    const res = await axios.get("http://127.0.0.1:8000/equipment");
    setData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = data.filter(item =>
    Object.values(item).join(" ").toLowerCase().includes(search.toLowerCase())
  );

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

  return (
    <div style={{ padding: 20 }}>
      <h2>Оборудование</h2>

      <div style={{ marginBottom: 15 }}>
        <input
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <button onClick={() => navigate("/equipment/add")}>
          ➕ Добавить
        </button>
      </div>

      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>INV</th>
            <th>S/N</th>
            <th>MAC</th>
            <th>ZAV</th>
            <th>Vendor</th>
            <th>Model</th>
            <th>Hostname</th>
            <th>Street</th>
            <th>Kor</th>
            <th>Etaj</th>
            <th>Kab</th>
            <th>Status</th>
            <th>Condition</th>
            <th>Other</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {filtered.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.inv_num}</td>
              <td>{item.sn}</td>
              <td>{item.mac}</td>
              <td>{item.zav_num}</td>
              <td>{item.vendor}</td>
              <td>{item.model}</td>
              <td>{item.hostname}</td>
              <td>{item.street}</td>
              <td>{item.kor}</td>
              <td>{item.etaj}</td>
              <td>{item.kab}</td>

              <td style={{
                background: statusColor(item.status),
                color: "#fff"
              }}>
                {item.status}
              </td>

              <td>{item.condition}</td>
              <td>{item.other}</td>

              <td>
                <button onClick={() => navigate(`/equipment/edit/${item.id}`)}>
                  ✏️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
