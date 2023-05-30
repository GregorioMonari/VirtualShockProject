ace.define("ace/mode/assembly_vsh_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module){
//ace.define(function(require, exports, module) {
    "use strict";
    
    var oop = require("../lib/oop");
    var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
    
    var MyNewHighlightRules = function() {
    
        // regexp must not have capturing parentheses. Use (?:) instead.
        // regexps are ordered -> the first match is used
       this.$rules = {
            "start" : [
                { 
                    token: 'constant.character.decimal.assembly',
                    regex: '\\b[0-9]+\\b' 
                },
                { 
                    token: 'constant.character.hexadecimal.assembly',
                    regex: '\\b[A-F0-9]+h\\b',
                    caseInsensitive: true 
                },
                {
                    token: "directive.equ", // String, Array, or Function: the CSS token to apply
                    regex: /equ* /, // String or RegExp: the regexp to match
                    next:  "start",   // [Optional] String: next state to enter
                    caseInsensitive: true 
                },
                {
                    token: "directive.db", // String, Array, or Function: the CSS token to apply
                    regex: /db* /, // String or RegExp: the regexp to match
                    next:  "start",   // [Optional] String: next state to enter
                    caseInsensitive: true 
                },
                {
                    token: "function.key", // String, Array, or Function: the CSS token to apply
                    regex: /proc* /, // String or RegExp: the regexp to match
                    next:  "function_key"   // [Optional] String: next state to enter
                }
            ],
            "function_key":[
                {
                    token: "function.name.main",
                    regex: /(main *)(?={)/,
                    next:  "function_body"
                },
                {
                    token: "function.name",
                    regex: /(.*)(?={)/,
                    next:  "function_body"
                }
            ],
            "function_body": [
                {
                    token: "instruction", // String, Array, or Function: the CSS token to apply
                    regex: /add* /, // String or RegExp: the regexp to match
                    next:  "function_body",   // [Optional] String: next state to enter
                    caseInsensitive: true 
                },
                {
                    token: "instruction.immediate", // String, Array, or Function: the CSS token to apply
                    regex: /addi* /, // String or RegExp: the regexp to match
                    next:  "function_body",   // [Optional] String: next state to enter
                    caseInsensitive: true 
                },
                {
                    token: "instruction.jump", // String, Array, or Function: the CSS token to apply
                    regex: /j* /, // String or RegExp: the regexp to match
                    next:  "function_body",   // [Optional] String: next state to enter
                    caseInsensitive: true 
                },
                {
                    token: "function.end", // String, Array, or Function: the CSS token to apply
                    regex: /( *})/, // String or RegExp: the regexp to match
                    next:  "start",   // [Optional] String: next state to enter
                },
            ]
        };
    };
    
    oop.inherits(MyNewHighlightRules, TextHighlightRules);
    
    exports.MyNewHighlightRules = MyNewHighlightRules;
    
    });



ace.define("ace/mode/matching_brace_outdent",["require","exports","module","ace/range"], function(require, exports, module){"use strict";
var Range = require("../range").Range;
var MatchingBraceOutdent = function () { };
(function () {
    this.checkOutdent = function (line, input) {
        if (!/^\s+$/.test(line))
            return false;
        return /^\s*\}/.test(input);
    };
    this.autoOutdent = function (doc, row) {
        var line = doc.getLine(row);
        var match = line.match(/^(\s*\})/);
        if (!match)
            return 0;
        var column = match[1].length;
        var openBracePos = doc.findMatchingBracket({ row: row, column: column });
        if (!openBracePos || openBracePos.row == row)
            return 0;
        var indent = this.$getIndent(doc.getLine(openBracePos.row));
        doc.replace(new Range(row, 0, row, column - 1), indent);
    };
    this.$getIndent = function (line) {
        return line.match(/^\s*/)[0];
    };
}).call(MatchingBraceOutdent.prototype);
exports.MatchingBraceOutdent = MatchingBraceOutdent;

});



ace.define("ace/mode/folding/assembly_vsh",["require","exports","module","ace/lib/oop","ace/mode/folding/fold_mode","ace/range"], function(require, exports, module){"use strict";
var oop = require("../../lib/oop");
var BaseFoldMode = require("./fold_mode").FoldMode;
var Range = require("../../range").Range;
var FoldMode = exports.FoldMode = function () { };
oop.inherits(FoldMode, BaseFoldMode);
(function () {
     // regular expressions that identify starting and stopping points
     this.foldingStartMarker = /(\{|\[)[^\}\]]*$|^\s*(\/\*)/;
     this.foldingStopMarker = /^[^\[\{]*(\}|\])|^[\s\*]*(\*\/)/;
 
     this.getFoldWidgetRange = function(session, foldStyle, row) {
        var line = session.getLine(row);
        var match = line.match(this.foldingStartMarker);
        if (match) {
            var i = match.index;
        
            if (match[1])
                return this.openingBracketBlock(session, match[1], row, i);
        
            var range = session.getCommentFoldRange(row, i + match[0].length);
            range.end.column -= 2;
            return range;
        }
     };
}).call(FoldMode.prototype);

});







ace.define("ace/mode/assembly_vsh",["require","exports","module","ace/lib/oop","ace/mode/matching_brace_outdent","ace/mode/folding/assembly_vsh","ace/mode/assembly_vsh_highlight_rules"], function(require, exports, module){
    "use strict";
    var oop = require("../lib/oop");
    // defines the parent mode
    var TextMode = require("./text").Mode;
    var Tokenizer = require("../tokenizer").Tokenizer;
    var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
    //var WorkerClient = require("../worker/worker_client").WorkerClient;
    // defines the language specific highlighters and folding rules
    var MyNewHighlightRules = require("./assembly_vsh_highlight_rules").MyNewHighlightRules;
    var MyNewFoldMode = require("./folding/assembly_vsh").FoldMode;
    
    var Mode = function() {
        // set everything up
        this.HighlightRules = MyNewHighlightRules;
        this.$behaviour = this.$defaultBehaviour;
        this.$outdent = new MatchingBraceOutdent();
        this.foldingRules = new MyNewFoldMode();
    };
    oop.inherits(Mode, TextMode);
    
    (function() {
        // configure comment start/end characters
        this.lineCommentStart = "//";
        this.blockComment = {start: "/*", end: "*/"};
        
        // special logic for indent/outdent. 
        // By default ace keeps indentation of previous line
        this.getNextLineIndent = function(state, line, tab) {
            var indent = this.$getIndent(line);
            return indent;
        };
    
        this.checkOutdent = function(state, line, input) {
            return this.$outdent.checkOutdent(line, input);
        };
    
        this.autoOutdent = function(state, doc, row) {
            this.$outdent.autoOutdent(doc, row);
        };
        
        // create worker for live syntax checking
        /*this.createWorker = function(session) {
            var worker = new WorkerClient(["ace"], "ace/mode/worker-coffee", "VshAssemblyWorker");
            worker.attachToDocument(session.getDocument());
            worker.on("errors", function(e) {
                session.setAnnotations(e.data);
            });
            return worker;
        };*/
        
    }).call(Mode.prototype);
    
    exports.Mode = Mode;
    });