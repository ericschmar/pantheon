/**
 * An improved function to format an LDAP-like query string for better readability.
 *
 * This version corrects the indentation for closing parentheses and places
 * operators (&, |, !) properly to match the style:
 *
 * Example Input:
 * (&(cn=John Doe)(|(sn=Doe)(givenName=John)))
 *
 * Example Desired Output:
 * (
 *     & (cn=John Doe)
 *         (
 *             | (sn=Doe)
 *                 (givenName=John)
 *         )
 * )
 */

export function formatQuery(query: string): string {
  let formatted = "";
  let indentLevel = 0;
  const indentSize = 4; // Number of spaces for each indentation level

  function writeNewLineAndIndent() {
    formatted += "\n" + " ".repeat(indentLevel * indentSize);
  }

  for (let i = 0; i < query.length; i++) {
    const char = query[i];

    switch (char) {
      case "(":
        // Write the '(' on a new line at the current indent
        writeNewLineAndIndent();
        formatted += "(";
        // Increase indent after '('
        indentLevel++;
        break;

      case ")":
        // Decrease indent before writing ')', so the close paren lines up
        indentLevel--;
        writeNewLineAndIndent();
        formatted += ")";
        break;

      case "&":
      case "|":
      case "!":
        // Put operators on a new line (same indent as the current level)
        writeNewLineAndIndent();
        formatted += char;
        break;

      default:
        // For regular characters (like attribute names, etc.), just append
        formatted += char;
        break;
    }
  }

  // Trim leading/trailing empty lines/spaces
  return formatted.trim();
}

/* ---------------------------------------------------------------------------
   Example usage (uncomment to test):

   const input = "(&(cn=John Doe)(|(sn=Doe)(givenName=John)))";
   const formatted = formatLdapQuery(input);
   console.log(formatted);

   // Expected output:
   // (
   //     & (cn=John Doe)
   //         (
   //             | (sn=Doe)
   //                 (givenName=John)
   //         )
   // )
*/
