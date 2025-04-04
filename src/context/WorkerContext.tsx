import React, {
  createContext,
  useContext,
  useRef,
  useEffect,
  useState,
} from "react";

interface WorkerContextType {
  worker: Worker | null;
  isInitialized: boolean;
  error: string | null;
  sendMessage: (message: { command: string; data: any }) => Promise<any>;
}

const WorkerContext = createContext<WorkerContextType | null>(null);

export function WorkerProvider({ children }: { children: React.ReactNode }) {
  const workerRef = useRef<Worker | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      workerRef.current = new Worker(
        new URL("../workers/pyodide.worker.ts", import.meta.url),
        { type: "module" }
      );

      // Set up message handler
      workerRef.current.onmessage = async (event) => {
        if (
          event.data.type === "success" &&
          event.data.data === "Initialization complete"
        ) {
          setIsInitialized(true);
        }
      };

      // Set up error handler
      workerRef.current.onerror = (err: ErrorEvent) => {
        setError(err.message);
      };

      // Initialize Pyodide
      workerRef.current.postMessage({ command: "init" });
    } catch (err) {
      setError(
        `Worker initialization error: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }

    // Clean up worker on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const sendMessage = (message: {
    command: string;
    data: any;
  }): Promise<any> => {
    if (!workerRef.current) {
      setError("Worker not initialized");
      return Promise.reject("Worker not initialized");
    }
    const worker = workerRef.current;
    return new Promise((resolve, reject) => {
      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === "success") {
          worker.removeEventListener("message", messageHandler);
          resolve(event.data.data);
        } else if (event.data.type === "error") {
          worker.removeEventListener("message", messageHandler);
          reject(event.data.error);
        }
      };
      worker.addEventListener("message", messageHandler);
      worker.postMessage(message);
    });
  };

  return (
    <WorkerContext.Provider
      value={{ worker: workerRef.current, isInitialized, error, sendMessage }}
    >
      {children}
    </WorkerContext.Provider>
  );
}

export function useWorker() {
  const context = useContext(WorkerContext);
  if (!context) {
    throw new Error("useWorker must be used within a WorkerProvider");
  }
  return context;
}
