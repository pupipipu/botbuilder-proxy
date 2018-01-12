import { Dialog } from './Dialog';
import { Session } from '../Session';
export declare class SimpleDialog extends Dialog {
    private fn;
    constructor(fn: (session: Session, args?: any) => void);
    begin<T>(session: Session, args?: T): void;
    replyReceived(session: Session): void;
    dialogResumed(session: Session, result: any): void;
}
