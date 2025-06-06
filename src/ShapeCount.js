import React from "react";

function ShapeCount({ shapes }) {
  const counts = { circle: 0, square: 0, triangle: 0 };
  shapes.forEach((s) => {
    if (counts[s.type] !== undefined) counts[s.type]++;
  });

  return (
    <footer className="shape-count-footer">
      <span>Circle: {counts.circle}</span>
      <span>Square: {counts.square}</span>
      <span>Triangle: {counts.triangle}</span>
    </footer>
  );
}

export default ShapeCount;
