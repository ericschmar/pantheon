/*
  ldapParser.ts

  This TypeScript file implements a lexer and parser for an LDAP-like query.
  It reports parsing errors with line and column information indicating where
  the error occurred in the query string. Use the example at the bottom to test.

  Example problematic input: "(&(cn=John Doe)|(sn=Doe)(givenName=John)))"

  Explanation:
  - You are missing one "(" before the "|", so the parser encounters a 'Pipe'
    token where it expects an 'Identifier' for a condition or a sub-expression.
  - The error message will include line and column to help locate the issue.
*/

import { Lexer } from './lexer';

/**
 * Types of tokens the lexer can emit.
 */
export enum TokenType {
  LParen = 'LParen', // (
  RParen = 'RParen', // )
  Ampersand = 'Ampersand', // &
  Pipe = 'Pipe', // |
  Exclamation = 'Exclamation', // !
  Equality = 'Equality', // =
  Identifier = 'Identifier', // attribute or value (including potential spaces)
  EOF = 'EOF',
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
 * Abstract Syntax Tree (AST) node types.
 */
export type LDAPNode =
  | ConjunctionNode
  | DisjunctionNode
  | NegationNode
  | ConditionNode;

export interface ConjunctionNode {
  type: 'Conjunction';
  children: LDAPNode[];
}

export interface DisjunctionNode {
  type: 'Disjunction';
  children: LDAPNode[];
}

export interface NegationNode {
  type: 'Negation';
  child: LDAPNode;
}

export interface ConditionNode {
  type: 'Condition';
  attribute: string;
  value: string;
}

/**
 * Custom error for parser or lexer issues, storing absolute position as well as computed line/column.
 */
export class ParseError extends Error {
  constructor(
    public messageText: string,
    public position: number,
    public line: number,
    public column: number,
  ) {
    // Incorporate line and column info into the error message.
    super(`${messageText} (line ${line}, column ${column})`);
    this.name = 'ParseError';
  }
}

/**
 * The parser consumes tokens from the lexer and constructs an AST.
 */
export class Parser {
  private currentToken: Token;

  constructor(private lexer: Lexer) {
    this.currentToken = this.lexer.nextToken();
  }

  public parse(): LDAPNode {
    // Parse a top-level expression.
    const node = this.parseExpression();

    // Ensure there's no extra input.
    if (this.currentToken.type !== TokenType.EOF) {
      this.throwError(
        'Extra input after valid query',
        this.currentToken.position,
      );
    }
    return node;
  }

  /**
   * Grammar (simplified):
   *   Expression := "(" Operation (Expression)+ ")"
   *               | "(" Expression ")"
   *               | Condition
   *
   *   Operation  := "&" | "|" | "!"
   *   Condition  := attribute "=" value
   */
  private parseExpression(): LDAPNode {
    if (this.currentToken.type === TokenType.LParen) {
      return this.parseGroupOrOperation();
    } else {
      return this.parseCondition();
    }
  }

  private parseGroupOrOperation(): LDAPNode {
    this.eat(TokenType.LParen);

    const startToken = this.currentToken;
    if (
      startToken.type === TokenType.Ampersand ||
      startToken.type === TokenType.Pipe
    ) {
      return this.parseLogicalOperation();
    } else if (startToken.type === TokenType.Exclamation) {
      return this.parseNegation();
    } else {
      // If it's not an operation token, interpret it as a nested sub-expression.
      const expr = this.parseExpression();
      this.eat(TokenType.RParen);
      return expr;
    }
  }

  private parseLogicalOperation(): LDAPNode {
    const opToken = this.currentToken;
    this.advance(); // consume & or |

    const children: LDAPNode[] = [];

    // Continue parsing expressions until we find a closing parenthesis or EOF.
    while (
      this.currentToken.type !== TokenType.RParen &&
      this.currentToken.type !== TokenType.EOF
    ) {
      children.push(this.parseExpression());
    }

    this.eat(TokenType.RParen);

    if (opToken.type === TokenType.Ampersand) {
      return { type: 'Conjunction', children };
    } else {
      return { type: 'Disjunction', children };
    }
  }

  private parseNegation(): LDAPNode {
    // consume "!"
    this.advance();

    // parse the single sub-expression
    const child = this.parseExpression();
    this.eat(TokenType.RParen);

    return { type: 'Negation', child };
  }

  private parseCondition(): LDAPNode {
    // A condition: attribute = value
    const attributeToken = this.currentToken;
    this.eat(TokenType.Identifier);

    this.eat(TokenType.Equality);

    const valueToken = this.currentToken;
    this.eat(TokenType.Identifier);

    return {
      type: 'Condition',
      attribute: attributeToken.text,
      value: valueToken.text,
    };
  }

  /**
   * Expects the current token to match 'type'; if not, throws error with line/column details.
   */
  private eat(type: TokenType): void {
    if (this.currentToken.type === type) {
      this.advance();
    } else {
      this.throwError(
        `Expected token ${type} but found ${this.currentToken.type}`,
        this.currentToken.position,
      );
    }
  }

  /**
   * Fetch the next token from the lexer.
   */
  private advance(): void {
    this.currentToken = this.lexer.nextToken();
  }

  /**
   * Helper to throw a ParseError with line/column info.
   */
  private throwError(message: string, position: number): never {
    const { line, column } = this.lexer.getLineColumn(position);
    throw new ParseError(message, position, line, column);
  }
}

/* ---------------------------------------------------------------------------
   Example usage:
   Uncomment the following lines to test. The input below is missing a "("
   before the "|" symbol, causing a parse error. The error will include line
   and column information.

   const input = "(&(cn=John Doe)|(sn=Doe)(givenName=John)))";
   try {
     const lexer = new Lexer(input);
     const parser = new Parser(lexer);
     const ast = parser.parse();
     console.log(JSON.stringify(ast, null, 2));
   } catch (e) {
     if (e instanceof ParseError) {
       console.error(e.message);
     } else {
       throw e;
     }
   }
*/
