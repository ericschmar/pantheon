import { Lexer } from "@/ast/lexer";
import { Parser } from "@/ast/parser";
import Button from "@/components/button";
import CustomEditor from "@/components/editor/editor";
import TabViewer from "@/components/tab-viewer/tab-viewer";
import TreeView from "@/components/tree-viewer";
import { Search } from "@/lib/wailsjs/go/main/App";
import { SearchIcon, Command, ArrowUp, LoaderCircle } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

const SearchPage = () => {
  const [code, setCode] = useState("((objectClass=*))");
  const [error, setError] = useState<string | null>(null);
  const [percentageHeight, setPercentageHeight] = useState(0.35);
  const [loading, startTransition] = useTransition();
  useHotkeys(
    ["ctrl+shift+enter", "meta+shift+enter"],
    () => {
      search();
    },
    { enableOnContentEditable: true }
  );
  useEffect(() => {
    if (code === "") {
      setError("");
      return;
    }
  }, [code]);

  const onLayout = (sizes: number[]) => {
    console.log(sizes);
    setPercentageHeight((sizes[1] - 17) / 100);
  };

  function search() {
    console.log("search");
    startTransition(async () => {
      try {
        const lexer = new Lexer(code);
        const parser = new Parser(lexer);
        const ast = parser.parse();
        setError("");

        const results = await Search(code);
        console.log(results);
      } catch (ex) {
        console.log(ex);
        setError(ex.message);
      }
    });
  }

  return (
    <div className="w-full h-screen grid grid-cols-16 gap-1">
      <div className="col-span-5 h-screen">
        <div className="mx-5 grow border-l grid-border-color h-screen pl-3 pt-3">
          <TreeView />
        </div>
      </div>
      <div className="flex flex-col col-span-11 h-full pt-[0.6rem] pl-[0.3rem] pr-[0.3rem] overflow-hidden">
        <PanelGroup direction="vertical" onLayout={onLayout}>
          <Panel maxSize={66} defaultSize={66}>
            <TabViewer />
          </Panel>
          <PanelResizeHandle className="py-2" />
          <Panel maxSize={45} defaultSize={35}>
            <CustomEditor
              code={code}
              setCode={setCode}
              percentageHeight={percentageHeight}
            />
            <div className="flex flex-row align-middle">
              {error && <p className="text-xs text-red-500">{error}</p>}
              <Button
                onClick={() => search()}
                variant="active"
                className="ml-auto mr-4"
              >
                {loading ? (
                  <LoaderCircle size={10} className="animate-spin" />
                ) : (
                  <SearchIcon
                    size={10}
                    className="stroke-white dark:stroke-gray-300"
                  />
                )}
                Search
                <kbd className="h-5 px-1.5 max-w-max rounded-xs flex items-center gap-0.5 text-[.6875rem] font-bold text-gray-500 dark:text-gray-300 border border-gray-500/20 dark:border-offgray-400/10 bg-gray-50/50 dark:bg-cream-900/10 hidden sm:flex bg-white/10! border-white/20! text-white!">
                  <Command
                    size={10}
                    className="stroke-white dark:stroke-gray-300"
                  />
                  <ArrowUp
                    size={10}
                    className="stroke-white dark:stroke-gray-300"
                  />
                  Enter
                </kbd>
              </Button>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

export default SearchPage;
