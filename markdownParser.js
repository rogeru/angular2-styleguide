var marked = require('marked');
var Less = require('less');

var exports = module.exports = {};

// Class to parse a less file for markdown comments.
// Used by MarkdownParser
var LessParser = (function () {
    function LessParser() {}
    LessParser.prototype.parse = function (data) {
        var res;
        var parser = new (Less.Parser)({}, { contents: {} }, {
            relativeUrls: true,
            rootpath: '/'
        });
        parser.parse(data, function (err, tree) {
            res = tree.rules
                .filter(function (rule) { return rule.isLineComment === false; })
                .map(function (rule) { return rule.value.replace(/(?:\/\*)|(?:\*\/)/gi, ''); })
                .join('');
        });
        return res;
    };
    return LessParser;
})();

var MarkdownParser = (function () {
    function MarkdownParser() {
        this._renderer = new marked.Renderer();
        this._options = {};
    }

    MarkdownParser.prototype.setOptions = function (options) {
        this._options = options;
        marked.setOptions(options);
    };

    Object.defineProperty(MarkdownParser.prototype, 'renderer', {
        get: function () {
            return this._renderer;
        },
        enumerable: true,
        configurable: true
    });

    // Parse markdown and convert it to blocks of HTML
    // Returns object with `title` and `blocks` array.
    MarkdownParser.prototype.render = function (data) {
        var _this = this;
        var blocks = this._parseBlock(data).map(function (block) {
            block.class = (_this._options.headingClassPrefix || 'toc') + block.depth;
            return block;
        });
        return { title: this._title, blocks: blocks };
    };

    // Extracts the markdown data from the file data. Different
    // extraction logic needed for different file types.
    MarkdownParser.prototype.extract = function (fileType, data) {
        var markdown = '';
        switch (fileType) {
            case 'less':
                markdown = (new LessParser()).parse(data);
                break;
            case 'md':
                markdown = data;
                break;
            default:
                console.log('file type not supported: ' + fileType);
        }
        return markdown;
    };

    MarkdownParser.prototype._parseBlock = function (commentBlockText) {
        var _this = this;
        var lexedCommentblock = marked.lexer(commentBlockText);
        var lexerLinks = lexedCommentblock.links || {};
        var returnVal = [];
        var blockDef = {
            content: [],
            heading: '',
            depth: undefined
        };
        var block = Object.assign({}, blockDef);
        lexedCommentblock.forEach(function (comment) {
            switch (comment.type) {
                case 'code':
                    block.content.push({
                        type: 'html',
                        text: '<div class="codedemo">' + comment.text + '<div style="clear: both;"></div></div>'
                    });
                    block.content.push(comment);
                    break;
                case 'heading':
                    if (block.heading !== '') {
                        block.content.links = lexerLinks;
                        block.content = marked.parser(block.content);
                        returnVal.push(block);
                        block = Object.assign({}, blockDef);
                    }
                    if (comment.depth === 1) {
                        _this._title = comment.text;
                    }
                    else if (comment.depth < 6) {
                        block.heading = comment.text;
                        block.depth = comment.depth;
                        block.content.push(comment);
                    }
                    break;
                default:
                    block.content.push(comment);
                    break;
            }
        });
        block.content.links = lexerLinks;
        block.content = marked.parser(block.content);
        returnVal.push(block);
        return returnVal;
    };

    return MarkdownParser;
})();

exports.MarkdownParser = MarkdownParser;

