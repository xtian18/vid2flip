import { FaGears } from "react-icons/fa6";
import jsPDF from "jspdf";
import { useState } from "react";

interface GenerateFlipbookProps {
  frames: string[];
}

const paperDimensions = {
  a4: {
    portrait: { width: 210, height: 297 },
    landscape: { width: 297, height: 210 },
  },
  letter: {
    portrait: { width: 216, height: 279 },
    landscape: { width: 279, height: 216 },
  },
  legal: {
    portrait: { width: 216, height: 356 },
    landscape: { width: 356, height: 216 },
  },
};

const GenerateFlipbook: React.FC<GenerateFlipbookProps> = ({frames}) => {
  const [frameWidth, setFrameWidth] = useState<number>(70);
  const [frameHeight, setFrameHeight] = useState<number>(50);
  const [flipBookPageWidth, setFlipBookPageWidth] = useState<number>(120);
  const [flipBookPageHeight, setFlipBookPageHeight] = useState<number>(60);
  const [paperSize, setPaperSize] = useState<"a4" | "letter" | "legal">("a4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait"
  );

  const { width: paperWidth, height: paperHeight } =
    paperDimensions[paperSize][orientation];

  const handleFrameWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      setFrameWidth(value);
    }
  };

  const handleFrameHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      setFrameHeight(value);
    }
  };

  const handleFlipBookPageWidthChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      setFlipBookPageWidth(value);
    }
  };

  const handleFlipBookPageHeightChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      setFlipBookPageHeight(value);
    }
  };

  const handlePaperSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPaperSize(e.target.value as "a4" | "letter" | "legal");
  };

  const handleOrientationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOrientation(e.target.value as "portrait" | "landscape");
  };

  const handleGeneratePDF = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    generatePDF();
  };

  const generatePDF = async () => {
    const pdf = new jsPDF({
      orientation: orientation,
      unit: "mm",
      format: paperSize,
    });

    let x = 10;
    let y = 10;
    pdf.setLineWidth(0.1);
    pdf.setDrawColor(0, 0, 0, 50)
    pdf.setFontSize(8);

    frames.forEach(async (frame, index) => {
      if (x + flipBookPageWidth > paperWidth - 10) {
        x = 10;
        y += flipBookPageHeight;
      }

      if (y + flipBookPageHeight > paperHeight - 10) {
        pdf.addPage();
        y = 10;
      }

      // Draw top guide lines
      pdf.line(x, 0, x, 5);
      pdf.line(x + flipBookPageWidth, 0, x + flipBookPageWidth, 5);

      // Draw left guide lines
      pdf.line(0, y, 5, y);
      pdf.line(0, y + flipBookPageHeight, 5, y + flipBookPageHeight);

      // Draw right guide lines
      pdf.line(paperWidth, y, paperWidth - 5, y);
      pdf.line(paperWidth, y + flipBookPageHeight, paperWidth - 5, y + flipBookPageHeight);

      // Draw bottom guide lines
      pdf.line(paperHeight, y, paperHeight - 5, y);
      pdf.line(paperHeight, y + flipBookPageHeight, paperHeight - 5, y + flipBookPageHeight);

      pdf.rect(x, y, flipBookPageWidth, flipBookPageHeight, "S");

      const imageX = x + flipBookPageWidth - frameWidth - 5;
      const imageY = y + (flipBookPageHeight - frameHeight) / 2;
      pdf.addImage(frame, "PNG", imageX, imageY, frameWidth, frameHeight);

      pdf.text(`${index + 1}`, x + 5, y + frameHeight + 5);

      x += flipBookPageWidth;
    });

    pdf.save("FlipBook.pdf");
  };

  return (
    <div className="bg-gray-100 flex-1 p-6">
      <h1 className="text-4xl font-bold">Generate Flipbook</h1>
      {/* PDF settings */}
      <div className="bg-white p-4 my-4 rounded-md drop-shadow">
        <h2 className="text-lg font-semibold">PDF Settings</h2>
        <div className="flex flex-wrap space-x-2 mt-2">
          <div className="flex-1">
            <label
              htmlFor="paperSize"
              className="block mb-1 text-sm text-gray-700"
            >
              Paper Size
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="paperSize"
              value={paperSize}
              onChange={handlePaperSizeChange}
            >
              <option value="a4">A4</option>
              <option value="letter">Letter</option>
              <option value="legal">Legal</option>
            </select>
          </div>
          <div className="flex-1">
            <label
              htmlFor="orientation"
              className="block mb-1 text-sm text-gray-700"
            >
              Paper Orientation
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="orientation"
              value={orientation}
              onChange={handleOrientationChange}
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
        </div>
      </div>

      {/* Flipbook Page Settings */}
      <div className="bg-white p-4 my-4 rounded-md drop-shadow">
        <h2 className="text-lg font-semibold">Flipbook Page Settings</h2>
        <div className="flex flex-wrap space-x-2 mt-2">
          <div className="flex-1">
            <label
              htmlFor="frameWidth"
              className="block mb-1 text-sm text-gray-700"
            >
              Frame Width (mm)
            </label>
            <input
              type="number"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="frameWidth"
              value={frameWidth}
              onChange={handleFrameWidthChange}
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="frameHeight"
              className="block mb-1 text-sm text-gray-700"
            >
              Frame Height (mm)
            </label>
            <input
              type="number"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="frameHeight"
              value={frameHeight}
              onChange={handleFrameHeightChange}
            />
          </div>
        </div>
        <div className="flex flex-wrap space-x-2 mt-2">
          <div className="flex-1">
            <label
              htmlFor="flipBookPageWidth"
              className="block mb-1 text-sm text-gray-700"
            >
              Flipbook Page Width (mm)
            </label>
            <input
              type="number"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="flipBookPageWidth"
              value={flipBookPageWidth}
              onChange={handleFlipBookPageWidthChange}
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="flipBookPageHeight"
              className="block mb-1 text-sm text-gray-700"
            >
              Flipbook Page Height (mm)
            </label>
            <input
              type="number"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="flipBookPageHeight"
              value={flipBookPageHeight}
              onChange={handleFlipBookPageHeightChange}
            />
          </div>
        </div>
      </div>
      {/* Button(s) */}
      <div className="flex justify-end">
        <button
          onClick={handleGeneratePDF}
          className={`rounded-md inline-flex items-center
            ${frames.length === 0 ? "bg-gray-400 cursor-not-allowed text-gray-700" : "bg-amber-500 hover:bg-amber-600 text-white"}`}
          disabled={frames.length === 0}
        >
          <span className="py-2 px-4 bg-black/10 rounded-l-lg">
            <FaGears className="w-6 h-6" />
          </span>
          <span className="py-2 px-4">Generate PDF</span>
        </button>
      </div>
    </div>
  );
};

export default GenerateFlipbook;
