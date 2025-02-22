import { Lexer } from "@/ast/lexer";
import { Parser } from "@/ast/parser";
import Button from "@/components/button";
import CustomEditor from "@/components/editor/editor";
import TabViewer from "@/components/tab-viewer/tab-viewer";
import TreeView from "@/components/tree-viewer";
import { SearchIcon, Command, CornerDownLeft } from "lucide-react";
import { useEffect, useState } from "react";

const SearchPage = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (code === "") {
      setError("");
      return;
    }
    try {
      const lexer = new Lexer(code);
      const parser = new Parser(lexer);
      const ast = parser.parse();
      setError("");
    } catch (e) {
      console.error(e.message);
      setError(e.message);
    }
  }, [code]);
  return (
    <div className="w-full relative grid grid-cols-16 gap-1">
      <div className="col-span-5 max-w-5xl">
        <div className="mx-5 grow border-l grid-border-color h-full pl-3 pt-3">
          <TreeView />
        </div>
      </div>
      <div className="flex flex-col col-span-11 pt-[0.6rem] pl-[0.3rem] pr-[0.3rem] h-full overflow-hidden">
        <TabViewer />
        <div className="w-full h-full overflow-hidden">
          <CustomEditor code={code} setCode={setCode} />
          <div className="flex flex-row align-middle">
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button
              onClick={() => null}
              variant="active"
              className="ml-auto mr-4"
            >
              <SearchIcon
                size={10}
                className="stroke-white dark:stroke-gray-300"
              />
              Search
              <kbd className="h-5 px-1.5 max-w-max rounded-xs flex items-center gap-0.5 text-[.6875rem] font-bold text-gray-500 dark:text-gray-300 border border-gray-500/20 dark:border-offgray-400/10 bg-gray-50/50 dark:bg-cream-900/10 hidden sm:flex bg-white/10! border-white/20! text-white!">
                <Command
                  size={10}
                  className="stroke-white dark:stroke-gray-300"
                />
                <CornerDownLeft
                  size={10}
                  className="stroke-white dark:stroke-gray-300"
                />
                P
              </kbd>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
