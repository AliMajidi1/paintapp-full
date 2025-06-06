import React from "react";

function Header({ drawingName, setDrawingName, onExport, onImportClick }) {
  return (
    <header className="header">
      <button onClick={onImportClick} className="header-button">
        Import
      </button>
      <button onClick={onExport} className="header-button" style={{ marginRight: '16px' }}>
        Export
      </button>
      <input
        type="text"
        value={drawingName}
        onChange={(e) => setDrawingName(e.target.value)}
        className="header-input"
        placeholder="Drawing Name"
      />
    </header>
  );
}

export default Header;
