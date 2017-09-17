import { Travel } from './_index';
export interface Destination {
    date: string;
    event_id: number;
    name: string;
    travel: Travel[];
}
