import { styleTags, tags as t } from "@lezer/highlight";

export const ldapHighlighting = styleTags({
  // Example mappings from parse node names or tokens to highlighting tags.
  // Adjust or expand these to match your actual parse tree node types.
  "AndFilter OrFilter NotFilter": t.operatorKeyword,
  "Presence Equality Substring": t.keyword,
  Attribute: t.attributeName,
  Value: t.string,
  // Parentheses for filters
  "( )": t.paren,
  // Wildcard symbol
  "*": t.modifier,
  // Comparison operator
  "=": t.compareOperator,
  // Logical operators
  "& | !": t.logicOperator,
  // Comments
  "Comment LineComment": t.blockComment,
});
