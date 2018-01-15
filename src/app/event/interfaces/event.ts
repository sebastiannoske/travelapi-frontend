import { Destination } from './_index';
export interface Event {
    campaignText: string;
    destinations: Destination[];
    id: number;
    imagePath: string;
    name: string;
}
