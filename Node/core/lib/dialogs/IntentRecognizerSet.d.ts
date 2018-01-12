import { IntentRecognizer, IIntentRecognizer, IRecognizeContext, IIntentRecognizerResult } from './IntentRecognizer';
export declare enum RecognizeOrder {
    parallel = 0,
    series = 1,
}
export interface IIntentRecognizerSetOptions {
    intentThreshold?: number;
    recognizeOrder?: RecognizeOrder;
    recognizers?: IIntentRecognizer[];
    processLimit?: number;
    stopIfExactMatch?: boolean;
}
export declare class IntentRecognizerSet extends IntentRecognizer {
    private options;
    length: number;
    constructor(options?: IIntentRecognizerSetOptions);
    clone(copyTo?: IntentRecognizerSet): IntentRecognizerSet;
    onRecognize(context: IRecognizeContext, done: (err: Error, result: IIntentRecognizerResult) => void): void;
    recognizer(plugin: IIntentRecognizer): this;
    private recognizeInParallel(context, done);
    private recognizeInSeries(context, done);
}
