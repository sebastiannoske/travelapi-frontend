import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as _ from 'lodash';

import { EventDataService } from './event-data.service';

import {
    Event,
    EventHead,
    Travel,
    Destination,
    TransportationMean
} from './interfaces/_index';
import { TravelSubmission } from './classes/_index';

@Injectable()
export class EventRepository {
    private _event: Event;

    constructor(private _eventDataService: EventDataService) {}

    public set event(event: Event) {
        this._event = event;
    }

    public get eventHead(): EventHead {
        return {
            offers_total: this.offers.length,
            requests_total: this.requests.length,
            imagePath: this._event.imagePath,
            campaignText: this._event.campaignText
        };
    }
    public get travels(): Travel[] {
        return this._event.destinations
            .map(destination => destination.travel)
            .reduce((travels, current) => travels.concat(current));
    }
    public get requests(): Travel[] {
        return this.travels.filter(travel => travel.request);
    }
    public get offers(): Travel[] {
        return this.travels.filter(travel => travel.offer);
    }
    public getDestinations(travels?: Travel[]): Destination[] {
        // if (travels) { // KAT
        //     return _.uniqWith(
        //         travels.map(travel => travel.destination),
        //         _.isEqual
        //     );
        // }
        return this._event.destinations.map(destination => {
            return {
                date: destination.date,
                event_id: destination.event_id,
                id: destination.id,
                name: destination.name,
                long: destination.long,
                lat: destination.lat,
            };
        });
    }
    public getTransportationMeans(): TransportationMean[] {
        // return _.uniqWith(
        //     this.travels.map(travel => travel.transportation_mean),
        //     _.isEqual
        // );

        // TODO replace with server data
        return [
            {
                id: 1,
                name: 'Auto'
            },
            {
                id: 2,
                name: 'Bus'
            },
            {
                id: 3,
                name: 'Zug'
            },
            {
                id: 4,
                name: 'Fahrrad'
            },
            {
                id: 5,
                name: 'Fußgänger'
            },
            {
                id: 6,
                name: 'Sonstige'
            }
        ];
    }

    public addSubmission(travelSubmission: TravelSubmission): Observable<any> {
        return this._eventDataService.submitTravel(travelSubmission);
    }

    public addContactSubmission(formData: any): Observable<any> {
        return this._eventDataService.submitContact(formData);
    }
}
