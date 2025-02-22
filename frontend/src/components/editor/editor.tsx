import useWindowDimensions from "@/hooks/useWindowDimensions";
import CodeMirror from "@uiw/react-codemirror";
import { createTheme } from "@uiw/codemirror-themes";
import { tags as t } from "@lezer/highlight";

const CustomEditor = ({
  code,
  setCode,
}: {
  code: string;
  setCode: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const { height } = useWindowDimensions();
  const lightTheme = createTheme({
    theme: "light",
    settings: {
      background: "var(--color-cream-50)",
      backgroundImage: "",
      foreground: "#75baff",
      caret: "#5d00ff",
      selection: "#036dd626",
      selectionMatch: "#036dd626",
      lineHighlight: "#8a91991a",
      gutterBackground: "#fff",
      gutterForeground: "#8a919966",
    },
    styles: [
      { tag: t.comment, color: "var(--color-offgray-200)" },
      { tag: t.variableName, color: "var(--color-accent-blue)" },
      {
        tag: [t.string, t.special(t.brace)],
        color: "var(--color-offgray-400)",
      },
      { tag: t.number, color: "var(--color-accent-blue)" },
      { tag: t.bool, color: "var(--color-accent-blue)" },
      { tag: t.keyword, color: "var(--color-accent-blue)" },
      { tag: t.operator, color: "var(--color-offgray-200)" },
      { tag: t.tagName, color: "var(--color-offgray-200)" },
      { tag: t.attributeName, color: "var(--color-accent-blue)" },
    ],
  });

  return (
    <CodeMirror
      value={code}
      onChange={setCode}
      theme="light"
      height={`${height * 0.32}px`}
      basicSetup
      style={{
        width: "98%",
        paddingBottom: "1rem",
        borderRadius: "8px",
      }}
    />
  );
};

export default CustomEditor;
