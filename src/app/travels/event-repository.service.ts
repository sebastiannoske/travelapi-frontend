import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';

import { EventDataService } from './event-data.service';

import { Event, EventHead, Travel, Destination } from './interfaces/_index';

@Injectable()
export class EventRepository {
    private _event: Observable<Event>;
    constructor(private _eventDataService: EventDataService) {}
    public setup(id: number): void {
        this._event = this._eventDataService.fetchEvent(id);
    }
    public get event(): Observable<Event> {
        return this._event;
    }
    public get eventHead(): Observable<EventHead> {
        return Observable.of(null);
    }
}
