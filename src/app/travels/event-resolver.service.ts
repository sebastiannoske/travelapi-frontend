import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import {
    Resolve,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router
} from '@angular/router';
import { EventHead } from './interfaces/_index';
import { EventRepository } from './event-repository.service';

@Injectable()
export class EventResolver implements Resolve<EventHead> {
    constructor(
        private _router: Router,
        private _eventRepository: EventRepository
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
        this._eventRepository.setup(id);
        return this._eventRepository.event
            .map(event => {
                if (event) {
                    return event;
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
