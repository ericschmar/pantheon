export enum TokenType {
  LEFT_PAREN = "LEFT_PAREN",
  RIGHT_PAREN = "RIGHT_PAREN",
  AND = "AND",
  OR = "OR",
  NOT = "NOT",
  EQUALS = "EQUALS",
  IDENTIFIER = "IDENTIFIER",
  VALUE = "VALUE",
  EOF = "EOF",
}

export interface Token {
  type: TokenType;
  value: string;
  start: number;
  end: number;
}

export interface Position {
  start: number;
  end: number;
}

export interface ASTNode extends Position {
  type: string;
  value?: string;
  children?: ASTNode[];
}

export class LDAPSyntaxError extends Error {
  position: number;

  constructor(message: string, position: number) {
    super(`${message} at position ${position}`);
    this.position = position;
  }
}
