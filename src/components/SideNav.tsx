import { FaUpload, FaMagnifyingGlass, FaBookOpen } from "react-icons/fa6";

interface SideNavProps {
  activeView: "videoTab" | "previewTab" | "pdfTab";
  setActiveView: (view: "videoTab" | "previewTab" | "pdfTab") => void;
}

const SideNav: React.FC<SideNavProps> = ({ activeView, setActiveView }) => {
  return (
    <div className="w-64 bg-purple-800 text-white">
      <h1 className="text-3xl text-center font-bold mt-5">Vid2Flip</h1>
      <ul className="mt-5">
        <li
          className={`${
            activeView == "videoTab" ? "bg-purple-900" : ""
          } px-6 py-4 cursor-pointer hover:bg-purple-900`}
          onClick={() => setActiveView("videoTab")}
        >
          <FaUpload className="inline-block w-6 h-6 mr-4"></FaUpload>
          <span className="text-lg">Import Video</span>
        </li>
        <li
          className={`${
            activeView == "previewTab" ? "bg-purple-900" : ""
          } px-6 py-4 cursor-pointer hover:bg-purple-900`}
          onClick={() => setActiveView("previewTab")}
        >
          <FaMagnifyingGlass className="inline-block w-6 h-6 mr-4"></FaMagnifyingGlass>
          <span className="text-lg">Preview Frames</span>
        </li>
        <li
          className={`${
            activeView == "pdfTab" ? "bg-purple-900" : ""
          } px-6 py-4 cursor-pointer hover:bg-purple-900`}
          onClick={() => setActiveView("pdfTab")}
        >
          <FaBookOpen className="inline-block w-6 h-6 mr-4"></FaBookOpen>
          <span className="text-lg">Generate Flipbook</span>
        </li>
      </ul>
    </div>
  );
};

export default SideNav;
