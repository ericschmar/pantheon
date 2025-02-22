/*
  ace-ldap-highlighter.js

  This file implements a syntax highlighter for LDAP query strings compatible with Ace Editor.
  It highlights logical operators, parentheses, and attribute-value conditions.

  Usage example:
    <script src="path/to/ace.js"></script>
    <script src="path/to/ace-ldap-highlighter.js"></script>
    <script>
      ace.define('ace/mode/ldap_highlight_rules', function(require, exports, module) {
        var oop = require('ace/lib/oop');
        var TextHighlightRules = require('ace/mode/text_highlight_rules').TextHighlightRules;

        var LDAPHighlightRules = require('ace/mode/ldap_highlight_rules').LDAPHighlightRules;
        oop.inherits(LDAPHighlightRules, TextHighlightRules);
        exports.LDAPHighlightRules = LDAPHighlightRules;
      });

      ace.define('ace/mode/ldap', function(require, exports, module) {
        var oop = require('ace/lib/oop');
        var TextMode = require('ace/mode/text').Mode;
        var LDAPHighlightRules = require('ace/mode/ldap_highlight_rules').LDAPHighlightRules;

        var Mode = function() {
          this.HighlightRules = LDAPHighlightRules;
        };
        oop.inherits(Mode, TextMode);

        (function() {
          this.$id = "ace/mode/ldap";
        }).call(Mode.prototype);

        exports.Mode = Mode;
      });

      ace.config.setModuleUrl('ace/mode/ldap_highlight_rules', 'path/to/ace-ldap-highlighter.js');
      ace.config.setModuleUrl('ace/mode/ldap', 'path/to/ace-ldap-highlighter.js');

      var editor = ace.edit("editor");
      editor.session.setMode("ace/mode/ldap");
    </script>
*/

ace.define('ace/mode/ldap_highlight_rules', function(require, exports, module) {
  var oop = require('ace/lib/oop');
  var TextHighlightRules = require('ace/mode/text_highlight_rules').TextHighlightRules;

  var LDAPHighlightRules = function() {
    this.$rules = {
      start: [
        {
          token: 'operator',
          regex: /[&|!]/
        },
        {
          token: 'punctuation',
          regex: /[()]/
        },
        {
          token: 'attribute',
          regex: /\b\w+\b(?=\s*=)/
        },
        {
          token: 'string',
          regex: /=\s*[^()&|!\s][^()&|!]*/,
          next: 'start'
        }
      ]
    };
  };

  oop.inherits(LDAPHighlightRules, TextHighlightRules);
  exports.LDAPHighlightRules = LDAPHighlightRules;
});

ace.define('ace/mode/ldap', function(require, exports, module) {
  var oop = require('ace/lib/oop');
  var TextMode = require('ace/mode/text').Mode;
  var LDAPHighlightRules = require('ace/mode/ldap_highlight_rules').LDAPHighlightRules;

  var Mode = function() {
    this.HighlightRules = LDAPHighlightRules;
  };
  oop.inherits(Mode, TextMode);

  (function() {
    this.$id = "ace/mode/ldap";
  }).call(Mode.prototype);

  exports.Mode = Mode;
});
