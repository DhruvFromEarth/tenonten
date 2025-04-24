import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import Toolbar from "./Toolbar";
import "../App.css";

const Canvas = () => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [color, setColor] = useState("#ffffff");
  const [lineWidth, setLineWidth] = useState(5);
  // const [changeBrush, changeBrush] = useState("PencilBrush");

  useEffect(() => {
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      // backgroundColor: "#333333",
      width: window.innerWidth,
      height: window.innerHeight,
    });

    fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
    fabricCanvas.freeDrawingBrush.color = color;
    fabricCanvas.freeDrawingBrush.width = lineWidth;

    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (canvas) {
      canvas.freeDrawingBrush.color = color;
      canvas.freeDrawingBrush.width = lineWidth;
    }
  }, [color, lineWidth, canvas]);

  const clearCanvas = () => {
    if (canvas) {
      canvas.clear();
      // canvas.backgroundColor = "#fff";
      // canvas.renderAll();
    }
  };

  const changeBrush = (brush) => {
    // if (!canvas) return;
    // setBrushType(brush);
    if (brush === "PencilBrush") {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    } else if (brush === "CircleBrush") {
      canvas.freeDrawingBrush = new fabric.CircleBrush(canvas);
    } else if (brush === "PatternBrush"){
      canvas.freeDrawingBrush = new fabric.PatternBrush(canvas);
    } else if (brush === "SprayBrush"){
      canvas.freeDrawingBrush = new fabric.SprayBrush(canvas);
    }

    canvas.freeDrawingBrush.color = color;
    canvas.freeDrawingBrush.width = lineWidth;
  };

  //keyboard shorcuts
  useEffect( () => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "1":
          setTool("pen");
          if (canvas) {
            canvas.isDrawingMode = true;
          }
          break;
        case "2":
          setTool("eraser");
          if (canvas) {
            canvas.isDrawingMode = true;
            canvas.freeDrawingBrush.color = "white"; // Eraser mode
            canvas.freeDrawingBrush.width = 10;
          }
          break;
        case "3":
          addShape("circle");
          break;
        case "4":
          addShape("square");
          break;
        case "5":
          addShape("line");
          break;
        case "6":
          addShape("arrow");
          break;
        case "7":
          addText();
          break;
        case "8":
          document.getElementById("imageUpload").click();
          break;
        case "`":
          setTool("pointer");
          if (canvas) {
            canvas.isDrawingMode = false;
          }
          break;
        case "z":
          if (e.ctrlKey) handleUndo();
          break;
        case "y":
          if (e.ctrlKey) handleRedo();
          break;
        default:
          break;
      };
    };
});
  
  return (
    <div className="canvas-container">
      <Toolbar
        setColor={setColor}
        lineWidth={lineWidth}
        setLineWidth={setLineWidth}
        changeBrush={changeBrush}
        clearCanvas={clearCanvas}
      />
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default Canvas;