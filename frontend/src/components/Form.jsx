import React, { useState } from "react";

export default function Form({ onSubmit, initial }) {
  const [name, setName] = useState(initial?.name || "");
  const [type, setType] = useState(initial?.type || "");

  const submit = (e) => {
    e.preventDefault();
    onSubmit({ name, type });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          className="w-full border p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Type</label>
        <input
          className="w-full border p-2"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
      </div>

      <button className="btn w-full">Save</button>
    </form>
  );
}
