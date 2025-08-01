import React from "react";

function Header({ drawingName, setDrawingName }) {
  return (
    <header className="header">
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
