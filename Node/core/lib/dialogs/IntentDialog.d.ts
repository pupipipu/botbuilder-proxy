import { Session } from '../Session';
import { IDialogWaterfallStep } from './WaterfallDialog';
import { Dialog, IRecognizeDialogContext, IDialogResult } from './Dialog';
import { IIntentRecognizerSetOptions } from './IntentRecognizerSet';
import { IIntentRecognizer, IIntentRecognizerResult } from './IntentRecognizer';
export declare enum RecognizeMode {
    onBegin = 0,
    onBeginIfRoot = 1,
    onReply = 2,
}
export interface IIntentDialogOptions extends IIntentRecognizerSetOptions {
    recognizeMode?: RecognizeMode;
}
export interface IBeginDialogHandler {
    (session: Session, args: any, next: (handled: boolean) => void): void;
}
export declare class IntentDialog extends Dialog {
    private beginDialog;
    private handlers;
    private recognizers;
    private recognizeMode;
    constructor(options?: IIntentDialogOptions);
    begin<T>(session: Session, args: any): void;
    replyReceived(session: Session, recognizeResult?: IIntentRecognizerResult): void;
    dialogResumed(session: Session, result: IDialogResult<any>): void;
    recognize(context: IRecognizeDialogContext, cb: (err: Error, result: IIntentRecognizerResult) => void): void;
    onBegin(handler: IBeginDialogHandler): this;
    matches(intent: string | RegExp, dialogId: string | IDialogWaterfallStep[] | IDialogWaterfallStep, dialogArgs?: any): this;
    matchesAny(intents: string[] | RegExp[], dialogId: string | IDialogWaterfallStep[] | IDialogWaterfallStep, dialogArgs?: any): this;
    onDefault(dialogId: string | IDialogWaterfallStep[] | IDialogWaterfallStep, dialogArgs?: any): this;
    recognizer(plugin: IIntentRecognizer): this;
    private invokeIntent(session, recognizeResult);
    private emitError(session, err);
}
