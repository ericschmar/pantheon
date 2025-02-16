import { tree } from "@/lib/wailsjs/go/models";

export type Tab = {
  id: string;
  title: string;
  data: tree.LDAPEntry;
};
