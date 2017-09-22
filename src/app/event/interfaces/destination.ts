import { Travel } from './_index';
export interface Destination {
    id: number;
    date: string;
    event_id: number;
    name: string;
    travel?: Travel[];
}
