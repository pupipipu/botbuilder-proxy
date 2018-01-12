import { Prompt, IPromptFeatures, IPromptOptions } from './Prompt';
export interface IPromptTextOptions extends IPromptOptions {
    /** (Optional) minimum value that can be recognized. */
    minLength?: number;
    /** (Optional) maximum value that can be recognized. */
    maxLength?: number;
}
export interface IPromptTextFeatures extends IPromptFeatures {
    /** (Optional) The score that should be returned when the prompts `onRecognize()` handler is called. The default value is "0.5". */
    recognizeScore?: number;
}
export declare class PromptText extends Prompt<IPromptTextFeatures> {
    constructor(features?: IPromptTextFeatures);
}
