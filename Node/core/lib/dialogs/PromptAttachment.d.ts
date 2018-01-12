import { Prompt, IPromptFeatures, IPromptOptions } from './Prompt';
export interface IPromptAttachmentOptions extends IPromptOptions {
    /** (Optional) list of content types the prompt is waiting for. Types ending with '*' will be prefixed matched again the received attachment(s). */
    contentTypes?: string | string[];
}
export interface IPromptAttachmentFeatures extends IPromptFeatures {
    /** (Optional) The score that should be returned when attachments are detected. The default value is "1.0". */
    recognizeScore?: number;
}
export declare class PromptAttachment extends Prompt<IPromptAttachmentFeatures> {
    constructor(features?: IPromptAttachmentFeatures);
    private allowed(attachment, contentTypes?);
}
