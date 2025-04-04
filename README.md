# Puya Metrics

Puya Metrics is a web app that allows you to write python smart contracts and see the compiled TEAL code in the browser with metrics. This is meant as an analysis tool to get information on the output of the puya compiler.

## Features

- 🚀 Puya Compiler in WASM using Pyodide
- 📝 Integrated code editor with Python syntax highlighting
- 📊 Instant Feedback for code metrics and analysis

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/puya-metrics.git
cd puya-metrics
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## How it's built

[Pyiodide](https://pyodide.org/en/stable/) is a tool that compile python code down to WebAssembly. Pyiodide was used to bundle [puya](https://github.com/algorandfoundation/puya) and puyapy.

### Changes made to the puya

- pycryptodomex was changed for pycryptodome - PyIodide has dependencies that are built specifically for pyiodide. Pycryptodomex was not was of the them, but pycryptodome was. They are interchangeable. The difference is that pycryptodomex was meant to live alongside the "Crpyto" namespace.
- You can't run subprocesses in PyIodide - Pyiodide creates a virtual filesystem where python runs, but it can't run system commands. Puya has subprocess to get a python prefix for running the compile command. This prefix had to be hard-coded.

### Setting up the web worker

#### Web worker init

```typescript
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
```

#### Compiling Smart contract in python

```python
# Set up command line arguments
sys.argv = ["puyapy", filename]

# Before run_module
start_time = time.time()
runpy.run_module("puyapy", run_name="__main__")
compilation_time = time.time() - start_time
```
