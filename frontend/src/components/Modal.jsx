import React from "react";

export default function Modal({ children, onClose }) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="bg-white rounded p-6 max-w-md w-full">
        {children}
      </div>
    </div>
  );
}
