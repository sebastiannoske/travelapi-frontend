import { Contact, TransportationMean, TravelType, Destination } from './_index';
export interface Travel {
    city: string;
    contact: Contact;
    departure_time: string;
    id: number;
    lat: number;
    link: null | string;
    long: number;
    offer: null | TravelType;
    postcode: string;
    request: null | TravelType;
    stopover: any[];
    street_address: string;
    transportation_mean: TransportationMean;
    url_token: string;
    destination?: Destination;
    description?: string;
    distance: number;
}
