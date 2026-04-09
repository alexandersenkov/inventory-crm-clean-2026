import React from "react";

export default function Button({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
    >
      {children}
    </button>
  );
}
