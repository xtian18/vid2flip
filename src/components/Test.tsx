import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import jsPDF from "jspdf";
import { useEffect, useState } from "react";

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

const Test = () => {
  const [videoPath, setVideoPath] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<number>();
  const [framesPerSecond, setFramesPerSecond] = useState<number>(1);
  const [frames, setFrames] = useState<string[]>([]);
  const [frameWidth, setFrameWidth] = useState<number>(70);
  const [frameHeight, setFrameHeight] = useState<number>(50);
  const [flipBookPageWidth, setFlipBookPageWidth] = useState<number>(120);
  const [flipBookPageHeight, setFlipBookPageHeight] = useState<number>(60);
  const [paperSize, setPaperSize] = useState<'a4' | 'letter' | 'legal'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  const { width: paperWidth, height: paperHeight } = paperDimensions[paperSize][orientation];

  const ffmpeg = createFFmpeg({ log: false });

  const handleFpsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      setFramesPerSecond(value);
    }
  };

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
    setPaperSize(e.target.value as 'a4' | 'letter' | 'legal');
  };

  const handleOrientationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOrientation(e.target.value as 'portrait' | 'landscape');
  };

  const handleVideoImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      setVideoPath(url);

      const video = document.createElement('video');
      video.src = url;

      video.addEventListener('loadedmetadata', () => {
        const width = video.videoWidth;
        const height = video.videoHeight;
        setAspectRatio(width / height);
      });
    } else {
      console.error("No files selected or file input is null.");
    }
  };

  const loadFFmpeg = async () => {
    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }
  };

  const extractFrames = async () => {
    await loadFFmpeg();

    setFrames([]);

    // Write the file to FFmpeg's virtual file system
    ffmpeg.FS("writeFile", "input.mp4", await fetchFile(videoPath));

    // Run the ffmpeg command to extract frames
    await ffmpeg.run(
      "-i",
      "input.mp4",
      "-vf",
      `fps=${framesPerSecond}`,
      "output_%03d.png"
    );

    // Read and store the frames in memory
    const extractedFrames: string[] = [];
    // eslint-disable-next-line no-constant-condition
    for (let i = 1; true; i++) {
      const frameName = `output_${String(i).padStart(3, "0")}.png`;
      try {
        const data = ffmpeg.FS("readFile", frameName);
        extractedFrames.push(
          URL.createObjectURL(new Blob([data.buffer], { type: "image/png" }))
        );
      } catch (e) {
        // Stop if frame does not exist (end of frames)
        console.log(e);
        break;
      }
    }

    setFrames(extractedFrames);
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

      pdf.rect(x, y, flipBookPageWidth, flipBookPageHeight, "S");

      const imageX = x + flipBookPageWidth - frameWidth - 5;
      const imageY = y + (flipBookPageHeight - frameHeight) / 2;
      pdf.addImage(frame, "PNG", imageX, imageY, frameWidth, frameHeight);

      pdf.text(`${index + 1}`, x + 5, y + frameHeight + 5);

      x += flipBookPageWidth
    });

    pdf.save("FlipBook.pdf");
  };

  useEffect(() => {
    return () => {
      if (videoPath) {
        URL.revokeObjectURL(videoPath);
      }
    };
  }, [videoPath]);

  return (
    <>
      <p>File Path: {videoPath}</p>
      <p>FPS: {framesPerSecond}</p>
      <p>Aspect Ratio: {aspectRatio}</p>
      <input
        type="number"
        className="form-control"
        id="framesPerSecond"
        min={1}
        value={framesPerSecond}
        onChange={handleFpsChange}
      ></input>
      <input type="file" accept="video/*" onChange={handleVideoImport} />
      {videoPath && (
        <video width="600" controls src={videoPath}>
          Your browser does not support the video tag.
        </video>
      )}
      <button
        type="button"
        className={`btn btn-primary ${videoPath ? "" : "disabled"}`}
        onClick={extractFrames}
      >
        Extract Frames
      </button>

      <form>
        <div className="form-group">
          <label htmlFor="frameWidth">Frame Width in mm</label>
          <input
            type="number"
            className="form-control"
            id="frameWidth"
            value={frameWidth}
            onChange={handleFrameWidthChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="frameHeight">Frame Height in mm</label>
          <input
            type="number"
            className="form-control"
            id="frameHeight"
            value={frameHeight}
            onChange={handleFrameHeightChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="flipBookPageWidth">Flipbook Page Width in mm</label>
          <input
            type="number"
            className="form-control"
            id="flipBookPageWidth"
            value={flipBookPageWidth}
            onChange={handleFlipBookPageWidthChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="flipBookPageHeight">Flipbook Page Height in mm</label>
          <input
            type="number"
            className="form-control"
            id="flipBookPageHeight"
            placeholder="Enter email"
            value={flipBookPageHeight}
            onChange={handleFlipBookPageHeightChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="paperSize">Paper Size</label>
          <select
            className="form-control"
            id="paperSize"
            value={paperSize}
            onChange={handlePaperSizeChange}
          >
            <option value="a4">A4</option>
            <option value="letter">Letter</option>
            <option value="legal">Legal</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="orientation">Paper Orientation</label>
          <select
            className="form-control"
            id="orientation"
            value={orientation}
            onChange={handleOrientationChange}
          >
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </div>
        <button
          className={`btn btn-primary ${frames.length ? "" : "disabled"}`}
          onClick={handleGeneratePDF}
        >
          Generate PDF
        </button>
      </form>
    </>
  );
};

export default Test;
