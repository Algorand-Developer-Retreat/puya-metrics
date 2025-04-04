import ApprovalProgramTab from "./ApprovalProgramTab";
import ClearProgramTab from "./ClearProgramTab";
import { MetricsPanel, Metrics } from "./MetricsPanel";
import { TabPanel } from "./TabPanel";

export default function OutputPanel({
  approval,
  clear,
  metrics,
}: {
  approval: string;
  clear: string;
  metrics?: Metrics;
}) {
  return (
    <div
      className="h-full w-full bg-gray-800 flex flex-col"
      style={{ backgroundColor: "#222222" }}
    >
      <TabPanel
        tabs={[
          {
            label: "Approval Program",
            content: <ApprovalProgramTab approval={approval} />,
          },
          {
            label: "Clear Program",
            content: <ClearProgramTab clear={clear} />,
          },
          {
            label: "Metrics",
            content: <MetricsPanel metrics={metrics} />,
          },
        ]}
      />
    </div>
  );
}
