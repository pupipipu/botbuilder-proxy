import { IntentRecognizer, IRecognizeContext, IIntentRecognizerResult } from './IntentRecognizer';
export interface IRegExpMap {
    [local: string]: RegExp;
}
export declare class RegExpRecognizer extends IntentRecognizer {
    intent: string;
    private expressions;
    constructor(intent: string, expressions: RegExp | IRegExpMap);
    onRecognize(context: IRecognizeContext, cb: (err: Error, result: IIntentRecognizerResult) => void): void;
}
