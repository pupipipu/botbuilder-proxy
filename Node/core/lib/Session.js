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
var Dialog_1 = require("./dialogs/Dialog");
var Message_1 = require("./Message");
var consts = require("./consts");
var sprintf = require("sprintf-js");
var events = require("events");
var async = require("async");
var Session = /** @class */ (function (_super) {
    tslib_1.__extends(Session, _super);
    function Session(options) {
        var _this = _super.call(this) || this;
        _this.options = options;
        _this.msgSent = false;
        _this._hasError = false;
        _this._isReset = false;
        _this.lastSendTime = new Date().getTime();
        _this.batch = [];
        _this.batchStarted = false;
        _this.sendingBatch = false;
        _this.inMiddleware = false;
        _this._locale = null;
        _this.localizer = null;
        _this.logger = null;
        _this.connector = options.connector;
        _this.library = options.library;
        _this.localizer = options.localizer;
        _this.logger = options.logger;
        if (typeof _this.options.autoBatchDelay !== 'number') {
            _this.options.autoBatchDelay = 250; // 250ms delay
        }
        return _this;
    }
    Session.prototype.toRecognizeContext = function () {
        var _this = this;
        return {
            message: this.message,
            userData: this.userData,
            conversationData: this.conversationData,
            privateConversationData: this.privateConversationData,
            dialogData: this.dialogData,
            localizer: this.localizer,
            logger: this.logger,
            dialogStack: function () { return _this.dialogStack(); },
            preferredLocale: function () { return _this.preferredLocale(); },
            gettext: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return Session.prototype.gettext.call(_this, args);
            },
            ngettext: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return Session.prototype.ngettext.call(_this, args);
            },
            locale: this.preferredLocale()
        };
    };
    Session.prototype.dispatch = function (sessionState, message, done) {
        var _this = this;
        var index = 0;
        var session = this;
        var now = new Date().getTime();
        var middleware = this.options.middleware || [];
        var next = function () {
            var handler = index < middleware.length ? middleware[index] : null;
            if (handler) {
                index++;
                handler(session, next);
            }
            else {
                _this.inMiddleware = false;
                _this.sessionState.lastAccess = now; // Set after middleware runs so you can expire old sessions.
                done();
            }
        };
        // Make sure dialogData is properly initialized
        this.sessionState = sessionState || { callstack: [], lastAccess: now, version: 0.0 };
        var cur = this.curDialog();
        if (cur) {
            this.dialogData = cur.state;
        }
        // Dispatch message
        this.inMiddleware = true;
        this.message = (message || { text: '' });
        if (!this.message.type) {
            this.message.type = consts.messageType;
        }
        // Ensure localized prompts are loaded
        var locale = this.preferredLocale();
        this.localizer.load(locale, function (err) {
            if (err) {
                _this.error(err);
            }
            else {
                next();
            }
        });
        return this;
    };
    /** An error has occurred. */
    Session.prototype.error = function (err) {
        // Log error
        var m = err.toString();
        err = err instanceof Error ? err : new Error(m);
        this.emit('error', err);
        this.logger.error(this.dialogStack(), err);
        // End conversation with a message
        this._hasError = true;
        if (this.options.dialogErrorMessage) {
            this.endConversation(this.options.dialogErrorMessage);
        }
        else {
            var locale = this.preferredLocale();
            this.endConversation(this.localizer.gettext(locale, 'default_error', consts.Library.system));
        }
        return this;
    };
    /** Gets/sets the users preferred locale. */
    Session.prototype.preferredLocale = function (locale, callback) {
        if (locale) {
            this._locale = locale;
            if (this.userData) {
                this.userData[consts.Data.PreferredLocale] = locale;
            }
            if (this.localizer) {
                this.localizer.load(locale, callback);
            }
        }
        else if (!this._locale) {
            if (this.userData && this.userData[consts.Data.PreferredLocale]) {
                this._locale = this.userData[consts.Data.PreferredLocale];
            }
            else if (this.message && this.message.textLocale) {
                this._locale = this.message.textLocale;
            }
            else if (this.localizer) {
                this._locale = this.localizer.defaultLocale();
            }
        }
        return this._locale;
    };
    /** Gets and formats a localized text string. */
    Session.prototype.gettext = function (messageid) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return this.vgettext(this.curLibraryName(), messageid, args);
    };
    /** Gets and formats the singular/plural form of a localized text string. */
    Session.prototype.ngettext = function (messageid, messageid_plural, count) {
        var tmpl;
        if (this.localizer && this.message) {
            tmpl = this.localizer.ngettext(this.preferredLocale(), messageid, messageid_plural, count, this.curLibraryName());
        }
        else if (count == 1) {
            tmpl = messageid;
        }
        else {
            tmpl = messageid_plural;
        }
        return sprintf.sprintf(tmpl, count);
    };
    /** Used to manually save the current session state. */
    Session.prototype.save = function () {
        this.logger.log(this.dialogStack(), 'Session.save()');
        this.startBatch();
        return this;
    };
    /** Sends a message to the user. */
    Session.prototype.send = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        args.unshift(this.curLibraryName(), message);
        return Session.prototype.sendLocalized.apply(this, args);
    };
    /** Sends a message to a user using a specific localization namespace. */
    Session.prototype.sendLocalized = function (libraryNamespace, message) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        this.msgSent = true;
        if (message) {
            var m;
            if (typeof message == 'string' || Array.isArray(message)) {
                m = this.createMessage(libraryNamespace, message, args);
            }
            else if (message.toMessage) {
                m = message.toMessage();
            }
            else {
                m = message;
            }
            this.prepareMessage(m);
            this.batch.push(m);
            this.logger.log(this.dialogStack(), 'Session.send()');
        }
        this.startBatch();
        return this;
    };
    Session.prototype.say = function (text, speak, options) {
        if (typeof speak === 'object') {
            options = speak;
            speak = null;
        }
        return this.sayLocalized(this.curLibraryName(), text, speak, options);
    };
    /** Sends a text, and optional SSML, message to the user using a specific localization namespace. */
    Session.prototype.sayLocalized = function (libraryNamespace, text, speak, options) {
        this.msgSent = true;
        var msg = new Message_1.Message(this).text(text).speak(speak).toMessage();
        if (options) {
            ['attachments', 'attachmentLayout', 'entities', 'textFormat', 'inputHint'].forEach(function (field) {
                if (options.hasOwnProperty(field)) {
                    msg[field] = options[field];
                }
            });
        }
        return this.sendLocalized(libraryNamespace, msg);
    };
    /** Sends a typing indicator to the user. */
    Session.prototype.sendTyping = function () {
        this.msgSent = true;
        var m = { type: 'typing' };
        this.prepareMessage(m);
        this.batch.push(m);
        this.logger.log(this.dialogStack(), 'Session.sendTyping()');
        return this;
    };
    /** Inserts a delay between outgoing messages. */
    Session.prototype.delay = function (delay) {
        this.msgSent = true;
        var m = { type: 'delay', value: delay };
        this.prepareMessage(m);
        this.batch.push(m);
        this.logger.log(this.dialogStack(), 'Session.delay(%d)', delay);
        return this;
    };
    /** Returns true if at least one message has been sent. */
    Session.prototype.messageSent = function () {
        return this.msgSent;
    };
    /** Begins a new dialog. */
    Session.prototype.beginDialog = function (id, args) {
        // Find dialog
        this.logger.log(this.dialogStack(), 'Session.beginDialog(' + id + ')');
        var id = this.resolveDialogId(id);
        var dialog = this.findDialog(id);
        if (!dialog) {
            throw new Error('Dialog[' + id + '] not found.');
        }
        // Push dialog onto stack and start it
        // - Removed the call to save() here as an optimization. In the case of prompts
        //   we end up saving state twice, once here and again after they save off all of
        //   there params before sending the message.  This chnage does mean a dialog needs
        //   to either send a message or manually call session.save() when started but given
        //   most dialogs should always prompt the user is some way that seems reasonable and
        //   can save a number of intermediate calls to save.
        this.pushDialog({ id: id, state: {} });
        this.startBatch();
        dialog.begin(this, args);
        return this;
    };
    /** Replaces the existing dialog with a new one.  */
    Session.prototype.replaceDialog = function (id, args) {
        // Find dialog
        this.logger.log(this.dialogStack(), 'Session.replaceDialog(' + id + ')');
        var id = this.resolveDialogId(id);
        var dialog = this.findDialog(id);
        if (!dialog) {
            throw new Error('Dialog[' + id + '] not found.');
        }
        // Update the stack and start dialog
        this.popDialog();
        this.pushDialog({ id: id, state: {} });
        this.startBatch();
        dialog.begin(this, args);
        return this;
    };
    /** Ends the conversation with the user. */
    Session.prototype.endConversation = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        // Unpack message
        var m;
        if (message) {
            if (typeof message == 'string' || Array.isArray(message)) {
                m = this.createMessage(this.curLibraryName(), message, args);
            }
            else if (message.toMessage) {
                m = message.toMessage();
            }
            else {
                m = message;
            }
            this.msgSent = true;
            this.prepareMessage(m);
            this.batch.push(m);
        }
        // Clear conversation data
        this.conversationData = {};
        this.privateConversationData = {};
        // Add end conversation message
        var code = this._hasError ? 'unknown' : 'completedSuccessfully';
        var mec = { type: 'endOfConversation', code: code };
        this.prepareMessage(mec);
        this.batch.push(mec);
        // Clear stack and save.
        this.logger.log(this.dialogStack(), 'Session.endConversation()');
        var ss = this.sessionState;
        ss.callstack = [];
        this.sendBatch();
        return this;
    };
    /** Ends the current dialog. */
    Session.prototype.endDialog = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        // Check for result being passed
        if (typeof message === 'object' && (message.hasOwnProperty('response') || message.hasOwnProperty('resumed') || message.hasOwnProperty('error'))) {
            console.warn('Returning results via Session.endDialog() is deprecated. Use Session.endDialogWithResult() instead.');
            return this.endDialogWithResult(message);
        }
        // Validate callstack
        var cur = this.curDialog();
        if (cur) {
            // Unpack message
            var m;
            if (message) {
                if (typeof message == 'string' || Array.isArray(message)) {
                    m = this.createMessage(this.curLibraryName(), message, args);
                }
                else if (message.toMessage) {
                    m = message.toMessage();
                }
                else {
                    m = message;
                }
                this.msgSent = true;
                this.prepareMessage(m);
                this.batch.push(m);
            }
            // Pop dialog off the stack and then resume parent.
            this.logger.log(this.dialogStack(), 'Session.endDialog()');
            var childId = cur.id;
            cur = this.popDialog();
            this.startBatch();
            if (cur) {
                var dialog = this.findDialog(cur.id);
                if (dialog) {
                    dialog.dialogResumed(this, { resumed: Dialog_1.ResumeReason.completed, response: true, childId: childId });
                }
                else {
                    // Bad dialog on the stack so just end it.
                    // - Because of the stack validation we should never actually get here.
                    this.error(new Error("Can't resume missing parent dialog '" + cur.id + "'."));
                }
            }
        }
        return this;
    };
    /** Ends the current dialog and returns a value to the caller. */
    Session.prototype.endDialogWithResult = function (result) {
        // Validate callstack
        var cur = this.curDialog();
        if (cur) {
            // Validate result
            result = result || {};
            if (!result.hasOwnProperty('resumed')) {
                result.resumed = Dialog_1.ResumeReason.completed;
            }
            result.childId = cur.id;
            // Pop dialog off the stack and resume parent dlg.
            this.logger.log(this.dialogStack(), 'Session.endDialogWithResult()');
            cur = this.popDialog();
            this.startBatch();
            if (cur) {
                var dialog = this.findDialog(cur.id);
                if (dialog) {
                    dialog.dialogResumed(this, result);
                }
                else {
                    // Bad dialog on the stack so just end it.
                    // - Because of the stack validation we should never actually get here.
                    this.error(new Error("Can't resume missing parent dialog '" + cur.id + "'."));
                }
            }
        }
        return this;
    };
    /** Cancels a specific dialog on teh stack and optionally replaces it with a new one. */
    Session.prototype.cancelDialog = function (dialogId, replaceWithId, replaceWithArgs) {
        // Delete dialog(s)
        var childId = typeof dialogId === 'number' ? this.sessionState.callstack[dialogId].id : dialogId;
        var cur = this.deleteDialogs(dialogId);
        if (replaceWithId) {
            this.logger.log(this.dialogStack(), 'Session.cancelDialog(' + replaceWithId + ')');
            var id = this.resolveDialogId(replaceWithId);
            var dialog = this.findDialog(id);
            this.pushDialog({ id: id, state: {} });
            this.startBatch();
            dialog.begin(this, replaceWithArgs);
        }
        else {
            this.logger.log(this.dialogStack(), 'Session.cancelDialog()');
            this.startBatch();
            if (cur) {
                var dialog = this.findDialog(cur.id);
                if (dialog) {
                    dialog.dialogResumed(this, { resumed: Dialog_1.ResumeReason.canceled, response: null, childId: childId });
                }
                else {
                    // Bad dialog on the stack so just end it.
                    // - Because of the stack validation we should never actually get here.
                    this.error(new Error("Can't resume missing parent dialog '" + cur.id + "'."));
                }
            }
        }
        return this;
    };
    /** Resets the dialog stack and starts a new dialog. */
    Session.prototype.reset = function (dialogId, dialogArgs) {
        this.logger.log(this.dialogStack(), 'Session.reset()');
        this._isReset = true;
        this.sessionState.callstack = [];
        if (!dialogId) {
            dialogId = this.options.dialogId;
            dialogArgs = this.options.dialogArgs;
        }
        this.beginDialog(dialogId, dialogArgs);
        return this;
    };
    /** Returns true if the session has been reset. */
    Session.prototype.isReset = function () {
        return this._isReset;
    };
    /** Manually triggers sending of the current auto-batch. */
    Session.prototype.sendBatch = function (done) {
        var _this = this;
        this.logger.log(this.dialogStack(), 'Session.sendBatch() sending ' + this.batch.length + ' message(s)');
        if (this.sendingBatch) {
            this.batchStarted = true;
            return;
        }
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
            this.batchTimer = null;
        }
        this.batchTimer = null;
        var batch = this.batch;
        this.batch = [];
        this.batchStarted = false;
        this.sendingBatch = true;
        var cur = this.curDialog();
        if (cur) {
            cur.state = this.dialogData;
        }
        this.onSave(function (err) {
            if (!err) {
                _this.onSend(batch, function (err, addresses) {
                    _this.onFinishBatch(function () {
                        if (_this.batchStarted) {
                            _this.startBatch();
                        }
                        if (done) {
                            done(err, addresses);
                        }
                    });
                });
            }
            else {
                _this.onFinishBatch(function () {
                    if (done) {
                        done(err, null);
                    }
                });
            }
        });
    };
    //-------------------------------------------------------------------------
    // DialogStack Management
    //-------------------------------------------------------------------------
    /** Gets/sets the current dialog stack. A copy of the current stack will be returned to the caller. */
    Session.prototype.dialogStack = function (newStack) {
        var stack;
        if (newStack) {
            // Update stack and dialog data.
            stack = this.sessionState.callstack = newStack;
            this.dialogData = stack.length > 0 ? stack[stack.length - 1].state : null;
        }
        else {
            // Copy over dialog data to stack.
            stack = this.sessionState.callstack || [];
            if (stack.length > 0) {
                stack[stack.length - 1].state = this.dialogData || {};
            }
        }
        return stack.slice(0);
    };
    /** Clears the current dialog stack. */
    Session.prototype.clearDialogStack = function () {
        this.sessionState.callstack = [];
        this.dialogData = null;
        return this;
    };
    /** Enumerates all a stacks dialog entries in either a forward or reverse direction. */
    Session.forEachDialogStackEntry = function (stack, reverse, fn) {
        var step = reverse ? -1 : 1;
        var l = stack ? stack.length : 0;
        for (var i = step > 0 ? 0 : l - 1; i >= 0 && i < l; i += step) {
            fn(stack[i], i);
        }
    };
    /** Searches a dialog stack for a specific dialog, in either a forward or reverse direction, returning its index. */
    Session.findDialogStackEntry = function (stack, dialogId, reverse) {
        if (reverse === void 0) { reverse = false; }
        var step = reverse ? -1 : 1;
        var l = stack ? stack.length : 0;
        for (var i = step > 0 ? 0 : l - 1; i >= 0 && i < l; i += step) {
            if (stack[i].id === dialogId) {
                return i;
            }
        }
        return -1;
    };
    /** Returns a stacks active dialog or null. */
    Session.activeDialogStackEntry = function (stack) {
        return stack && stack.length > 0 ? stack[stack.length - 1] : null;
    };
    /** Pushes a new dialog onto a stack and returns it as the active dialog. */
    Session.pushDialogStackEntry = function (stack, entry) {
        if (!entry.state) {
            entry.state = {};
        }
        stack = stack || [];
        stack.push(entry);
        return entry;
    };
    /** Pops the active dialog off a stack and returns the new one if the stack isn't empty.  */
    Session.popDialogStackEntry = function (stack) {
        if (stack && stack.length > 0) {
            stack.pop();
        }
        return Session.activeDialogStackEntry(stack);
    };
    /** Deletes all dialog stack entries starting with the specified index and returns the new active dialog. */
    Session.pruneDialogStack = function (stack, start) {
        if (stack && stack.length > 0) {
            stack.splice(start);
        }
        return Session.activeDialogStackEntry(stack);
    };
    /** Ensures that all of the entries on a dialog stack reference valid dialogs within a library hierarchy. */
    Session.validateDialogStack = function (stack, root) {
        var valid = true;
        Session.forEachDialogStackEntry(stack, false, function (entry) {
            var pair = entry.id.split(':');
            if (!root.findDialog(pair[0], pair[1])) {
                valid = false;
            }
        });
        return valid;
    };
    //-------------------------------------------------------------------------
    // Message Routing
    //-------------------------------------------------------------------------
    /** Dispatches handling of the current message to the active dialog stack entry. */
    Session.prototype.routeToActiveDialog = function (recognizeResult) {
        var dialogStack = this.dialogStack();
        if (Session.validateDialogStack(dialogStack, this.library)) {
            var active = Session.activeDialogStackEntry(dialogStack);
            if (active) {
                var dialog = this.findDialog(active.id);
                dialog.replyReceived(this, recognizeResult);
            }
            else {
                this.beginDialog(this.options.dialogId, this.options.dialogArgs);
            }
        }
        else {
            this.error(new Error('Invalid Dialog Stack.'));
        }
    };
    //-----------------------------------------------------
    // Watch Statements
    //-----------------------------------------------------
    /** Enables/disables the watch statment for a given variable. */
    Session.prototype.watch = function (variable, enable) {
        if (enable === void 0) { enable = true; }
        var name = variable.toLowerCase();
        if (!this.userData.hasOwnProperty(consts.Data.DebugWatches)) {
            this.userData[consts.Data.DebugWatches] = {};
        }
        if (watchableHandlers.hasOwnProperty(name)) {
            var entry = watchableHandlers[name];
            this.userData[consts.Data.DebugWatches][entry.name] = enable;
        }
        else {
            throw new Error("Invalid watch statement. '" + variable + "' isn't watchable");
        }
        return this;
    };
    /** Returns the list of enabled watch statements for the session. */
    Session.prototype.watchList = function () {
        var watches = [];
        if (this.userData.hasOwnProperty(consts.Data.DebugWatches)) {
            for (var name_1 in this.userData[consts.Data.DebugWatches]) {
                if (this.userData[consts.Data.DebugWatches][name_1]) {
                    watches.push(name_1);
                }
            }
        }
        return watches;
    };
    /** Adds or retrieves a watchable variable from the session. */
    Session.watchable = function (variable, handler) {
        if (handler) {
            watchableHandlers[variable.toLowerCase()] = { name: variable, handler: handler };
        }
        else {
            var entry = watchableHandlers[variable.toLowerCase()];
            if (entry) {
                handler = entry.handler;
            }
        }
        return handler;
    };
    /** Returns the list of watchable variables. */
    Session.watchableList = function () {
        var variables = [];
        for (var name_2 in watchableHandlers) {
            if (watchableHandlers.hasOwnProperty(name_2)) {
                variables.push(watchableHandlers[name_2].name);
            }
        }
        return variables;
    };
    //-----------------------------------------------------
    // PRIVATE HELPERS
    //-----------------------------------------------------
    Session.prototype.onSave = function (cb) {
        var _this = this;
        this.options.onSave(function (err) {
            if (err) {
                _this.logger.error(_this.dialogStack(), err);
                switch (err.code || '') {
                    case consts.Errors.EBADMSG:
                    case consts.Errors.EMSGSIZE:
                        // Something wrong with state so reset everything 
                        _this.userData = {};
                        _this.batch = [];
                        _this.endConversation(_this.options.dialogErrorMessage || 'Oops. Something went wrong and we need to start over.');
                        break;
                }
            }
            cb(err);
        });
    };
    Session.prototype.onSend = function (batch, cb) {
        var _this = this;
        if (batch && batch.length > 0) {
            this.options.onSend(batch, function (err, responses) {
                if (err) {
                    _this.logger.error(_this.dialogStack(), err);
                }
                cb(err, responses);
            });
        }
        else {
            cb(null, null);
        }
    };
    Session.prototype.onFinishBatch = function (cb) {
        var _this = this;
        // Dump watchList
        var ctx = this.toRecognizeContext();
        async.each(this.watchList(), function (variable, cb) {
            var entry = watchableHandlers[variable.toLowerCase()];
            if (entry && entry.handler) {
                try {
                    entry.handler(ctx, function (err, value) {
                        if (!err) {
                            _this.logger.dump(variable, value);
                        }
                        cb(err);
                    });
                }
                catch (e) {
                    cb(e);
                }
            }
            else {
                cb(new Error("'" + variable + "' isn't watchable."));
            }
        }, function (err) {
            // Flush logs
            if (err) {
                _this.logger.error(_this.dialogStack(), err);
            }
            _this.logger.flush(function (err) {
                _this.sendingBatch = false;
                if (err) {
                    console.error(err);
                }
                cb();
            });
        });
    };
    Session.prototype.startBatch = function () {
        var _this = this;
        this.batchStarted = true;
        if (!this.sendingBatch) {
            if (this.batchTimer) {
                clearTimeout(this.batchTimer);
            }
            this.batchTimer = setTimeout(function () {
                _this.sendBatch();
            }, this.options.autoBatchDelay);
        }
    };
    Session.prototype.createMessage = function (localizationNamespace, text, args) {
        var message = new Message_1.Message(this)
            .text(this.vgettext(localizationNamespace, Message_1.Message.randomPrompt(text), args));
        return message.toMessage();
    };
    Session.prototype.prepareMessage = function (msg) {
        if (!msg.type) {
            msg.type = 'message';
        }
        if (!msg.address) {
            msg.address = this.message.address;
        }
        if (!msg.textLocale && this.message.textLocale) {
            msg.textLocale = this.message.textLocale;
        }
    };
    Session.prototype.vgettext = function (localizationNamespace, messageid, args) {
        var tmpl;
        if (this.localizer && this.message) {
            tmpl = this.localizer.gettext(this.preferredLocale(), messageid, localizationNamespace);
        }
        else {
            tmpl = messageid;
        }
        return args && args.length > 0 ? sprintf.vsprintf(tmpl, args) : tmpl;
    };
    /** Checks for any unsupported dialogs on the callstack. */
    Session.prototype.validateCallstack = function () {
        var ss = this.sessionState;
        for (var i = 0; i < ss.callstack.length; i++) {
            var id = ss.callstack[i].id;
            if (!this.findDialog(id)) {
                return false;
            }
        }
        return true;
    };
    Session.prototype.resolveDialogId = function (id) {
        return id.indexOf(':') >= 0 ? id : this.curLibraryName() + ':' + id;
    };
    Session.prototype.curLibraryName = function () {
        var cur = this.curDialog();
        return cur && !this.inMiddleware ? cur.id.split(':')[0] : this.library.name;
    };
    Session.prototype.findDialog = function (id) {
        var parts = id.split(':');
        return this.library.findDialog(parts[0] || this.library.name, parts[1]);
    };
    Session.prototype.pushDialog = function (ds) {
        var ss = this.sessionState;
        var cur = this.curDialog();
        if (cur) {
            cur.state = this.dialogData || {};
        }
        ss.callstack.push(ds);
        this.dialogData = ds.state || {};
        return ds;
    };
    Session.prototype.popDialog = function () {
        var ss = this.sessionState;
        if (ss.callstack.length > 0) {
            ss.callstack.pop();
        }
        var cur = this.curDialog();
        this.dialogData = cur ? cur.state : null;
        return cur;
    };
    Session.prototype.deleteDialogs = function (dialogId) {
        var ss = this.sessionState;
        var index = -1;
        if (typeof dialogId === 'string') {
            for (var i = ss.callstack.length - 1; i >= 0; i--) {
                if (ss.callstack[i].id == dialogId) {
                    index = i;
                    break;
                }
            }
        }
        else {
            index = dialogId;
        }
        if (index < 0 && index < ss.callstack.length) {
            throw new Error('Unable to cancel dialog. Dialog[' + dialogId + '] not found.');
        }
        ss.callstack.splice(index);
        var cur = this.curDialog();
        this.dialogData = cur ? cur.state : null;
        return cur;
    };
    Session.prototype.curDialog = function () {
        var cur;
        var ss = this.sessionState;
        if (ss.callstack.length > 0) {
            cur = ss.callstack[ss.callstack.length - 1];
        }
        return cur;
    };
    //-----------------------------------------------------
    // DEPRECATED METHODS
    //-----------------------------------------------------
    Session.prototype.getMessageReceived = function () {
        console.warn("Session.getMessageReceived() is deprecated. Use Session.message.sourceEvent instead.");
        return this.message.sourceEvent;
    };
    return Session;
}(events.EventEmitter));
exports.Session = Session;
// Initialize default list of watchable variables.
var watchableHandlers = {
    'userdata': { name: 'userData', handler: function (ctx, cb) { return cb(null, ctx.userData); } },
    'conversationdata': { name: 'conversationData', handler: function (ctx, cb) { return cb(null, ctx.conversationData); } },
    'privateconversationdata': { name: 'privateConversationData', handler: function (ctx, cb) { return cb(null, ctx.privateConversationData); } },
    'dialogdata': { name: 'dialogData', handler: function (ctx, cb) { return cb(null, ctx.dialogData); } },
    'dialogstack': { name: 'dialogStack', handler: function (ctx, cb) { return cb(null, ctx.dialogStack()); } },
    'preferredlocale': { name: 'preferredLocale', handler: function (ctx, cb) { return cb(null, ctx.preferredLocale()); } },
    'libraryname': { name: 'libraryName', handler: function (ctx, cb) { return cb(null, ctx.libraryName); } }
};
//# sourceMappingURL=Session.js.map