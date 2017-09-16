import { Contact, TransportationMean, TravelType } from './_index';
export interface Travel {
  city: String;
  contact: Contact;
  departure_time: String;
  id: Number;
  lat: Number;
  link: null | String;
  long: Number;
  offer: null | TravelType;
  postcode: String;
  request: null | TravelType;
  stopover: any[];
  street_adress: String;
  transportation_mean: TransportationMean;
  url_token: String;
}
