import { useState } from "react";
import "./App.css";
import "./index.css"
import ImportVideo from "./components/ImportVideo";
import PreviewFrames from "./components/PreviewFrames";
import GenerateFlipbook from "./components/GenerateFlipbook";
import SideNav from "./components/SideNav";

function App() {
  const [activeView, setActiveView] = useState<'videoTab' | 'previewTab' | 'pdfTab'>('videoTab')

  const renderContent = () => {
    switch (activeView) {
      case 'videoTab':
        return <ImportVideo />;
      case 'previewTab':
        return <PreviewFrames />;
      case 'pdfTab':
        return <GenerateFlipbook />;
      default:
        return <ImportVideo />;
    }
  };

  return (
    <div className="flex h-screen">
      <SideNav activeView={activeView} setActiveView={setActiveView}/>
      {renderContent()}
    </div>
  );
}

export default App;
