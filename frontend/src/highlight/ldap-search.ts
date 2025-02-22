import {
  continuedIndent,
  indentNodeProp,
  foldNodeProp,
  foldInside,
  LRLanguage,
  LanguageSupport,
} from "@codemirror/language";
import { parser } from "./ldap-search.grammer";

/**
 * A language provider for LDAP search queries.
 */
export const ldapLanguage = LRLanguage.define({
  name: "ldap",
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        // Example: increase indent level when inside parentheses
        ParenthesizedFilter: continuedIndent(),
      }),
      foldNodeProp.add({
        // Fold a filter node by hiding its contents
        Filter: foldInside,
      }),
    ],
  }),
  languageData: {
    // Adjust comment tokens to your needs
    commentTokens: { block: { open: "/*", close: "*/" }, line: "//" },
    // Adjust indentation rules to close parentheses
    indentOnInput: /^\s*\)$/,
    wordChars: "_-",
  },
});

/**
 * Basic completion source for LDAP filters, providing suggestions for
 * common attributes or keywords. You can customize this as needed.
 */
export function ldapCompletionSource(context: any) {
  // Simple example returning static attribute suggestions.
  return {
    from: context.pos,
    options: [
      { label: "objectClass", type: "keyword" },
      { label: "cn", type: "keyword" },
      { label: "sn", type: "keyword" },
      { label: "mail", type: "keyword" },
    ],
  };
}

/**
 * Language support for LDAP, exposing both the language
 * and completion behavior.
 */
export function ldap() {
  return new LanguageSupport(
    ldapLanguage,
    ldapLanguage.data.of({
      autocomplete: ldapCompletionSource,
    })
  );
}
