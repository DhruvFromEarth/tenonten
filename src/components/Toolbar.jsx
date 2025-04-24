import React from "react";
import "../App.css";

const Toolbar = ({setColor, lineWidth, setLineWidth, changeBrush, clearCanvas}) => {
  return (
    <div className="toolbar">
      {/* <label>Brush Color:</label> */}
      <input type="color" id="input1" defaultValue="#FFFFFF" onChange={(e) => setColor(e.target.value)} />

      {/* <label>Brush Size:</label> */}
      <input
        id="input2"
        type="range"
        min="1"
        max="50"
        value={lineWidth}
        onChange={(e) => setLineWidth(parseInt(e.target.value))}
      />

      <select onChange={(e) => changeBrush(e.target.value)}>
        <option value="PencilBrush">Pencil</option>
        <option value="CircleBrush">Circle</option>
        <option value="PatternBrush">Pattern</option>
        <option value="SprayBrush">SprayBrush</option>
      </select>

      <button onClick={clearCanvas}>Clear</button>
    </div>
  );
};

export default Toolbar;