"use strict";
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
var Message_1 = require("../Message");
var Keyboard_1 = require("./Keyboard");
var MediaCard = /** @class */ (function (_super) {
    tslib_1.__extends(MediaCard, _super);
    function MediaCard(session) {
        return _super.call(this, session) || this;
    }
    MediaCard.prototype.title = function (text) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (text) {
            this.data.content.title = Message_1.fmtText(this.session, text, args);
        }
        return this;
    };
    MediaCard.prototype.subtitle = function (text) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (text) {
            this.data.content.subtitle = Message_1.fmtText(this.session, text, args);
        }
        return this;
    };
    MediaCard.prototype.text = function (text) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (text) {
            this.data.content.text = Message_1.fmtText(this.session, text, args);
        }
        return this;
    };
    MediaCard.prototype.autoloop = function (choice) {
        this.data.content.autoloop = choice;
        return this;
    };
    MediaCard.prototype.autostart = function (choice) {
        this.data.content.autostart = choice;
        return this;
    };
    MediaCard.prototype.shareable = function (choice) {
        this.data.content.shareable = choice;
        return this;
    };
    MediaCard.prototype.image = function (image) {
        if (image) {
            this.data.content.image = image.toImage ? image.toImage() : image;
        }
        return this;
    };
    MediaCard.prototype.media = function (list) {
        this.data.content.media = [];
        if (list) {
            for (var i = 0; i < list.length; i++) {
                var media = list[i];
                this.data.content.media.push(media.toMedia ? media.toMedia() : media);
            }
        }
        return this;
    };
    MediaCard.prototype.value = function (param) {
        this.data.content.value = param;
        return this;
    };
    return MediaCard;
}(Keyboard_1.Keyboard));
exports.MediaCard = MediaCard;
//# sourceMappingURL=MediaCard.js.map