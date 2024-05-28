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
                    token: 'comment.line', //temp
                    regex: '//.*'
                },
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
                    token: "instruction.immediate.constant", // String, Array, or Function: the CSS token to apply
                    regex: /(.*) (?=(equ|db))/, // String or RegExp: the regexp to match
                    next:  "start",   // [Optional] String: next state to enter
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
                    regex: /procedure* /, // String or RegExp: the regexp to match
                    next:  "function_key"   // [Optional] String: next state to enter
                },
                {
                    token: "function.key", // String, Array, or Function: the CSS token to apply
                    regex: /interrupt_routine* /, // String or RegExp: the regexp to match
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
                    token: 'comment.line', //temp
                    regex: '//.*'
                },
                {
                    token: "tag", // String, Array, or Function: the CSS token to apply
                    regex: /([^:\s]+)(?= *:)/, // String or RegExp: the regexp to match
                    next:  "function_body",   // [Optional] String: next state to enter
                    caseInsensitive: true 
                },
                {
                    token: "function.end", // String, Array, or Function: the CSS token to apply
                    regex: /( *})/, // String or RegExp: the regexp to match
                    next:  "start",   // [Optional] String: next state to enter
                },
                //INSTRUCTIONS COP
                {
                    token: "instruction.register.cop", // String, Array, or Function: the CSS token to apply
                    regex: /(add|sub|mult|div|and|or|seq|sneq|sgt|sge|slt|sle)* /, // String or RegExp: the regexp to match
                    next:  "function_body",   // [Optional] String: next state to enter
                    caseInsensitive: true 
                },
                {
                    token: "instruction.immediate.cop", // String, Array, or Function: the CSS token to apply
                    regex: /(addi|subi|multi|divi|andi|ori|seqi|sneqi|sgti|sgei|slti|slei)* /, // String or RegExp: the regexp to match
                    next:  "instruction_immediate_body",   // [Optional] String: next state to enter
                    caseInsensitive: true 
                },
                {
                    token: "instruction.jump.cop", // String, Array, or Function: the CSS token to apply
                    regex: /j* /, // String or RegExp: the regexp to match
                    next:  "jump_tag_reference",   // [Optional] String: next state to enter
                    caseInsensitive: true 
                },
                {
                    token: "instruction.memory.cop",
                    regex: /(push|pop)/,
                    next: "function_body"
                },
                {
                    token: "instruction.memory.cop",
                    regex: /(sw|lw|out|in)/,
                    next: "instruction_memory_body"
                },

                //SPECIAL INSTRUCTIONS
                {//HALT
                    token: "instruction.register.cop", // String, Array, or Function: the CSS token to apply
                    regex: /(halt|print)/, // String or RegExp: the regexp to match
                    next:  "function_body",   // [Optional] String: next state to enter
                    caseInsensitive: true 
                },
                {//BEQZ/BNEQZ
                    token: "instruction.beqz.cop", // String, Array, or Function: the CSS token to apply
                    regex: /(beqz|bneqz)* /, // String or RegExp: the regexp to match
                    next:  "instruction_beqz_body",   // [Optional] String: next state to enter
                    caseInsensitive: true 
                },
            ],
            "instruction_memory_body": [
                {
                    token: "instruction.memory.constant",
                    regex: /(?<=( |,))([A-Za-z0-9_]+)(?=(\())/,
                    next: "function_body"
                }
            ],
            //IMMEDIATE
            "instruction_immediate_body": [
                {
                    token: "instruction.immediate.register", // String, Array, or Function: the CSS token to apply
                    regex: /r[0-9]+/, // String or RegExp: the regexp to match
                    next:  "instruction_immediate_body",   // [Optional] String: next state to enter
                    caseInsensitive: true 
                },
                {
                    token: "instruction.immediate.constant", // String, Array, or Function: the CSS token to apply
                    regex: /(?<=( |,))([A-Za-z0-9_]+)/, // String or RegExp: the regexp to match
                    next:  "function_body",   // [Optional] String: next state to enter
                    caseInsensitive: true 
                },
                { 
                    token: 'constant.character.decimal.assembly',
                    regex: '\\b[0-9]+\\b',
                    next:  "function_body",   // [Optional] String: next state to enter
                    caseInsensitive: true 
                },
                { 
                    token: 'constant.character.hexadecimal.assembly',
                    regex: '\\b[A-F0-9]+h\\b',
                    next:  "function_body",   // [Optional] String: next state to enter
                    caseInsensitive: true 
                }
            ],
            //Beqz
            "instruction_beqz_body": [
                {
                    token: "instruction.beqz.register", // String, Array, or Function: the CSS token to apply
                    regex: /r[0-9]+/, // String or RegExp: the regexp to match
                    next:  "jump_tag_reference",   // [Optional] String: next state to enter
                    caseInsensitive: true 
                },
            ],
            "jump_tag_reference": [
                { 
                    token: 'constant.character.decimal.assembly',
                    regex: '\\b[0-9]+\\b',
                    next:  "function_body",   // [Optional] String: next state to enter
                    caseInsensitive: true 
                },
                { 
                    token: 'constant.character.hexadecimal.assembly',
                    regex: '\\b[A-F0-9]+h\\b',
                    next:  "function_body",   // [Optional] String: next state to enter
                    caseInsensitive: true 
                },
                {
                    token: "instruction.tag_reference", // String, Array, or Function: the CSS token to apply
                    regex: /(?<=( |,))([A-Za-z0-9_]+)/, // String or RegExp: the regexp to match
                    next:  "function_body",   // [Optional] String: next state to enter
                    caseInsensitive: true 
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