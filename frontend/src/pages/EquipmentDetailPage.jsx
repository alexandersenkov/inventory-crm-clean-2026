import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EquipmentForm from '../components/EquipmentForm';
import { fetchEquipmentById } from '../api/equipmentApi'; // ваш API-метод

const EquipmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
	const loadEquipment = async () => {
	  try {
		setLoading(true);
		const data = await fetchEquipmentById(id);
		setEquipment(data);
	  } catch (err) {
		setError(err.message);
	  } finally {
		setLoading(false);
	  }
	};
	loadEquipment();
  }, [id]);

  const handleClose = () => {
	navigate('/equipment'); // или куда вам нужно
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;
  if (!equipment) return <div className="not-found">Оборудование не найдено</div>;

  return (
	<div className="page-container">
	  <EquipmentForm
		initialData={equipment}
		readOnly={true}
		onCancel={handleClose}
	  />
	</div>
  );
};

export default EquipmentDetailPage;