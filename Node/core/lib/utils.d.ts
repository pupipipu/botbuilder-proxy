export declare function clone(obj: any): any;
export declare function copyTo(frm: any, to: any): void;
export declare function copyFieldsTo(frm: any, to: any, fields: string): void;
export declare function moveFieldsTo(frm: any, to: any, fields: {
    [id: string]: string;
}): void;
export declare function toDate8601(date: Date): string;
