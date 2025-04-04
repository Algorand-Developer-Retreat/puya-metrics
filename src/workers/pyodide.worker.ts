// @ts-ignore
import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v0.27.4/full/pyodide.mjs";
import { PyodideInterface } from "pyodide";

declare const self: Worker & typeof globalThis;

let iPyodide: PyodideInterface;
let pyFuncs: any;

async function initializePyodide(): Promise<void> {
  console.log("Initializing Pyodide");
  iPyodide = await loadPyodide();
  await iPyodide.loadPackage("micropip");

  // Load Pyodide using dynamic import
  const micropip = iPyodide.pyimport("micropip");
  await micropip.install(
    "https://storage.googleapis.com/puya-metrics/puyapy-4.6.1.6-py3-none-any.whl",
    { keep_going: true }
  );

  // Run the Python code
  const response = await fetch("compile_contract.py");
  const pythonScript = await response.text();
  pyFuncs = iPyodide.runPython(pythonScript);

  console.log("Pyodide initialization complete");
}

// Handle messages from the main thread
self.onmessage = async (e) => {
  if (e.data && e.data.command === "init") {
    try {
      await initializePyodide();
      self.postMessage({ type: "success", data: "Initialization complete" });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      self.postMessage({ type: "error", error: errorMessage });
    }
  }
  if (e.data && e.data.command === "compile") {
    if (!iPyodide) {
      self.postMessage({
        type: "error",
        error: "Pyodide not initialized. Please call init first.",
      });
      return;
    }

    try {
      console.log("Compiling code");
      console.log({ code: e.data.data });
      const result = pyFuncs.compileContract(e.data.data);
      self.postMessage({ type: "success", data: JSON.parse(result) });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      self.postMessage({ type: "error", error: errorMessage });
    }
  }
};
