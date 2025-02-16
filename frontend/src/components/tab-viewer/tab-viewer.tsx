import styles from "./styles.module.css";
import { Tag, Text } from "@fluentui/react-components";
import { state } from "@/state/tab-state";
import { DismissRegular } from "@fluentui/react-icons";
import { useValtio } from "use-valtio";
import { tree } from "@/lib/wailsjs/go/models";
import { useEffect } from "react";

const TabViewer = () => {
  const { tabs, selectedTabId } = useValtio(state);

  return (
    <div className={styles.container}>
      <div className={styles.bar}>
        {tabs.map((tab, idx) => (
          <Tag
            className={styles.tab}
            key={tab.id}
            dismissible={selectedTabId === idx && tab.id !== "1"}
            dismissIcon={
              <DismissRegular
                className={styles.dismiss}
                onClick={() => {
                  state.deleteTab(idx);
                }}
              />
            }
            size="small"
            style={{
              border: `${
                selectedTabId === idx
                  ? "1px solid var(--colorNeutralBackgroundStatic)"
                  : "none"
              }`,
            }}
            onClick={() => (state.selectedTabId = idx)}
          >
            {tab.title === "" ? (
              <Text
                italic
                size={100}
                style={{
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                empty
              </Text>
            ) : (
              <Text
                size={100}
                style={{
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                {tab.title}
              </Text>
            )}
          </Tag>
        ))}
      </div>
      <div className={styles.viewer}>{tabs[selectedTabId]?.title}</div>
    </div>
  );
};

export default TabViewer;
