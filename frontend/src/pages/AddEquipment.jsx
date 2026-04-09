import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AddEquipment() {
  const navigate = useNavigate();

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

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Валидация обязательных полей
  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Название обязательно";
    return newErrors;
  };

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
    // Очистка ошибки при вводе
    if (errors[key]) {
      setErrors({ ...errors, [key]: null });
    }
  };

  const save = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:8000/equipment", form);
      navigate("/equipment");
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      alert("Не удалось сохранить оборудование");
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = ["в работе", "в резерве", "в ремонте", "на списание", "списан"];
  const conditionOptions = ["готов к эксплуатации", "требует обслуживания", "неисправен", "в ремонте"];

  // Группы полей для организации формы
  const fieldGroups = [
    {
      title: "📋 Основная информация",
      fields: [
        { key: "name", label: "Название*", placeholder: "Например: Ноутбук Dell XPS 13", type: "text", required: true },
        { key: "inv_num", label: "Инвентарный номер", placeholder: "INV-2024-001", type: "text" },
        { key: "zav_num", label: "Заводской номер", placeholder: "Заводской номер", type: "text" },
      ]
    },
    {
      title: "🔧 Технические характеристики",
      fields: [
        { key: "vendor", label: "Производитель", placeholder: "Dell, HP, Apple...", type: "text" },
        { key: "model", label: "Модель", placeholder: "XPS 13 9310", type: "text" },
        { key: "sn", label: "Серийный номер (S/N)", placeholder: "SN123456789", type: "text" },
        { key: "mac", label: "MAC-адрес", placeholder: "00:1A:2B:3C:4D:5E", type: "text" },
        { key: "hostname", label: "Имя хоста", placeholder: "PC-001", type: "text" },
      ]
    },
    {
      title: "📍 Местоположение",
      fields: [
        { key: "street", label: "Улица", placeholder: "ул. Ленина", type: "text" },
        { 
          key: "kor", 
          label: "Корпус", 
          placeholder: "1", 
          type: "number",
          min: 1
        },
        { 
          key: "etaj", 
          label: "Этаж", 
          placeholder: "3", 
          type: "number",
          min: 1
        },
        { 
          key: "kab", 
          label: "Кабинет", 
          placeholder: "305", 
          type: "text"
        },
      ]
    },
    {
      title: "📊 Статус и состояние",
      fields: [
        { key: "status", label: "Статус", type: "select", options: statusOptions },
        { key: "condition", label: "Состояние", type: "select", options: conditionOptions },
      ]
    },
    {
      title: "📝 Дополнительно",
      fields: [
        { key: "other", label: "Примечания", type: "textarea", placeholder: "Дополнительная информация..." },
      ]
    }
  ];

  const renderField = (field) => {
    const value = form[field.key];
    const error = errors[field.key];

    switch (field.type) {
      case "select":
        return (
          <select
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            style={{
              ...inputStyle,
              background: "white",
              cursor: "pointer"
            }}
          >
            {field.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );

      case "textarea":
        return (
          <textarea
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            style={{
              ...inputStyle,
              minHeight: "80px",
              resize: "vertical"
            }}
          />
        );

      default:
        return (
          <input
            type={field.type}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            required={field.required}
            min={field.min}
            style={{
              ...inputStyle,
              borderColor: error ? "#f44336" : "#ddd"
            }}
          />
        );
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f7fa",
      padding: "24px"
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
        overflow: "hidden"
      }}>
        {/* Заголовок */}
        <div style={{
          padding: "24px 32px",
          borderBottom: "1px solid #e0e0e0",
          background: "linear-gradient(to right, #fafafa, white)"
        }}>
          <h2 style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: "600",
            color: "#1a1a1a",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <span style={{
              background: "#1976d2",
              color: "white",
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px"
            }}>+</span>
            Добавление нового оборудования
          </h2>
          <p style={{
            margin: "8px 0 0 44px",
            color: "#666",
            fontSize: "14px"
          }}>
            Заполните информацию об оборудовании. Поля, отмеченные *, обязательны для заполнения.
          </p>
        </div>

        {/* Форма */}
        <div style={{ padding: "32px" }}>
          {fieldGroups.map((group, groupIndex) => (
            <div key={groupIndex} style={{
              marginBottom: groupIndex < fieldGroups.length - 1 ? "32px" : 0,
              paddingBottom: groupIndex < fieldGroups.length - 1 ? "24px" : 0,
              borderBottom: groupIndex < fieldGroups.length - 1 ? "1px solid #eee" : "none"
            }}>
              <h3 style={{
                margin: "0 0 20px 0",
                fontSize: "18px",
                fontWeight: "500",
                color: "#333",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                {group.title}
              </h3>
              
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "20px"
              }}>
                {group.fields.map((field) => (
                  <div key={field.key} style={{
                    gridColumn: field.type === "textarea" ? "1 / -1" : "auto"
                  }}>
                    <label style={{
                      display: "block",
                      marginBottom: "6px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#444"
                    }}>
                      {field.label}
                      {field.required && <span style={{ color: "#f44336", marginLeft: "4px" }}>*</span>}
                    </label>
                    
                    {renderField(field)}
                    
                    {errors[field.key] && (
                      <div style={{
                        color: "#f44336",
                        fontSize: "12px",
                        marginTop: "4px"
                      }}>
                        {errors[field.key]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Кнопки */}
          <div style={{
            display: "flex",
            gap: "16px",
            marginTop: "32px",
            paddingTop: "24px",
            borderTop: "1px solid #eee"
          }}>
            <button
              onClick={save}
              disabled={loading}
              style={{
                padding: "12px 32px",
                background: loading ? "#ccc" : "#1976d2",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "500",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s",
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={(e) => !loading && (e.target.style.background = "#1565c0")}
              onMouseLeave={(e) => !loading && (e.target.style.background = "#1976d2")}
            >
              {loading ? (
                <>
                  <span style={{ 
                    width: "16px", 
                    height: "16px", 
                    border: "2px solid white",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 1s linear infinite"
                  }} />
                  Сохранение...
                </>
              ) : (
                "💾 Сохранить"
              )}
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
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#f5f5f5";
                e.target.style.borderColor = "#bbb";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
                e.target.style.borderColor = "#ddd";
              }}
            >
              ← Отмена
            </button>
          </div>
        </div>
      </div>

      {/* Анимация для спиннера */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Общий стиль для полей ввода
const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  fontSize: "14px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  outline: "none",
  transition: "all 0.2s",
  boxSizing: "border-box",
  fontFamily: "inherit"
};

// Добавим стили для фокуса глобально
const style = document.createElement('style');
style.textContent = `
  input:focus, select:focus, textarea:focus {
    border-color: #1976d2 !important;
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1) !important;
  }
`;
document.head.appendChild(style);