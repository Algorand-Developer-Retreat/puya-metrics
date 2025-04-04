import { useState } from "react";
import InputPanel from "./components/InputPanel";
import OutputPanel from "./components/OutputPanel";
import { HiLightningBolt } from "react-icons/hi";
import { WorkerProvider, useWorker } from "./context/WorkerContext";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import logo from "./assets/algokit-logomark-color.png";
import { Metrics } from "./components/MetricsPanel";

function AppContent() {
  const [inputContent, setInputContent] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [outputContent, setOutputContent] = useState<{
    approval: string;
    clear: string;
    metrics?: Metrics;
  }>({ approval: "", clear: "" });
  const { sendMessage, isInitialized } = useWorker();

  const handleCompile = async () => {
    try {
      setIsCompiling(true);
      const result = await sendMessage({
        command: "compile",
        data: inputContent,
      });
      setOutputContent(result);
    } catch (error) {
      console.error("Compilation error:", error);
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="navbar bg-base-100 shadow-lg">
        <div className="navbar-start flex items-center gap-2 h-[48px]">
          <div className="h-full overflow-hidden">
            <img src={logo} className="h-full w-full scale-[2] " alt="logo" />
          </div>
          <div className="text-xl font-bold">Compiler</div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          <Panel style={{ width: "50%" }} className="overflow-hidden">
            <InputPanel onChange={setInputContent} />
          </Panel>
          <PanelResizeHandle className="w-[2px] bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center">
            <button
              className="btn p-0 z-100000 absolute"
              onClick={handleCompile}
              disabled={!isInitialized}
            >
              {isCompiling ? (
                <div className="loading loading-spinner loading-lg" />
              ) : (
                <HiLightningBolt />
              )}
            </button>
          </PanelResizeHandle>
          <Panel className="overflow-hidden">
            <OutputPanel
              approval={outputContent.approval}
              clear={outputContent.clear}
              metrics={outputContent.metrics}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

function App() {
  return (
    <WorkerProvider>
      <AppContent />
    </WorkerProvider>
  );
}

export default App;
