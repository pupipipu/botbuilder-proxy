import { Session } from '../Session';
import { IRecognizeContext, IRecognizeResult, IIntentRecognizerResult } from './IntentRecognizer';
import { ActionSet } from './ActionSet';
export declare enum ResumeReason {
    completed = 0,
    notCompleted = 1,
    canceled = 2,
    back = 3,
    forward = 4,
    reprompt = 5,
}
export interface IDialogResult<T> {
    resumed: ResumeReason;
    childId?: string;
    error?: Error;
    response?: T;
}
export interface IRecognizeDialogContext extends IRecognizeContext {
    activeDialog: boolean;
    intent?: IIntentRecognizerResult;
}
export declare abstract class Dialog extends ActionSet {
    begin<T>(session: Session, args?: T): void;
    abstract replyReceived(session: Session, recognizeResult?: IRecognizeResult): void;
    dialogResumed<T>(session: Session, result: IDialogResult<T>): void;
    recognize(context: IRecognizeDialogContext, cb: (err: Error, result: IRecognizeResult) => void): void;
}
