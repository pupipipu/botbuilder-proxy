"use strict";
// 
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
// 
// Microsoft Bot Framework: http://botframework.com
// 
// Bot Builder SDK Github:
// https://github.com/Microsoft/BotBuilder
// 
// Copyright (c) Microsoft Corporation
// All rights reserved.
// 
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
// 
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var IntentRecognizer_1 = require("./IntentRecognizer");
var RegExpRecognizer = /** @class */ (function (_super) {
    tslib_1.__extends(RegExpRecognizer, _super);
    function RegExpRecognizer(intent, expressions) {
        var _this = _super.call(this) || this;
        _this.intent = intent;
        if (expressions instanceof RegExp || typeof expressions.exec === 'function') {
            _this.expressions = { '*': expressions };
        }
        else {
            _this.expressions = (expressions || {});
        }
        return _this;
    }
    RegExpRecognizer.prototype.onRecognize = function (context, cb) {
        var result = { score: 0.0, intent: null };
        if (context && context.message && context.message.text) {
            var utterance = context.message.text;
            var locale = context.locale || '*';
            var exp = this.expressions.hasOwnProperty(locale) ? this.expressions[locale] : this.expressions['*'];
            if (exp) {
                var matches = new RegExp(exp).exec(context.message.text);
                if (matches && matches.length) {
                    // Score is coverage on a scale of 0.4 - 1.0.
                    var matched = matches[0];
                    result.score = 0.4 + ((matched.length / context.message.text.length) * 0.6);
                    result.intent = this.intent;
                    result.expression = exp;
                    result.matched = matches;
                }
                cb(null, result);
            }
            else {
                cb(new Error("Expression not found for locale '" + locale + "'."), null);
            }
        }
        else {
            cb(null, result);
        }
    };
    return RegExpRecognizer;
}(IntentRecognizer_1.IntentRecognizer));
exports.RegExpRecognizer = RegExpRecognizer;
//# sourceMappingURL=RegExpRecognizer.js.map