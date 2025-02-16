export type DTree = {
  entry: {
    DN: string;
    Attributes: {
      [key: string]: string[];
    };
    Children: DTree[];
  };
};
