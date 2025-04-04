import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export interface Metrics {
  compilation_time_seconds: number;
  approval_size_kb: number;
  approval_size_no_comments_kb: number;
  num_teal_ops: number;
}

interface MetricsPanelProps {
  metrics?: Metrics;
}

export function MetricsPanel({ metrics }: MetricsPanelProps) {
  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        No metrics available. Compile your code to see metrics.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <PanelGroup direction="vertical" className="flex-1">
        <Panel>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm text-gray-400">Compilation Time</h3>
                <p className="text-xl font-bold">
                  {metrics.compilation_time_seconds}s
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm text-gray-400">Approval Size</h3>
                <p className="text-xl font-bold">
                  {metrics.approval_size_kb} KB
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm text-gray-400">
                  Approval Size (No Comments)
                </h3>
                <p className="text-xl font-bold">
                  {metrics.approval_size_no_comments_kb} KB
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm text-gray-400">TEAL Operations</h3>
                <p className="text-xl font-bold">{metrics.num_teal_ops}</p>
              </div>
            </div>
          </div>
        </Panel>
        <PanelResizeHandle className="h-1 bg-gray-600 hover:bg-gray-500 transition-colors" />
        <Panel>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Detailed Analysis</h3>
            <div className="space-y-2">
              <p>
                Compilation completed in {metrics.compilation_time_seconds}{" "}
                seconds
              </p>
              <p>The approval program size is {metrics.approval_size_kb} KB</p>
              <p>
                The approval program size without comments is{" "}
                {metrics.approval_size_no_comments_kb} KB
              </p>
              <p>Total TEAL operations: {metrics.num_teal_ops}</p>
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
