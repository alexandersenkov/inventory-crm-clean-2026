import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 bg-white border-r h-full p-4">
      <h1 className="text-xl font-bold mb-6 text-blue-600">CRM</h1>

      <nav className="flex flex-col gap-2">
        <Link
          to="/"
          className="px-3 py-2 rounded hover:bg-blue-500 hover:text-white transition"
        >
          Dashboard
        </Link>

        <Link
          to="/equipment"
          className="px-3 py-2 rounded hover:bg-blue-500 hover:text-white transition"
        >
          Оборудование
        </Link>
      </nav>
    </div>
  );
}
