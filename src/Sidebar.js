import React from "react";

const shapes = [
  { type: "circle" },
  { type: "square" },
  { type: "triangle" },
];

function ShapeIcon({ type }) {
  const size = 48;
  const half = size / 2;
  switch (type) {
    case "circle":
      return (
        <svg width={size} height={size}>
          <circle
            cx={half}
            cy={half}
            r={half - 4}
            fill="#64b5f6"
            stroke="#1976d2"
            strokeWidth="2"
          />
        </svg>
      );
    case "square":
      return (
        <svg width={size} height={size}>
          <rect
            x={4}
            y={4}
            width={size - 8}
            height={size - 8}
            fill="#81c784"
            stroke="#388e3c"
            strokeWidth="2"
          />
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
        <svg width={size} height={size}>
          <polygon
            points={points}
            fill="#fff176"
            stroke="#fbc02d"
            strokeWidth="2"
          />
        </svg>
      );
    default:
      return null;
  }
}

function getShapeDragImage(type) {
  const size = 60;
  const half = size / 2;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, size, size);
  switch (type) {
    case "circle":
      ctx.beginPath();
      ctx.arc(half, half, half, 0, 2 * Math.PI);
      ctx.fillStyle = "#64b5f6";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#1976d2";
      ctx.stroke();
      break;
    case "square":
      ctx.beginPath();
      ctx.rect(0, 0, size, size);
      ctx.fillStyle = "#81c784";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#388e3c";
      ctx.stroke();
      break;
    case "triangle":
      ctx.beginPath();
      ctx.moveTo(half, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(size, size);
      ctx.closePath();
      ctx.fillStyle = "#fff176";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#fbc02d";
      ctx.stroke();
      break;
    default:
      break;
  }
  return canvas;
}

function Sidebar({ onDragStart, onDragEnd, onDrag }) {
  const handleDrag = (e) => {
    if (onDrag) {
      onDrag(e.clientX, e.clientY);
    }
  };
  return (
    <aside className="sidebar">
      <div className="sidebar-title">Shapes</div>
      {shapes.map((shape) => (
        <div
          key={shape.type}
          draggable
          onDragStart={(e) => {
            onDragStart(shape.type);
            const img = getShapeDragImage(shape.type);
            e.dataTransfer.setDragImage(img, img.width / 2, img.height / 2);
          }}
          onDragEnd={onDragEnd}
          onDrag={handleDrag}
          className="sidebar-shape"
          style={{ minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <ShapeIcon type={shape.type} />
        </div>
      ))}
    </aside>
  );
}

export default Sidebar;
