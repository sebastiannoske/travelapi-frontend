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

@Injectable()
export class EventDataService {
  private _eventsUrl = './assets/api/events/';
  private _headers: HttpHeaders;

  constructor(private _http: HttpClient) {
    this._headers = new HttpHeaders()
      .set(
        'Authorization',
        'Bearer Z1eGeEnFkGmrHeZthoTb8EJqKbb7DuRohcSeAoBzHlSn9Atf3QVujgbIHMSf'
      )
      .append('Content-Type', 'application/x-www-form-urlencoded')
      .append('Accept', 'application/json');
  }

  getEvent(id: number): Observable<any> {
    const url = `${this._eventsUrl}${id}.json`;
    return this._http
      .get<any>(url, {
        headers: this._headers
      })
      .map((event: any) => event.data)
      .catch(this.handleError);
  }
  private handleError(err: HttpErrorResponse) {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage = '';
    if (err.error instanceof Error) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }
    console.error(errorMessage);
    return Observable.throw(errorMessage);
  }
}
