import { Session } from '../Session';
import { Dialog, IRecognizeDialogContext, IDialogResult } from '../dialogs/Dialog';
import { IRecognizeResult } from '../dialogs/IntentRecognizer';
import { IBeginDialogHandler } from '../dialogs/IntentDialog';
import { IDialogWaterfallStep } from '../dialogs/WaterfallDialog';
export declare class LuisDialog extends Dialog {
    private dialog;
    constructor(serviceUri: string);
    begin<T>(session: Session, args?: T): void;
    replyReceived(session: Session, recognizeResult?: IRecognizeResult): void;
    dialogResumed<T>(session: Session, result: IDialogResult<T>): void;
    recognize(context: IRecognizeDialogContext, cb: (err: Error, result: IRecognizeResult) => void): void;
    onBegin(handler: IBeginDialogHandler): this;
    on(intent: string, dialogId: string | IDialogWaterfallStep[] | IDialogWaterfallStep, dialogArgs?: any): this;
    onDefault(dialogId: string | IDialogWaterfallStep[] | IDialogWaterfallStep, dialogArgs?: any): this;
}
