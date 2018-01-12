import { Prompt, IPromptOptions, IPromptFeatures } from './Prompt';
export interface IPromptNumberOptions extends IPromptOptions {
    /** (Optional) minimum value that can be recognized. */
    minValue?: number;
    /** (Optional) maximum value that can be recognized. */
    maxValue?: number;
    /** (Optional) if true, then only integers will be recognized. */
    integerOnly?: boolean;
}
export declare class PromptNumber extends Prompt<IPromptFeatures> {
    constructor(features?: IPromptFeatures);
}
