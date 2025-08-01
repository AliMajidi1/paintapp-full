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
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedDrawings, setSavedDrawings] = useState([]);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
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

  // Save drawing to backend
  const handleSave = async () => {
    if (!username) {
      alert("Please enter your username.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/drawings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          data: {
            drawingName,
            shapes,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to save drawing");
      alert("Drawing saved!");
    } catch (e) {
      alert("Error saving drawing.");
    }
    setLoading(false);
  };

  // Load drawings from backend
  const handleLoad = async () => {
    if (!username) {
      alert("Please enter your username.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/api/drawings/${encodeURIComponent(username)}`);
      if (!res.ok) throw new Error("Failed to load drawings");
      const data = await res.json();
      setSavedDrawings(data);
      setShowLoadDialog(true);
    } catch (e) {
      alert("Error loading drawings.");
    }
    setLoading(false);
  };

  // Load a selected drawing from the dialog
  const handleSelectSavedDrawing = (drawing) => {
    setDrawingName(drawing.data.drawingName || "Untitled Drawing");
    setShapes(drawing.data.shapes || []);
    setShowLoadDialog(false);
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
      />
      <div style={{ display: "flex", alignItems: "center", gap: 16, margin: 16 }}>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username"
          style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
        <button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>
        <button onClick={handleLoad} disabled={loading}>
          {loading ? "Loading..." : "Load"}
        </button>
      </div>
      {showLoadDialog && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.2)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ background: "#fff", padding: 24, borderRadius: 8, minWidth: 320 }}>
            <h3>Saved Drawings</h3>
            {savedDrawings.length === 0 && <div>No drawings found.</div>}
            <ul style={{ maxHeight: 300, overflowY: "auto", padding: 0 }}>
              {savedDrawings.map(d => (
                <li key={d.id} style={{ margin: "8px 0", listStyle: "none" }}>
                  <button
                    style={{ width: "100%", textAlign: "left", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
                    onClick={() => handleSelectSavedDrawing(d)}
                  >
                    {d.data.drawingName || "Untitled Drawing"} <span style={{ color: "#888", fontSize: 12 }}>({d.timestamp})</span>
                  </button>
                </li>
              ))}
            </ul>
            <button onClick={() => setShowLoadDialog(false)} style={{ marginTop: 12 }}>Close</button>
          </div>
        </div>
      )}
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

