import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    Resolve,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router
} from '@angular/router';
import { EventHead } from './interfaces/_index';
import { EventRepository } from './event-repository.service';
import { EventDataService } from './event-data.service';

@Injectable()
export class EventResolver implements Resolve<EventHead> {
    constructor(
        private _router: Router,
        private _eventRepository: EventRepository,
        private _eventDataService: EventDataService
    ) {}

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<EventHead> {
        const id = route.params['id'];
        if (isNaN(+id)) {
            console.log(`Event id was not a number: ${id}`);
            this._router.navigate(['/']);
            return Observable.of(null);
        }
        return this._eventDataService
            .fetchEvent(id)
            .map(event => {
                if (event) {
                    this._eventRepository.event = event;
                    return this._eventRepository.eventHead;
                }
                console.log(`Event was not found: ${id}`);
                this._router.navigate(['/']);
                return null;
            })
            .catch(error => {
                console.log(`Retrieval error: ${error}`);
                this._router.navigate(['/']);
                return Observable.of(null);
            });
    }
}
