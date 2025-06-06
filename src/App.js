import React, { useState, useRef } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Canvas from "./Canvas";
import ShapeCount from "./ShapeCount";
import "./App.css";

const initialShapes = [];

function renderShapePreview(type, x, y) {
  const size = 50;
  const half = size / 2;
  const style = {
    position: "fixed",
    pointerEvents: "none",
    left: x - half,
    top: y - half,
    zIndex: 9999,
    opacity: 0.8,
  };
  switch (type) {
    case "circle":
      return (
        <svg width={size} height={size} style={style}>
          <circle cx={half} cy={half} r={half - 4} fill="#64b5f6" stroke="#1976d2" strokeWidth="2" />
        </svg>
      );
    case "square":
      return (
        <svg width={size} height={size} style={style}>
          <rect x={4} y={4} width={size - 8} height={size - 8} fill="#81c784" stroke="#388e3c" strokeWidth="2" />
        </svg>
      );
    case "triangle":
      const points = [
        [half, 4],
        [4, size - 4],
        [size - 4, size - 4],
      ]
        .map((p) => p.join(","))
        .join(" ");
      return (
        <svg width={size} height={size} style={style}>
          <polygon points={points} fill="#fff176" stroke="#fbc02d" strokeWidth="2" />
        </svg>
      );
    default:
      return null;
  }
}

function App() {
  const [drawingName, setDrawingName] = useState("Untitled Drawing");
  const [shapes, setShapes] = useState(initialShapes);
  const [dragShape, setDragShape] = useState(null);
  const [dragMouse, setDragMouse] = useState(null);
  const [selectedShapeId, setSelectedShapeId] = useState(null);
  const fileInputRef = useRef();

  const handleAddShape = (type, x, y) => {
    setShapes([
      ...shapes,
      {
        id: Date.now() + Math.random(),
        type,
        x,
        y,
        size: 50,
      },
    ]);
  };

  const handleRemoveShape = (id) => {
    setShapes(shapes.filter((s) => s.id !== id));
    if (selectedShapeId === id) setSelectedShapeId(null);
  };

  const handleSelectShape = (id) => {
    setSelectedShapeId(id);
  };

  const handleMoveShape = (id, newX, newY) => {
    setShapes(shapes.map((s) =>
      s.id === id ? { ...s, x: newX, y: newY } : s
    ));
  };

  const handleChangeShapeSize = (size) => {
    setShapes(shapes.map((s) =>
      s.id === selectedShapeId ? { ...s, size: Number(size) } : s
    ));
  };

  const handleExport = () => {
    const data = {
      drawingName,
      shapes,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${drawingName || "drawing"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        setDrawingName(data.drawingName || "Untitled Drawing");
        setShapes(data.shapes || []);
      } catch {
        alert("Invalid file format.");
      }
    };
    reader.readAsText(file);
  };

  const handleSidebarDragStart = (shapeType) => setDragShape(shapeType);
  const handleSidebarDragEnd = () => {
    setDragShape(null);
    setDragMouse(null);
  };
  const handleSidebarDrag = (x, y) => setDragMouse({ x, y });

  const handleCanvasDrop = (x, y) => {
    if (dragShape) {
      handleAddShape(dragShape, x, y);
      setDragShape(null);
    }
  };

  return (
    <div className="app-container">
      <Header
        drawingName={drawingName}
        setDrawingName={setDrawingName}
        onExport={handleExport}
        onImportClick={() => fileInputRef.current.click()}
      />
      <input
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleImport}
      />
      <div className="main-content">
        <Sidebar
          onDragStart={handleSidebarDragStart}
          onDragEnd={handleSidebarDragEnd}
          onDrag={handleSidebarDrag}
        />
        <div style={{ flex: 1, position: 'relative' }}>
          <Canvas
            shapes={shapes}
            onAddShape={handleAddShape}
            onRemoveShape={handleRemoveShape}
            onDropShape={handleCanvasDrop}
            dragShape={dragShape}
            selectedShapeId={selectedShapeId}
            onSelectShape={handleSelectShape}
            onMoveShape={handleMoveShape}
          />
          {selectedShapeId && (
            <div style={{
              position: 'absolute',
              top: 20,
              right: 30,
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: 8,
              padding: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              zIndex: 10,
            }}>
              <label>
                Size:
                <input
                  type="range"
                  min="20"
                  max="200"
                  value={shapes.find(s => s.id === selectedShapeId)?.size || 50}
                  onChange={e => handleChangeShapeSize(e.target.value)}
                  style={{ margin: '0 10px', verticalAlign: 'middle' }}
                />
                <input
                  type="number"
                  min="20"
                  max="200"
                  value={shapes.find(s => s.id === selectedShapeId)?.size || 50}
                  onChange={e => handleChangeShapeSize(e.target.value)}
                  style={{ width: 60 }}
                />
              </label>
            </div>
          )}
        </div>
      </div>
      <ShapeCount shapes={shapes} />
      {dragShape && dragMouse && renderShapePreview(dragShape, dragMouse.x, dragMouse.y)}
    </div>
  );
}

export default App;