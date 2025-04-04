import { useState } from "react";

interface TabPanelProps {
  tabs: {
    label: string | React.ReactNode;
    content: React.ReactNode;
  }[];
  hideBorder?: boolean;
}

export function TabPanel({ tabs, hideBorder = false }: TabPanelProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="h-full flex flex-col">
      <div className="flex tabs">
        {tabs.map((tab, index) => (
          <div
            key={typeof tab.label === "string" ? tab.label : index}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-2 tab ${
              activeTab === index
                ? "border-primary text-primary"
                : "border-transparent"
            } ${hideBorder ? "border-b-0" : "border-b-2"}`}
          >
            {tab.label}
          </div>
        ))}
      </div>
      <div className="h-full overflow-auto p-4">{tabs[activeTab].content}</div>
    </div>
  );
}
