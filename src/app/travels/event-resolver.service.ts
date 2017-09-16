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
import { EventDataService } from './event-data.service';

@Injectable()
export class EventResolver implements Resolve<any> {
  constructor(
    private _router: Router,
    private _eventDataService: EventDataService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> {
    const id = route.params['id'];
    if (isNaN(+id)) {
      console.log(`Event id was not a number: ${id}`);
      this._router.navigate(['/']);
      return Observable.of(null);
    }
    return this._eventDataService
      .getEvent(+id)
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
