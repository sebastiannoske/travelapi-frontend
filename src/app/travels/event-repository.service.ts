import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { EventDataService } from './event-data.service';

import { Event, EventHead, Travel, Destination } from './interfaces/_index';

@Injectable()
export class EventRepository {
    private _event: Event;
    private _;

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
    public get requests(): Travel[] {
        return this._event
            .map(destination => destination.travel)
            .reduce((travels, current) => {
                return travels.concat(
                    current.filter(travel => {
                        return travel.request !== null;
                    })
                );
            });
    }
    public get offers(): Travel[] {
        return this._event
            .map(destination => destination.travel)
            .reduce((travels, current) => {
                return travels.concat(
                    current.filter(travel => {
                        return travel.offer !== null;
                    })
                );
            });
    }
}
