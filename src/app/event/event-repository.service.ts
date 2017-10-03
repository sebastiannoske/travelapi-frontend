import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';

import { EventDataService } from './event-data.service';

import {
    Event,
    EventHead,
    Travel,
    Destination,
    TransportationMean
} from './interfaces/_index';

@Injectable()
export class EventRepository {
    private _event: Event;

    constructor() {}

    public set event(event: Event) {
        this._event = event;
    }

    public get eventHead(): EventHead {
        return {
            offers_total: this.offers.length,
            requests_total: this.requests.length
        };
    }
    public get travels(): Travel[] {
        return this._event
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
        if (travels) {
            return _.uniqWith(
                travels.map(travel => travel.destination),
                _.isEqual
            );
        }
        return this._event.map(destination => {
            return {
                date: destination.date,
                event_id: destination.event_id,
                id: destination.id,
                name: destination.name
            };
        });
    }
    public getTransportationMeans(): TransportationMean[] {
        return _.uniqWith(
            this.travels.map(travel => travel.transportation_mean),
            _.isEqual
        );
    }
}
