import { IntentRecognizer, IRecognizeContext, IIntentRecognizerResult } from './IntentRecognizer';
export declare class LocalizedRegExpRecognizer extends IntentRecognizer {
    private intent;
    private key;
    private namespace;
    private recognizers;
    constructor(intent: string, key: string, namespace?: string);
    onRecognize(context: IRecognizeContext, callback: (err: Error, result: IIntentRecognizerResult) => void): void;
}
