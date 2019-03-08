import { Travel } from './_index';
export interface Destination {
    id: number;
    date: string;
    event_id: number;
    name: string;
    pin_color?: string;
    travel?: Travel[];
    long?: number;
    lat?: number;
}
