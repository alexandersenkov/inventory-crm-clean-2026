import React, { useState, useEffect } from "react";
import { api } from "../api/axios";
import Table from "../components/Table";
import Modal from "../components/Modal";
import Form from "../components/Form";

export default function Inventory() {
  const [data, setData] = useState([]);
  const [editItem, setEditItem] = useState(null);

  const fetchAll = async () => {
    const res = await api.get("/equipment");
    setData(res.data);
  };

  const save = async (values) => {
    if (editItem) {
      await api.put(`/equipment/${editItem.id}`, values);
    } else {
      await api.post("/equipment", values);
    }
    setEditItem(null);
    fetchAll();
  };

  const remove = async (id) => {
    await api.delete(`/equipment/${id}`);
    fetchAll();
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <div className="space-y-4">
      <button className="btn" onClick={() => setEditItem({})}>
        + New Equipment
      </button>

      <Table data={data} onEdit={setEditItem} onDelete={remove} />

      {editItem !== null && (
        <Modal onClose={() => setEditItem(null)}>
          <Form onSubmit={save} initial={editItem.id ? editItem : {}} />
        </Modal>
      )}
    </div>
  );
}
