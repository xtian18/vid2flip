import { FaUpload } from "react-icons/fa6";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { useState } from "react";

interface ImportVideoProps {
  videoPath: string;
  setVideoPath: (view: string) => void;
  aspectRatio: number;
  setAspectRatio: (view: number) => void;
  framesPerSecond: number;
  setFramesPerSecond: (view: number) => void;
  // frames: string[];
  setFrames: (view: string[]) => void;
}

const ImportVideo: React.FC<ImportVideoProps> = ({
  videoPath,
  setVideoPath,
  aspectRatio,
  setAspectRatio,
  framesPerSecond,
  setFramesPerSecond,
  // frames,
  setFrames,
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  const ffmpeg = createFFmpeg({ log: false });

  const handleFpsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      setFramesPerSecond(value);
    }
  };

  const handleVideoImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      setVideoPath(url);

      const video = document.createElement("video");
      video.src = url;

      video.addEventListener("loadedmetadata", () => {
        const width = video.videoWidth;
        const height = video.videoHeight;
        setAspectRatio(width / height);
      });
    } else {
      console.error("No files selected or file input is null.");
    }

    console.log(aspectRatio);
  };

  const loadFFmpeg = async () => {
    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }
  };

  const extractFrames = async () => {
    setLoading(true);

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

    setLoading(false);
  };
  return (
    <div className="bg-gray-100 flex-1 p-6">
      <h1 className="text-4xl font-bold">Import Video</h1>
      {/* Video player */}
      <div className="flex bg-white p-4 my-4 rounded-md drop-shadow justify-center">
        {videoPath && (
          <video
            controls
            src={videoPath}
            className="h-[40vh] w-full bg-black rounded-md"
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>
      {/* Frames per second form */}
      <div className="flex space-x-2 bg-white p-4 my-4 rounded-md drop-shadow">
        <div className="self-end flex-grow">
          <label
            htmlFor="framesPerSecond"
            className="block mb-1 text-sm text-gray-700"
          >
            FPS to be extracted
          </label>
          <input
            type="number"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="framesPerSecond"
            value={framesPerSecond}
            onChange={handleFpsChange}
          />
        </div>
        <button
          className={`self-end px-4 py-2 border-2 rounded-md
            ${
              !videoPath
                ? "bg-gray-400 cursor-not-allowed text-gray-700"
                : "text-purple-900 border-purple-800 hover:bg-purple-900 hover:text-white"
            }`}
          onClick={extractFrames}
          disabled={!videoPath}
        >
          Extract Frames
        </button>
      </div>
      {/* Button(s) */}
      <div className="flex justify-end">
        <div className="relative inline-flex items-center">
          <button className="bg-amber-500 hover:bg-amber-600 text-white rounded-md inline-flex items-center">
            <span className="py-2 px-4 bg-black/10 rounded-l-lg">
              <FaUpload className="w-6 h-6" />
            </span>
            <span className="py-2 px-4">Import New Video</span>
          </button>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoImport}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
      {/* Popup for loading */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded shadow-lg">
            <div className="flex items-center justify-center space-x-2">
              <div
                className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-transparent border-t-blue-500 align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                role="status"
              ></div>
              <span>Extracting Frames...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportVideo;
