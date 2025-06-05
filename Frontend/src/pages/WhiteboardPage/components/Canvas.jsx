import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import Toolbar from "./Toolbar";
// import "../App.css";

const Canvas = () => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [color, setColor] = useState("#ffffff");
  const [lineWidth, setLineWidth] = useState(5);
  const [tool, setTool] = useState("pen");
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Initialize Fabric canvas
  useEffect(() => {
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      width: window.innerWidth,
      height: window.innerHeight,
    });

    fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
    fabricCanvas.freeDrawingBrush.color = color;
    fabricCanvas.freeDrawingBrush.width = lineWidth;

    setCanvas(fabricCanvas);

    // Save initial state
    setHistory([fabricCanvas.toJSON()]);

    return () => fabricCanvas.dispose();
  }, []);

  // Update brush when color or size changes
  useEffect(() => {
    if (canvas) {
      canvas.freeDrawingBrush.color = color;
      canvas.freeDrawingBrush.width = lineWidth;
    }
  }, [color, lineWidth, canvas]);

  // Save history on object added
  useEffect(() => {
    if (!canvas) return;

    const saveHistory = () => {
      const json = canvas.toJSON();
      setHistory((prev) => [...prev, json]);
      setRedoStack([]); // clear redo on new action
    };

    canvas.on("object:added", saveHistory);
    return () => canvas.off("object:added", saveHistory);
  }, [canvas]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "1":
          setTool("pen");
          if (canvas) canvas.isDrawingMode = true;
          break;
        case "2":
          setTool("eraser");
          if (canvas) {
            canvas.isDrawingMode = true;
            canvas.freeDrawingBrush.color = "#ffffff"; // White for eraser
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
          document.getElementById("imageUpload")?.click();
          break;
        case "`":
          setTool("pointer");
          if (canvas) canvas.isDrawingMode = false;
          break;
        case "z":
          if (e.ctrlKey) handleUndo();
          break;
        case "y":
          if (e.ctrlKey) handleRedo();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canvas, color, lineWidth, history, redoStack]);

  // Change brush
  const changeBrush = (brush) => {
    if (!canvas) return;
    if (brush === "Selection") {
      canvas.isDrawingMode = false;
    } else {
      canvas.isDrawingMode = true;
      switch (brush) {
        case "PencilBrush":
          canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
          break;
        case "CircleBrush":
          canvas.freeDrawingBrush = new fabric.CircleBrush(canvas);
          break;
        case "PatternBrush":
          canvas.freeDrawingBrush = new fabric.PatternBrush(canvas);
          break;
        case "SprayBrush":
          canvas.freeDrawingBrush = new fabric.SprayBrush(canvas);
          break;
        default:
          return;
      }
      canvas.freeDrawingBrush.color = color;
      canvas.freeDrawingBrush.width = lineWidth;
    }
  };

  // Add shape
  const addShape = (type) => {
    if (!canvas) return;
    let shape;
    const boundaryColor = color; // The color of the boundary
    const strokeWidth = lineWidth; // Set the stroke width as needed

    switch (type) {
      case "circle":
        shape = new fabric.Circle({
          radius: 30, // set the size of the circle
          fill: null, // Hollow circle (no fill)
          stroke: boundaryColor, // Set the boundary color
          strokeWidth: strokeWidth, // Set the boundary width
          left: 100,
          top: 100,
        });
        break;
      case "square":
        shape = new fabric.Rect({
          width: 60, // set the size of the square
          height: 60,
          fill: null, // Hollow square (no fill)
          stroke: boundaryColor, // Set the boundary color
          strokeWidth: strokeWidth, // Set the boundary width
          left: 100,
          top: 100,
        });
        break;
      case "line":
        shape = new fabric.Line([50, 100, 200, 100], {
          stroke: boundaryColor,
          strokeWidth: strokeWidth,
        });
        break;
      case "arrow":
        shape = new fabric.Line([50, 100, 200, 100], {
          stroke: boundaryColor,
          strokeWidth: strokeWidth,
          selectable: true,
        });
        break;
      default:
        return;
    }
    canvas.add(shape);
  };


  // Add text
  const addText = () => {
    if (!canvas) return;
    const text = new fabric.IText("Type here", {
      left: 100,
      top: 100,
      fontFamily: "Arial",
      fontSize: 24,
      fill: color,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing();
  };

  // Clear canvas
  const clearCanvas = () => {
    if (canvas) {
      canvas.clear();
      const json = canvas.toJSON();
      setHistory([json]);
      setRedoStack([]);
    }
  };

  const handleUndo = () => {
    if (history.length <= 1 || !canvas) return;
  
    setHistory((prevHistory) => {
      const current = prevHistory[prevHistory.length - 1];
      const previous = prevHistory[prevHistory.length - 2];
      setRedoStack((prevRedo) => [current, ...prevRedo]);
  
      canvas.loadFromJSON(previous, () => {
        canvas.renderAll();
        canvas.requestRenderAll();
      });
  
      return prevHistory.slice(0, -1); // return new history without the last state
    });
  };
  
  const handleRedo = () => {
    if (redoStack.length === 0 || !canvas) return;
  
    setRedoStack((prevRedo) => {
      const [nextState, ...restRedo] = prevRedo;
  
      // Apply redo to canvas
      canvas.loadFromJSON(nextState, () => {
        canvas.renderAll();
      });
  
      // Push to history
      setHistory((prevHistory) => [...prevHistory, nextState]);
  
      return restRedo; // updated redo stack
    });
  };
  
  
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
