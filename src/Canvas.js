import React, { useRef, useState } from "react";

const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 800;
const SHAPE_SIZE = 50;

function renderShape(shape, onDoubleClick, onClick, isSelected) {
  const { id, type, x, y, size = 50 } = shape;
  const half = size / 2;
  const commonProps = {
    key: id,
    onDoubleClick: () => onDoubleClick(id),
    onClick: (e) => {
      e.stopPropagation();
      onClick(id);
    },
    style: isSelected ? { filter: 'drop-shadow(0 0 8px #1976d2)' } : {},
  };
  switch (type) {
    case "circle":
      return (
        <circle
          cx={x}
          cy={y}
          r={half}
          className="shape-circle"
          {...commonProps}
        />
      );
    case "square":
      return (
        <rect
          x={x - half}
          y={y - half}
          width={size}
          height={size}
          className="shape-square"
          {...commonProps}
        />
      );
    case "triangle":
      const points = [
        [x, y - half],
        [x - half, y + half],
        [x + half, y + half],
      ]
        .map((p) => p.join(","))
        .join(" ");
      return (
        <polygon
          points={points}
          className="shape-triangle"
          {...commonProps}
        />
      );
    default:
      return null;
  }
}

function Canvas({
  shapes,
  onAddShape,
  onRemoveShape,
  onDropShape,
  dragShape,
  selectedShapeId,
  onSelectShape,
  onMoveShape,
}) {
  const svgRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleDrop = (e) => {
    e.preventDefault();
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    onDropShape(x, y);
  };

  const handleDragOver = (e) => {
    if (dragShape) e.preventDefault();
  };

  const handleClick = (e) => {
    if (!dragShape) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    onAddShape(dragShape, x, y);
  };

  const handleMouseDown = (e) => {
    if (!selectedShapeId) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const shape = shapes.find((s) => s.id === selectedShapeId);
    if (shape) {
      setDragging(true);
      setDragOffset({ x: x - shape.x, y: y - shape.y });
    }
  };

  const handleMouseMove = (e) => {
    if (!dragging || !selectedShapeId) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    onMoveShape(selectedShapeId, x - dragOffset.x, y - dragOffset.y);
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  return (
    <main className="canvas-container">
      <svg
        ref={svgRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="canvas-svg"
        style={{ cursor: dragShape ? "crosshair" : dragging ? "grabbing" : selectedShapeId ? "pointer" : "default" }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {shapes.map((shape) =>
          renderShape(
            shape,
            onRemoveShape,
            onSelectShape,
            shape.id === selectedShapeId
          )
        )}
      </svg>
    </main>
  );
}

export default Canvas;
