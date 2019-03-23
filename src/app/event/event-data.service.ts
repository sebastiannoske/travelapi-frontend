
import { throwError as observableThrowError, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpErrorResponse,
    HttpHeaders
} from '@angular/common/http';




import { Event, EventRaw } from './interfaces/_index';
import { TravelSubmission } from './classes/_index';

@Injectable()
export class EventDataService {
    private _eventsUrl = 'https://api2.lesscars.io/api';
    // 'https://mfz.klima-kohle-demo.de/api';
    // 'https://mfz.wir-haben-es-satt.de/api'; equeals: 'https://mfzapi.bassliner.org/api';
     // 'http://travel-api.test/api'; // 'https://api2.lesscars.io/api'
    private _headers: HttpHeaders;

    constructor(private _http: HttpClient) {
        this._headers = this.getHttpHeaders();
    }

    private getHttpHeaders(): HttpHeaders {
        return new HttpHeaders()
            .set(
                'Authorization',
                'Bearer xFhQsoqlboBFAX7ENajMJaMkKjS53X8MirvuIbUOg35J8DKT3bQe3Kr5wue5'
            )
            .append('Content-Type', 'application/json')
            .append('Accept', 'application/json');
    }

    public fetchEvent(id: number): Observable<Event> {
        const url = `${this._eventsUrl}/events/${id}`;
        // const url = '/assets/api/events/5.json';
        return this._http
            .get<EventRaw>(url, {
                headers: this._headers
            })
            .map((event: EventRaw) => {
                event.data.destinations.forEach(destination =>
                    destination.travel.forEach(
                        travel =>
                            (travel.destination = {
                                date: destination.date,
                                event_id: destination.event_id,
                                id: destination.id,
                                pin_color: destination.pin_color,
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
        return observableThrowError(errorMessage);
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

    public submitContact(formData: any): Observable<any> {
        const url = `${this
            ._eventsUrl}/sendmail`;

        return this._http
            .post(url, formData, {
                headers: this._headers
            })
            .do(data => console.log('createTravel: ' + JSON.stringify(data)))
            .catch(this.handleError);
    }
}
