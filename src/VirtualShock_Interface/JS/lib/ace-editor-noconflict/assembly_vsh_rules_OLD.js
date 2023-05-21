ace.define(function(require, exports, module) {
    "use strict";
    
    var oop = require("../lib/oop");
    var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
    
    var MyNewHighlightRules = function() {
    
        // regexp must not have capturing parentheses. Use (?:) instead.
        // regexps are ordered -> the first match is used
       this.$rules = {
            "start" : [
                {
                    token: "instruction", // String, Array, or Function: the CSS token to apply
                    regex: /add/, // String or RegExp: the regexp to match
                    next:  "start"   // [Optional] String: next state to enter
                }
            ]
        };
    };
    
    oop.inherits(MyNewHighlightRules, TextHighlightRules);
    
    exports.MyNewHighlightRules = MyNewHighlightRules;
    
    });