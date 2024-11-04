import { useEffect, useState } from "react";
import "./App.css";
import "./index.css";
import ImportVideo from "./components/ImportVideo";
import PreviewFrames from "./components/PreviewFrames";
import GenerateFlipbook from "./components/GenerateFlipbook";
import SideNav from "./components/SideNav";

function App() {
  const [activeView, setActiveView] = useState<
    "videoTab" | "previewTab" | "pdfTab"
  >("videoTab");
  const [videoPath, setVideoPath] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [framesPerSecond, setFramesPerSecond] = useState<number>(1);
  const [frames, setFrames] = useState<string[]>([]);

  const renderContent = () => {
    switch (activeView) {
      case "videoTab":
        return (
          <ImportVideo
            videoPath={videoPath}
            setVideoPath={setVideoPath}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            framesPerSecond={framesPerSecond}
            setFramesPerSecond={setFramesPerSecond}
            // frames={frames}
            setFrames={setFrames}
          />
        );
      case "previewTab":
        return <PreviewFrames/>;
      case "pdfTab":
        return <GenerateFlipbook frames={frames}/>;
    }
  };

  useEffect(() => {
    return () => {
      if (videoPath) {
        URL.revokeObjectURL(videoPath);
      }
    };
  }, [videoPath]);

  return (
    <div className="flex h-screen">
      <SideNav activeView={activeView} setActiveView={setActiveView} />
      {renderContent()}
    </div>
  );
}

export default App;
