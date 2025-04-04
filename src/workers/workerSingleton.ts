import { PyodideInterface } from "pyodide";

let worker: Worker | null = null;
let isInitialized = false;

export function getWorker() {
  if (!worker) {
    worker = new Worker(new URL("./pyodide.worker.ts", import.meta.url), {
      type: "module",
    });

    // Initialize Pyodide
    worker.postMessage({ command: "init" });

    // Set up message handler for initialization
    worker.onmessage = (event) => {
      if (
        event.data.type === "success" &&
        event.data.data === "Initialization complete"
      ) {
        isInitialized = true;
      }
    };
  }
  return { worker, isInitialized };
}

export function terminateWorker() {
  if (worker) {
    worker.terminate();
    worker = null;
    isInitialized = false;
  }
}
