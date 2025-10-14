import React, { useState, useRef } from "react";
import { Download, Type, Palette } from "lucide-react";
import diwali from "../src/assets/Diwali.jpg";
import "./index.css";

const App = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(20);
  const [fontColor, setFontColor] = useState("#1f2937");
  const [fontWeight, setFontWeight] = useState("bold");
  const [textAlign, setTextAlign] = useState("center");
  const cardRef = useRef(null);

  const fontOptions = [
    { value: "Arial", label: "Arial" },
    { value: "Georgia", label: "Georgia" },
    { value: "Times New Roman", label: "Times New Roman" },
    { value: "Courier New", label: "Courier New" },
    { value: "Verdana", label: "Verdana" },
    { value: "Comic Sans MS", label: "Comic Sans MS" },
    { value: "Impact", label: "Impact" },
    { value: "Palatino", label: "Palatino" },
  ];

  const colorPresets = [
    { value: "#1f2937", label: "Dark Gray" },
    { value: "#000000", label: "Black" },
    { value: "#ffffff", label: "White" },
    { value: "#dc2626", label: "Red" },
    { value: "#ea580c", label: "Orange" },
    { value: "#ca8a04", label: "Gold" },
    { value: "#059669", label: "Green" },
    { value: "#2563eb", label: "Blue" },
    { value: "#7c3aed", label: "Purple" },
  ];

  const exportAsImage = async () => {
    if (cardRef.current) {
      try {
        const card = cardRef.current;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = 800;
        canvas.height = 1200;

        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
          ctx.drawImage(img, 0, 0, 800, 1200);

          ctx.fillStyle = fontColor;
          ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
          ctx.textAlign = textAlign;
          ctx.textBaseline = "middle";

          ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;

          const x =
            textAlign === "center" ? 400 : textAlign === "left" ? 50 : 750;
          const baseY = 1200 * 0.72;

          // Draw first name
          if (firstName) {
            if (lastName) {
              // If both names exist, position them on separate lines
              ctx.fillText(firstName, x, baseY - fontSize / 2);
              ctx.fillText(lastName, x, baseY + fontSize / 2);
            } else {
              // If only first name exists, center it vertically
              ctx.fillText(firstName, x, baseY);
            }
          }

          const dataUrl = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.download = `diwali-card-${firstName || "greeting"}.png`;
          link.href = dataUrl;
          link.click();

          // Clear the name fields after successful export
          setFirstName("");
          setLastName("");
        };

        img.onerror = () => {
          alert(
            "Please take a screenshot of the card or right-click and 'Save image as...'"
          );
        };

        img.src = diwali;
      } catch (error) {
        console.error("Error exporting image:", error);
        alert(
          "To export, please take a screenshot or right-click the card and 'Save image as...'"
        );
      }
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-orange-100 to-yellow-100 p-6 overflow-hidden">
      <div className="h-full max-w-7xl mx-auto flex gap-6 items-center">
        {/* Left Side - Customization Panel */}
        <div className="bg-white rounded-lg shadow-lg p-5 w-full max-w-sm flex-shrink-0 h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Type size={20} />
            Customize Your Card
          </h2>

          {/* First Name Input */}
          <div className="mb-3">
            <label className="block text-gray-700 font-semibold text-sm mb-1">
              First Name: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter first name..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Last Name Input */}
          <div className="mb-3">
            <label className="block text-gray-700 font-semibold text-sm mb-1">
              Last Name:{" "}
              <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter last name..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Font Options Grid */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Font Family */}
            <div>
              <label className="block text-gray-700 font-semibold text-sm mb-1">
                Font Style:
              </label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {fontOptions.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Weight */}
            <div>
              <label className="block text-gray-700 font-semibold text-sm mb-1">
                Weight:
              </label>
              <select
                value={fontWeight}
                onChange={(e) => setFontWeight(e.target.value)}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="900">Extra Bold</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold text-sm mb-1">
                Size (px):
              </label>
              <input
                type="number"
                min="20"
                max="96"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Text Alignment */}
            <div>
              <label className="block text-gray-700 font-semibold text-sm mb-1">
                Alignment:
              </label>
              <select
                value={textAlign}
                onChange={(e) => setTextAlign(e.target.value)}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>

          {/* Font Color */}
          <div className="mb-3">
            <label className="block text-gray-700 font-semibold text-sm mb-1 flex items-center gap-2">
              <Palette size={16} />
              Font Color:
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {colorPresets.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setFontColor(color.value)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    fontColor === color.value
                      ? "border-orange-500 scale-110"
                      : "border-gray-300 hover:border-orange-300"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
            <input
              type="color"
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
              className="w-full h-8 rounded-lg cursor-pointer"
            />
          </div>

          {/* Export Button */}
          <button
            onClick={exportAsImage}
            disabled={!firstName}
            className={`w-full py-2.5 px-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 text-sm ${
              firstName
                ? "bg-orange-500 hover:bg-orange-600 cursor-pointer"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            <Download size={18} />
            Export as PNG
          </button>

          {!firstName && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Enter first name to export
            </p>
          )}
        </div>

        {/* Right Side - Card Preview */}
        <div className="flex-1 flex justify-center items-center">
          <div
            ref={cardRef}
            className="relative bg-white rounded-lg shadow-2xl overflow-hidden"
            style={{ width: "350px", height: "450px", maxWidth: "100%" }}
          >
            <img
              src={diwali}
              alt="Diwali"
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />

            <div
              className="absolute rounded-lg px-8 py-4 flex flex-col items-center justify-center"
              style={{
                top: "72%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                minWidth: "380px",
                minHeight: "120px",
              }}
            >
              {firstName && (
                <p
                  style={{
                    fontFamily: fontFamily,
                    fontSize: `${fontSize}px`,
                    color: fontColor,
                    fontWeight: fontWeight,
                    textAlign: textAlign,
                    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                    width: "100%",
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "normal",
                    lineHeight: "1.2",
                    hyphens: "auto",
                    margin: 0,
                  }}
                >
                  {firstName}
                </p>
              )}
              {!firstName && (
                <p
                  style={{
                    fontFamily: fontFamily,
                    fontSize: `${fontSize}px`,
                    color: fontColor,
                    fontWeight: fontWeight,
                    textAlign: textAlign,
                    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                    width: "100%",
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "normal",
                    lineHeight: "1.2",
                    hyphens: "auto",
                    margin: 0,
                    opacity: 0.5,
                  }}
                >
                  First Name
                </p>
              )}
              {lastName && (
                <p
                  style={{
                    fontFamily: fontFamily,
                    fontSize: `${fontSize}px`,
                    color: fontColor,
                    fontWeight: fontWeight,
                    textAlign: textAlign,
                    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                    width: "100%",
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "normal",
                    lineHeight: "1.2",
                    hyphens: "auto",
                    margin: 0,
                  }}
                >
                  {lastName}
                </p>
              )}
              {!lastName && !firstName && (
                <p
                  style={{
                    fontFamily: fontFamily,
                    fontSize: `${fontSize}px`,
                    color: fontColor,
                    fontWeight: fontWeight,
                    textAlign: textAlign,
                    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                    width: "100%",
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "normal",
                    lineHeight: "1.2",
                    hyphens: "auto",
                    margin: 0,
                    opacity: 0.5,
                  }}
                >
                  Last Name
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
