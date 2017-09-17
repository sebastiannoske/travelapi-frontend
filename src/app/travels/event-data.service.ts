import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpErrorResponse,
    HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Event, EventRaw } from './interfaces/_index';

@Injectable()
export class EventDataService {
    private _eventsUrl = './assets/api/events/';
    private _headers: HttpHeaders;

    constructor(private _http: HttpClient) {
        this._headers = this.getHttpHeaders();
    }

    private getHttpHeaders(): HttpHeaders {
        return new HttpHeaders()
            .set(
                'Authorization',
                'Bearer Z1eGeEnFkGmrHeZthoTb8EJqKbb7DuRohcSeAoBzHlSn9Atf3QVujgbIHMSf'
            )
            .append('Content-Type', 'application/x-www-form-urlencoded')
            .append('Accept', 'application/json');
    }

    public fetchEvent(id: number): Observable<Event> {
        const url = `${this._eventsUrl}${id}.json`;
        return this._http
            .get<EventRaw>(url, {
                headers: this._headers
            })
            .map((event: EventRaw) => {
                const test = event.data.map(destination =>
                    destination.travel.map((travel, index) => {
                        travel.destination = {
                            date: destination.date,
                            event_id: destination.event_id,
                            name: destination.name
                        };
                        return travel;
                    })
                );
                console.log(test);
                return event.data;
            })
            .catch(this.handleError);
    }

    private handleError(err: HttpErrorResponse) {
        let errorMessage = '';
        if (err.error instanceof Error) {
            errorMessage = `An error occurred: ${err.error.message}`;
        } else {
            errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
        }
        console.error(errorMessage);
        return Observable.throw(errorMessage);
    }
}
