import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpErrorResponse,
    HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Event, EventRaw } from './interfaces/_index';
import { TravelSubmission } from './classes/_index';

@Injectable()
export class EventDataService {
    private _eventsUrl = 'https://mfz.g20-protestwelle.de/api';
    private _headers: HttpHeaders;

    constructor(private _http: HttpClient) {
        this._headers = this.getHttpHeaders();
    }

    private getHttpHeaders(): HttpHeaders {
        return new HttpHeaders()
            .set(
                'Authorization',
                'Bearer sUrv1fKJWWEsTMgoVTkOZc1bVQkiDj9tWlqN4jSBPrGxRKkb3tFSCMqH3mlE'
            )
            .append('Content-Type', 'application/json')
            .append('Accept', 'application/json');
    }

    public fetchEvent(id: number): Observable<Event> {
        const url = `${this._eventsUrl}/events/${id}/travel`;
        return this._http
            .get<EventRaw>(url, {
                headers: this._headers
            })
            .map((event: EventRaw) => {
                event.data.forEach(destination =>
                    destination.travel.forEach(
                        travel =>
                            (travel.destination = {
                                date: destination.date,
                                event_id: destination.event_id,
                                id: destination.id,
                                name: destination.name
                            })
                    )
                );
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

    public submitTravel(travelSubmission: TravelSubmission): Observable<any> {
        const url = `${this
            ._eventsUrl}/destinations/${travelSubmission.destinationId}/travel`;

        console.log(url);
        console.log(travelSubmission.submitData);

        return this._http
            .post(url, travelSubmission.submitData, {
                headers: this._headers
            })
            .do(data => console.log('createTravel: ' + JSON.stringify(data)))
            .catch(this.handleError);
    }
}
