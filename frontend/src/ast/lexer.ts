/*
  ldapLexer.ts

  This file implements the lexer for an LDAP-like query language in TypeScript.
  It converts an input string into a stream of tokens and reports line/column
  information on errors.

  Usage example (in another file):
    import { Lexer } from './ldapLexer';

    const lexer = new Lexer("(&(cn=John Doe)(|(sn=Doe)(givenName=John)))");
    let token;
    while ((token = lexer.nextToken()).type !== TokenType.EOF) {
      console.log(token);
    }
*/

/**
 * Types of tokens the lexer can emit.
 */
export enum TokenType {
  LParen = "LParen", // (
  RParen = "RParen", // )
  Ampersand = "Ampersand", // &
  Pipe = "Pipe", // |
  Exclamation = "Exclamation", // !
  Equality = "Equality", // =
  Identifier = "Identifier", // attribute or value (including potential spaces)
  EOF = "EOF",
}

/**
 * Token structure.
 */
export interface Token {
  type: TokenType;
  text: string;
  position: number; // character index in the entire input
}

/**
 * Custom error for parser or lexer issues, storing absolute position as well as computed line/column.
 */
export class ParseError extends Error {
  constructor(
    public messageText: string,
    public position: number,
    public line: number,
    public column: number
  ) {
    // Incorporate line and column info into the error message.
    super(`${messageText} (line ${line}, column ${column})`);
    this.name = "ParseError";
  }
}

/**
 * The lexer converts the input string into a stream of tokens.
 * This version allows 'Identifier' to include spaces (e.g. "John Doe")
 * until it hits parentheses, operators, or '='.
 */
export class Lexer {
  private index = 0;
  private length: number;

  constructor(public input: string) {
    this.length = input.length;
  }

  /**
   * Utility to determine line and column from a character index.
   */
  public getLineColumn(charIndex: number): { line: number; column: number } {
    const textUpToIndex = this.input.slice(0, charIndex);
    const lines = textUpToIndex.split(/\r?\n/);
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1; // 1-based column
    return { line, column };
  }

  /**
   * Fetches the next token from the input.
   */
  public nextToken(): Token {
    this.skipWhitespace();

    if (this.index >= this.length) {
      return { type: TokenType.EOF, text: "", position: this.index };
    }

    const char = this.input[this.index];
    const position = this.index;

    switch (char) {
      case "(":
        this.index++;
        return { type: TokenType.LParen, text: "(", position };
      case ")":
        this.index++;
        return { type: TokenType.RParen, text: ")", position };
      case "&":
        this.index++;
        return { type: TokenType.Ampersand, text: "&", position };
      case "|":
        this.index++;
        return { type: TokenType.Pipe, text: "|", position };
      case "!":
        this.index++;
        return { type: TokenType.Exclamation, text: "!", position };
      case "=":
        this.index++;
        return { type: TokenType.Equality, text: "=", position };
      default:
        return this.readIdentifier();
    }
  }

  /**
   * Skip over whitespace characters.
   */
  private skipWhitespace(): void {
    while (this.index < this.length && /\s/.test(this.input[this.index])) {
      this.index++;
    }
  }

  /**
   * Reads an identifier (attribute or value) until encountering a special character: ( ) & | ! =
   * Allows internal spaces so that values like "John Doe" are recognized as one token.
   */
  private readIdentifier(): Token {
    const start = this.index;
    while (
      this.index < this.length &&
      !/[()&|!=]/.test(this.input[this.index])
    ) {
      this.index++;
    }

    const raw = this.input.slice(start, this.index);
    const text = raw.trim();

    if (!text) {
      const { line, column } = this.getLineColumn(start);
      throw new ParseError(
        `Unexpected character '${this.input[start]}'`,
        start,
        line,
        column
      );
    }

    return {
      type: TokenType.Identifier,
      text,
      position: start,
    };
  }
}
