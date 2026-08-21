import React, { useState, useEffect } from 'react';
import './EquipmentForm.css';

const EquipmentForm = ({ initialData = {}, onSubmit, onCancel, readOnly = false }) => {
  const [formData, setFormData] = useState({
	name: '',
	inventoryNumber: '',
	serialNumber: '',
	mac: '',
	factoryNumber: '',
	vendor: '',
	model: '',
	hostname: '',
	street: '',
	building: '',
	floor: '',
	room: '',
	status: '',
	condition: '',
	mol: '',
	molFullName: '',
	inventoryDate: '',
	updateDate: '',
	notes: '',
	...initialData,
  });

  useEffect(() => {
	setFormData({
	  name: '',
	  inventoryNumber: '',
	  serialNumber: '',
	  mac: '',
	  factoryNumber: '',
	  vendor: '',
	  model: '',
	  hostname: '',
	  street: '',
	  building: '',
	  floor: '',
	  room: '',
	  status: '',
	  condition: '',
	  mol: '',
	  molFullName: '',
	  inventoryDate: '',
	  updateDate: '',
	  notes: '',
	  ...initialData,
	});
  }, [initialData]);

  const handleChange = (e) => {
	const { name, value } = e.target;
	setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
	e.preventDefault();
	if (onSubmit) onSubmit(formData);
  };

  let title = 'Добавление оборудования';
  if (readOnly) {
	title = 'Просмотр оборудования';
  } else if (initialData && initialData.id) {
	title = `Редактирование оборудования (ID: ${initialData.id})`;
  }

  return (
	<div className="equipment-form-container">
	  <h2 className="form-title">{title}</h2>
	  <form onSubmit={handleSubmit} className="equipment-form">
		{/* Название */}
		<div className="form-group">
		  <label htmlFor="name">Название *</label>
		  {readOnly ? (
			<div className="field-display">{formData.name}</div>
		  ) : (
			<input
			  type="text"
			  id="name"
			  name="name"
			  value={formData.name}
			  onChange={handleChange}
			  required
			/>
		  )}
		</div>

		{/* Инвентарный номер */}
		<div className="form-group">
		  <label htmlFor="inventoryNumber">Инвентарный номер</label>
		  {readOnly ? (
			<div className="field-display">{formData.inventoryNumber}</div>
		  ) : (
			<input
			  type="text"
			  id="inventoryNumber"
			  name="inventoryNumber"
			  value={formData.inventoryNumber}
			  onChange={handleChange}
			/>
		  )}
		</div>

		{/* Серийный номер (S/N) */}
		<div className="form-group">
		  <label htmlFor="serialNumber">Серийный номер (S/N)</label>
		  {readOnly ? (
			<div className="field-display">{formData.serialNumber}</div>
		  ) : (
			<input
			  type="text"
			  id="serialNumber"
			  name="serialNumber"
			  value={formData.serialNumber}
			  onChange={handleChange}
			/>
		  )}
		</div>

		{/* MAC адрес */}
		<div className="form-group">
		  <label htmlFor="mac">MAC адрес</label>
		  {readOnly ? (
			<div className="field-display">{formData.mac}</div>
		  ) : (
			<input
			  type="text"
			  id="mac"
			  name="mac"
			  value={formData.mac}
			  onChange={handleChange}
			/>
		  )}
		</div>

		{/* Заводской номер */}
		<div className="form-group">
		  <label htmlFor="factoryNumber">Заводской номер</label>
		  {readOnly ? (
			<div className="field-display">{formData.factoryNumber}</div>
		  ) : (
			<input
			  type="text"
			  id="factoryNumber"
			  name="factoryNumber"
			  value={formData.factoryNumber}
			  onChange={handleChange}
			/>
		  )}
		</div>

		{/* Производитель (Vendor) */}
		<div className="form-group">
		  <label htmlFor="vendor">Производитель</label>
		  {readOnly ? (
			<div className="field-display">{formData.vendor}</div>
		  ) : (
			<input
			  type="text"
			  id="vendor"
			  name="vendor"
			  value={formData.vendor}
			  onChange={handleChange}
			/>
		  )}
		</div>

		{/* Модель */}
		<div className="form-group">
		  <label htmlFor="model">Модель</label>
		  {readOnly ? (
			<div className="field-display">{formData.model}</div>
		  ) : (
			<input
			  type="text"
			  id="model"
			  name="model"
			  value={formData.model}
			  onChange={handleChange}
			/>
		  )}
		</div>

		{/* Имя хоста */}
		<div className="form-group">
		  <label htmlFor="hostname">Имя хоста</label>
		  {readOnly ? (
			<div className="field-display">{formData.hostname}</div>
		  ) : (
			<input
			  type="text"
			  id="hostname"
			  name="hostname"
			  value={formData.hostname}
			  onChange={handleChange}
			/>
		  )}
		</div>

		{/* Улица */}
		<div className="form-group">
		  <label htmlFor="street">Улица</label>
		  {readOnly ? (
			<div className="field-display">{formData.street}</div>
		  ) : (
			<input
			  type="text"
			  id="street"
			  name="street"
			  value={formData.street}
			  onChange={handleChange}
			/>
		  )}
		</div>

		{/* Корпус */}
		<div className="form-group">
		  <label htmlFor="building">Корпус</label>
		  {readOnly ? (
			<div className="field-display">{formData.building}</div>
		  ) : (
			<input
			  type="text"
			  id="building"
			  name="building"
			  value={formData.building}
			  onChange={handleChange}
			/>
		  )}
		</div>

		{/* Этаж */}
		<div className="form-group">
		  <label htmlFor="floor">Этаж</label>
		  {readOnly ? (
			<div className="field-display">{formData.floor}</div>
		  ) : (
			<input
			  type="text"
			  id="floor"
			  name="floor"
			  value={formData.floor}
			  onChange={handleChange}
			/>
		  )}
		</div>

		{/* Кабинет */}
		<div className="form-group">
		  <label htmlFor="room">Кабинет</label>
		  {readOnly ? (
			<div className="field-display">{formData.room}</div>
		  ) : (
			<input
			  type="text"
			  id="room"
			  name="room"
			  value={formData.room}
			  onChange={handleChange}
			/>
		  )}
		</div>

		{/* Статус */}
		<div className="form-group">
		  <label htmlFor="status">Статус</label>
		  {readOnly ? (
			<div className="field-display">{formData.status}</div>
		  ) : (
			<select
			  id="status"
			  name="status"
			  value={formData.status}
			  onChange={handleChange}
			>
			  <option value="">Выберите статус</option>
			  <option value="в работе">в работе</option>
			  <option value="на складе">на складе</option>
			  <option value="списан">списан</option>
			  <option value="в ремонте">в ремонте</option>
			</select>
		  )}
		</div>

		{/* Состояние */}
		<div className="form-group">
		  <label htmlFor="condition">Состояние</label>
		  {readOnly ? (
			<div className="field-display">{formData.condition}</div>
		  ) : (
			<select
			  id="condition"
			  name="condition"
			  value={formData.condition}
			  onChange={handleChange}
			>
			  <option value="">Выберите состояние</option>
			  <option value="готов к эксплуатации">готов к эксплуатации</option>
			  <option value="требует ремонта">требует ремонта</option>
			  <option value="неисправен">неисправен</option>
			  <option value="списан">списан</option>
			</select>
		  )}
		</div>

		{/* МОЛ */}
		<div className="form-group">
		  <label htmlFor="mol">МОЛ</label>
		  {readOnly ? (
			<div className="field-display">{formData.mol}</div>
		  ) : (
			<input
			  type="text"
			  id="mol"
			  name="mol"
			  value={formData.mol}
			  onChange={handleChange}
			/>
		  )}
		</div>

		{/* ФИО МОЛ */}
		<div className="form-group">
		  <label htmlFor="molFullName">ФИО МОЛ</label>
		  {readOnly ? (
			<div className="field-display">{formData.molFullName}</div>
		  ) : (
			<input
			  type="text"
			  id="molFullName"
			  name="molFullName"
			  value={formData.molFullName}
			  onChange={handleChange}
			/>
		  )}
		</div>

		{/* Дата инвентаризации */}
		<div className="form-group">
		  <label htmlFor="inventoryDate">Дата инвентаризации</label>
		  {readOnly ? (
			<div className="field-display">
			  {formData.inventoryDate
				? new Date(formData.inventoryDate).toLocaleDateString('ru-RU')
				: ''}
			</div>
		  ) : (
			<input
			  type="date"
			  id="inventoryDate"
			  name="inventoryDate"
			  value={formData.inventoryDate}
			  onChange={handleChange}
			/>
		  )}
		</div>

		{/* Дата обновления карточки */}
		<div className="form-group">
		  <label htmlFor="updateDate">Дата обновления карточки</label>
		  {readOnly ? (
			<div className="field-display">
			  {formData.updateDate
				? new Date(formData.updateDate).toLocaleDateString('ru-RU')
				: 'Не задана'}
			</div>
		  ) : (
			<input
			  type="date"
			  id="updateDate"
			  name="updateDate"
			  value={formData.updateDate}
			  onChange={handleChange}
			/>
		  )}
		</div>

		{/* Примечания */}
		<div className="form-group">
		  <label htmlFor="notes">Примечания</label>
		  {readOnly ? (
			<div className="field-display">{formData.notes}</div>
		  ) : (
			<textarea
			  id="notes"
			  name="notes"
			  rows="3"
			  value={formData.notes}
			  onChange={handleChange}
			  placeholder="Дополнительная информация..."
			/>
		  )}
		</div>

		<div className="form-actions">
		  {!readOnly && (
			<button type="submit" className="btn btn-primary">
			  Сохранить
			</button>
		  )}
		  {onCancel && (
			<button type="button" className="btn btn-secondary" onClick={onCancel}>
			  {readOnly ? 'Закрыть' : 'Отмена'}
			</button>
		  )}
		</div>
	  </form>
	</div>
  );
};

export default EquipmentForm;