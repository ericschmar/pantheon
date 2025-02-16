import {
  Caption1,
  Tag,
  Tree,
  TreeItem,
  TreeItemLayout,
} from "@fluentui/react-components";
import { useEffect, useState, useTransition } from "react";
import { GetEntries } from "../lib/wailsjs/go/main/App";
import { tree } from "@/lib/wailsjs/go/models";
import { state } from "@/state/tab-state";

function TreeView() {
  const [loading, startTransition] = useTransition();
  const [entries, setEntries] = useState<tree.Tree>({} as tree.Tree);

  const ColorMapping: { [key: string]: string } = {
    dc: "var(--colorPaletteAnchorForeground2)",
    dcText: "white",
    cn: "var(--colorPalettePlatinumForeground2)",
    cnText: "white",
    ou: "var(--colorPalettePlatinumBorderActive)",
    ouText: "white",
    uid: "var(--colorPalettePlatinumBackground2)",
    uidText: "black",
  };

  useEffect(() => {
    startTransition(async () => {
      const t = await GetEntries();
      setEntries(t);
    });
  }, []);

  const TreeComponent = ({ root }: { root: tree.TreeNode | undefined }) => {
    if (!root) return null;
    const children = root.children || [];
    const entry = root.entry;
    const childName = entry?.dn.split(",")[0] ?? "";
    const qualifier = childName.split("=")[0];
    const value = childName.split("=")[1];

    return children.length > 0 ? (
      <TreeItem itemType="branch">
        <TreeItemLayout style={{ minHeight: "8px" }}>
          <Tag
            size="small"
            style={{
              backgroundColor: ColorMapping[qualifier],
              color: ColorMapping[qualifier + "Text"],
            }}
          >
            {value}
            <Caption1>{" [" + qualifier + "]"}</Caption1>
          </Tag>
        </TreeItemLayout>
        <Tree>
          {children.map((childNode) => (
            <TreeComponent key={childNode.id} root={childNode} />
          ))}
        </Tree>
      </TreeItem>
    ) : (
      <TreeItem itemType="leaf">
        <TreeItemLayout
          style={{ minHeight: "8px" }}
          onClick={() => {
            state.addTab({
              id: value,
              title: value,
              data: entry ?? ({} as tree.LDAPEntry),
            });
          }}
        >
          <Tag
            size="small"
            style={{
              backgroundColor: ColorMapping[qualifier],
              color: ColorMapping[qualifier + "Text"],
            }}
          >
            {value}
            <Caption1>{" [" + qualifier + "]"}</Caption1>
          </Tag>
        </TreeItemLayout>
      </TreeItem>
    );
  };

  return loading ? (
    <></>
  ) : (
    <Tree
      appearance="transparent"
      style={{
        width: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        height: "100%",
      }}
    >
      <TreeComponent root={entries.Root?.children[0]} />
    </Tree>
  );
}

export default TreeView;
