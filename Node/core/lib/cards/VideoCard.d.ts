import { Session } from '../Session';
import { MediaCard } from './MediaCard';
export declare class VideoCard extends MediaCard {
    constructor(session?: Session);
    aspect(text: string | string[], ...args: any[]): this;
}
