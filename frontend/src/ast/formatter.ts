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

import { LDAPNode } from './parser';

export function print(ldapNode: LDAPNode): string {
  return recursivePrint(ldapNode, 0);
}

function freshLine(indent: number) {
  return '\n' + ' '.repeat(indent);
}

function recursivePrint(ldapNode: LDAPNode, indent: number): string {
  let ret = '';
  if (ldapNode.type === 'Condition') {
    ret += `(${ldapNode.attribute}=${ldapNode.value})`;
    return ret;
  }
  ret += '(';
  indent += 4;
  ret += freshLine(indent);
  switch (ldapNode.type) {
    case 'Conjunction':
      ret += '&';
      ret += freshLine(indent);
      ldapNode.children.forEach((child, idx) => {
        ret += recursivePrint(child, indent);
        if (idx < ldapNode.children.length - 1) ret += freshLine(indent);
      });
      break;
    case 'Disjunction':
      ret += '|';
      ret += freshLine(indent);
      ldapNode.children.forEach((child, idx) => {
        ret += recursivePrint(child, indent);
        if (idx < ldapNode.children.length - 1) ret += freshLine(indent);
      });
      break;
    case 'Negation':
      ret += '!';
      ret += recursivePrint(ldapNode.child, indent);
      break;
  }
  indent -= 4;
  ret += freshLine(indent);
  ret += ')';

  return ret;
}
