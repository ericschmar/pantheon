import { useEffect, useState, useTransition } from "react";
import {
  GetCredentials,
  Connect,
  DeleteCredential,
  TestConnection,
} from "../lib/wailsjs/go/main/App";
import { services } from "@/lib/wailsjs/go/models";
import Button from "@/components/button";
import {
  CheckCircle,
  CircleCheck,
  Command,
  LoaderCircle,
  TestTube,
  Trash,
  Unplug,
  XCircle,
} from "lucide-react";
import TextInput from "@/components/input";
import ToggleButton from "@/components/toggle-button";
import { proxy, useSnapshot } from "valtio";
import { navigate } from "wouter/use-hash-location";
import { useHotkeys } from "react-hotkeys-hook";

const state = proxy({
  name: "Testing",
  host: "ldap.forumsys.com",
  username: "",
  password: "",
  base_dn: "dc=example,dc=com",
  port: "389",
  key: "", // empty for new connections
  is_favorited: true,
});

function ConnectPage() {
  const [loading, startTransition] = useTransition();
  const [isConnectionValid, setIsConnectionValid] = useState<boolean | null>(
    null
  );
  const [credentials, setCredentials] = useState<services.LdapConn[]>([]);
  useHotkeys(
    ["ctrl+enter", "meta+enter"],
    () => {
      connect();
    },
    []
  );

  useEffect(() => {
    startTransition(async () => {
      const creds = await GetCredentials();
      console.log("creds", creds);
      setCredentials(creds);
    });
  }, []);

  function connect() {
    console.log("connect");
    startTransition(async () => {
      console.log(state);
      const result = await Connect(state);
      console.log("result", result);
      navigate("/search");
    });
  }

  function delete_connection(key: string) {
    console.log("delete");
    startTransition(async () => {
      const result = await DeleteCredential(key);
      console.log("result", result);

      const creds = await GetCredentials();
      console.log("creds", creds);
      setCredentials(creds);
    });
  }

  function test_connection() {
    startTransition(async () => {
      const result = await TestConnection(state);
      console.log("result", result);
      if (result === "") setIsConnectionValid(true);
      else setIsConnectionValid(false);
    });
  }

  const snapshot = useSnapshot(state);
  return (
    <div className="flex flex-col justify-center h-full min-w-[70%] mx-auto">
      <div className="w-full relative grid grid-cols-16 gap-3">
        <div className="col-span-8 border-r border-gray-200 pr-2">
          <h2 className="text-left font-lora text-pretty h2 text-accent-blue dark:text-blue-300 font-medium text-lg pl-2 pb-2">
            ️⭐ Favorites
          </h2>
          {credentials === null || credentials.length === 0 ? (
            <>
              <p className="text-xs text-offgray-600">
                Create a new connection and add it to your favorites.
              </p>
            </>
          ) : (
            <></>
          )}
          <div className="flex flex-col overflow-y-auto">
            {credentials.map((cred) => (
              <div className="mb-4 w-[98%] h-full border flex flex-row place-content-between items-center default-border-color rounded-sm p-2.5 bg-white/60 dark:bg-offgray-800/8 shadow-[6px_6px_0_hsla(219,_93%,_42%,_0.06)] dark:shadow-[5px_5px_0_hsla(219,_90%,_60%,_0.08)]">
                <div className="flex flex-col gap-2">
                  <p className="font-bold text-sm tracking-wide">
                    {cred.name == "" ? "<unnamed>" : cred.name}
                  </p>
                  <div className="flex flex-row">
                    <p className="text-sm tracking-wider">
                      {cred.host + ":" + cred.port}
                    </p>
                  </div>
                </div>
                <div className="flex flex-row gap-2">
                  <Button
                    variant="light"
                    onClick={() => {
                      state.base_dn = cred.base_dn;
                      state.port = cred.port;
                      state.host = cred.host;
                      state.username = cred.username;
                      state.password = cred.password;
                      connect();
                    }}
                  >
                    <Unplug size={13} />
                  </Button>
                  <Button
                    variant="light"
                    onClick={() => delete_connection(cred.key)}
                  >
                    <Trash size={13} color="red" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-8">
          <div className="mb-4 w-[98%] border default-border-color rounded-sm p-2.5 bg-white/60 dark:bg-offgray-800/8 shadow-[6px_6px_0_hsla(219,_93%,_42%,_0.06)] dark:shadow-[5px_5px_0_hsla(219,_90%,_60%,_0.08)]">
            <div className="flex flex-col gap-2 p-4">
              <h2 className="text-left font-lora text-pretty h2 text-accent-blue dark:text-blue-300 font-medium text-lg pl-2">
                🔌 New Connection
              </h2>
              <TextInput
                label="connection name"
                placeholder="My Connection"
                value={snapshot.name}
              />
              <TextInput
                label="host"
                placeholder="ldap.place.com"
                value={snapshot.host}
              />
              <TextInput
                label="username"
                placeholder="username"
                value={snapshot.username}
              />
              <TextInput label="password" isPassword />
              <TextInput
                label="base dn"
                placeholder="dc=example,dc=com"
                value={snapshot.base_dn}
              />
              <div className="flex flex-row gap-4 items-center">
                <div className="flex min-w-24">
                  <ToggleButton>
                    <CircleCheck size={18} />
                    Use TLS
                  </ToggleButton>
                </div>
                <TextInput
                  label="port"
                  placeholder="389"
                  value={snapshot.port}
                />
              </div>
              <div className="flex flex-row gap-3 place-content-end pt-6">
                <ToggleButton
                  onClick={() => (state.is_favorited = !state.is_favorited)}
                  active={state.is_favorited}
                >
                  ⭐
                </ToggleButton>
                <Button variant="light" onClick={() => test_connection()}>
                  {isConnectionValid === null ? (
                    <TestTube size={13} color="gray" />
                  ) : isConnectionValid ? (
                    <CheckCircle size={13} color="green" />
                  ) : (
                    <XCircle size={13} color="red" />
                  )}
                  <p className="text-xs">Test Connection</p>
                </Button>
                <Button variant="active" onClick={() => connect()}>
                  {loading ? (
                    <LoaderCircle
                      size={13}
                      color="white"
                      className="animate-spin"
                    />
                  ) : (
                    <Unplug size={13} color="white" />
                  )}
                  <p className="text-xs">Connect</p>
                  <kbd className="h-5 px-1.5 max-w-max rounded-xs flex items-center gap-0.5 text-[.6875rem] font-bold text-gray-500 dark:text-gray-300 border border-gray-500/20 dark:border-offgray-400/10 bg-gray-50/50 dark:bg-cream-900/10 hidden sm:flex bg-white/10! border-white/20! text-white!">
                    <Command
                      size={10}
                      className="stroke-white dark:stroke-gray-300"
                    />
                    Enter
                  </kbd>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ConnectPage;
