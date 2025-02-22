import { ArrowUp, Command, Search } from "lucide-react";
import { Link, Route, Router, Switch } from "wouter";
import { navigate, useHashLocation } from "wouter/use-hash-location";
import SearchPage from "@/pages/search";
import { useEffect } from "react";
import ConnectPage from "@/pages/connect";

function App() {
  useEffect(() => {
    navigate("/connect");
  });

  return (
    <>
      <div className="relative flex min-h-screen w-screen flex-col flex-none  overflow-hidden">
        <header className="sticky top-0 z-20 h-[44px] nav-background w-full max-w-full flex items-center border-b grid-border-color">
          <div className="w-full relative mx-5 flex border-l grid-border-color items-center place-content-between">
            <h2 className="font-lora text-pretty h2 text-accent-blue dark:text-blue-300 font-medium text-lg text-center pl-2">
              ️🏛 Pantheon
            </h2>
            <button className="group select-none text-sm tracking-tight rounded-sm flex gap-2 items-center justify-center text-nowrap border transition-colors duration-75 fv-style disabled:opacity-50 disabled:cursor-not-allowed text-black dark:text-offgray-50 border-transparent hover:bg-offgray-100/50 dark:hover:bg-offgray-500/10 h-8 px-2.5 px-1!">
              <Search
                size={15}
                className="size-[15px] stroke-gray-500 dark:stroke-gray-300"
              />
              <kbd className="h-5 px-1.5 max-w-max rounded-xs flex items-center gap-0.5 text-[.6875rem] font-bold text-gray-500 dark:text-gray-300 border border-gray-500/20 dark:border-offgray-400/10 bg-gray-50/50 dark:bg-cream-900/10 !px-1">
                <Command
                  size={10}
                  className="stroke-gray-500 dark:stroke-gray-300"
                />
                <ArrowUp
                  size={10}
                  className="stroke-gray-500 dark:stroke-gray-300"
                />
                P
              </kbd>
            </button>
            <div className="absolute h-2 w-2 z-10 rounded-[1px] rotate-45 border border-blue-200 dark:border-blue-300/25 bg-white dark:bg-black left-[-4.5px] bottom-[-9.5px]"></div>
          </div>
        </header>
        <div className="flex flex-row gap-3 w-full h-full my-auto overflow-hidden">
          <Router hook={useHashLocation}>
            <Switch>
              <Route path="/connect" component={ConnectPage} />
              <Route path="/search" component={SearchPage} />
            </Switch>
          </Router>
        </div>
      </div>
    </>
  );
}

export default App;
