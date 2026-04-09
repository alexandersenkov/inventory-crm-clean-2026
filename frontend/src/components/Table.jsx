import React from "react";

export default function Table({ data, onEdit, onDelete }) {
  return (
    <table className="min-w-full bg-white shadow-sm">
      <thead className="bg-blue-100 text-black">
        <tr>
          <th className="p-2 text-left">ID</th>
          <th className="p-2 text-left">Name</th>
          <th className="p-2 text-left">Type</th>
          <th className="p-2 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((it) => (
          <tr key={it.id} className="border-b">
            <td className="p-2">{it.id}</td>
            <td className="p-2">{it.name}</td>
            <td className="p-2">{it.type}</td>
            <td className="p-2 space-x-2">
              <button
                className="btn text-sm"
                onClick={() => onEdit(it)}
              >
                Edit
              </button>
              <button
                className="btn text-sm"
                onClick={() => onDelete(it.id)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
