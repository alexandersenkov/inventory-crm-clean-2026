import { useState } from "react";
import axios from "axios";

export default function Login({ setUser }) {
  const [form, setForm] = useState({ username: "", password: "" });

  const login = async () => {
    const res = await axios.post("http://127.0.0.1:8000/login", form);

    localStorage.setItem("token", res.data.access_token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    setUser(res.data.user);
    window.location.href = "/";
  };

  return (
    <div style={{ padding: 50 }}>
      <h2>Вход</h2>

      <input
        placeholder="Логин"
        onChange={e => setForm({ ...form, username: e.target.value })}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Пароль"
        onChange={e => setForm({ ...form, password: e.target.value })}
      />
      <br /><br />

      <button onClick={login}>Войти</button>
    </div>
  );
}
