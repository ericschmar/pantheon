export type Tree = {
  name: string;
  nodes: Tree[];
  payload: {
    [key: string]: string[];
  } | null;
};

export type TreeReturn = {
  Root: Tree;
};
