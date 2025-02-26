import { tree } from "@/lib/wailsjs/go/models";

export type Tab = {
  id: string;
  title: string;
  data: tree.LDAPEntry;
  selected: boolean;
};

export type TabProps = {
  text: string;
  selected: boolean;
  dismissable: boolean;
  onClick: () => void;
  onClose: () => void;
};
