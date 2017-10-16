import { Component, OnInit, ViewChild  } from '@angular/core';
import {
    trigger,
    state,
    style,
    transition,
    animate,
    keyframes
} from '@angular/animations';
import {
    FormGroup,
    FormControl,
    FormArray,
    FormBuilder,
    Validators,
    AbstractControl
} from '@angular/forms';
import 'rxjs/add/operator/debounceTime';
import { EventRepository } from '../event-repository.service';
import { TravelSubmission, FormViewState } from '../classes/_index';
import { TransportationMean, Destination } from '../interfaces/_index';
import { DateAdapter, NativeDateAdapter } from '@angular/material';
import { AgmMap, GoogleMapsAPIWrapper, MapsAPILoader } from '@agm/core';

import * as moment from 'moment';
declare var google: any;

@Component({
    selector: 'app-travel-new',
    templateUrl: './travel-new.component.html',
    styleUrls: ['./travel-new.component.scss'],
    providers: [GoogleMapsAPIWrapper],
    animations: [
        trigger('viewChange', [
            state('rightin', style({ transform: 'translateY(0)' })),
            transition('void => rightin', [
                style({ transform: 'translateX(50px)', opacity: 0 }),
                animate('.3s ease')
            ]),
            state('leftin', style({ transform: 'translateY(0)' })),
            transition('void => leftin', [
                style({ transform: 'translateX(-50px)', opacity: 0 }),
                animate('.3s ease')
            ])
        ])
    ]
})
export class TravelNewComponent implements OnInit {
    @ViewChild(AgmMap) myMap: AgmMap;
    travel: TravelSubmission;
    travelForm: FormGroup;
    transportationMeans: TransportationMean[];
    destinations: Destination[];
    steps: FormViewState;
    departureHours: number[];
    departureMinutes: number[];
    position: { lat: number; lng: number };
    mapZoom: number;
    transportationMeansByDBOrder: any; // TODO
    inProgress: boolean;
    submissionSucceed: boolean;
    distance: number;

    constructor(
        private _fb: FormBuilder,
        private _eventRepository: EventRepository,
        private _dateAdapter: DateAdapter<NativeDateAdapter>,
        private _GoogleMapsAPIWrapper: GoogleMapsAPIWrapper,
        private _loader: MapsAPILoader
    ) {
        _dateAdapter.setLocale('de-DE');
    }

    ngOnInit(): void {
        this.destinations = this._eventRepository.getDestinations();
        this.transportationMeans = this._eventRepository.getTransportationMeans();
        this.departureHours = Array.from(Array(24).keys());
        this.departureMinutes = Array.from(Array(12), (_, x) => x * 5);
        this.position = { lat: 51, lng: 9 };
        this.mapZoom = 5;
        this.inProgress = false;
        this.submissionSucceed = false;
        this.transportationMeansByDBOrder = {
            1: 'Auto',
            2: 'Bus',
            3: 'Zug',
            4: 'Fahrrad',
            5: 'Fußgänger',
            6: 'Sonstige'
        };
        this.distance = 0;
        this.travelForm = this._fb.group({
            steps: this._fb.array([
                this._fb.group({
                    travelType: [
                        <'offer' | 'request'>'offer',
                        Validators.required
                    ]
                }),
                this._fb.group({
                    userName: ['', Validators.required],
                    userAddress: ['', Validators.required],
                    userPostCode: ['', Validators.required],
                    userCity: ['', Validators.required],
                    userPhoneNumber: ['', Validators.required],
                    userEmail: this._fb.group(
                        {
                            email: ['', Validators.email],
                            confirmEmail: ['', Validators.email]
                        },
                        { validator: this.emailMatcher }
                    )
                }),
                this._fb.group({
                    organisation: '',
                    contactName: ['', Validators.required],
                    phoneNumber: ['', Validators.required],
                    contactEmail: ['', Validators.email]
                }),
                this._fb.group({
                    streetAddress: ['', Validators.required],
                    postcode: ['', Validators.required],
                    city: ['', Validators.required],
                    lat: null,
                    long: null
                }),
                this._fb.group({
                    destinationId: [null, Validators.required],
                    transportationMeanId: [null, Validators.required],
                    departureDate: ['', Validators.required],
                    departureHour: [null, Validators.required],
                    departureMinute: [null, Validators.required],
                    description: ''
                })
            ])
        });

        this.debounceValidation(
            this.travelForm.get('steps.1.userEmail.email'),
            this.travelForm.get('steps.2.contactEmail')
        );

        this.steps = new FormViewState(
            (<FormArray>this.travelForm.controls.steps).length
        );
    }

    debounceValidation(
        ...controls: Array<FormGroup | FormControl | AbstractControl>
    ): void {
        controls.forEach(control => {
            control.valueChanges.debounceTime(1000).subscribe(() => {
                (<any>control).validDebounced = !control.valid;
            });
        });
    }

    convertDatetime(date: string, hour: string, minute: string): string {
        return moment(this.travelForm.value.steps[4].departureDate)
            .add(this.travelForm.value.steps[4].departureHour, 'hours')
            .add(this.travelForm.value.steps[4].departureMinute, 'minutes')
            .format('YYYY-MM-DD hh:mm:ss');
    }

    save(): void {
        this.inProgress = true;
        const travelFormData = this.travelForm.value.steps;
        this.travel = new TravelSubmission(
            {
                city: travelFormData[3].city,
                contactEmail: travelFormData[2].contactEmail,
                contactName: travelFormData[2].contactName,
                cost: 0,
                departureTime: this.convertDatetime(
                    this.travelForm.value.steps[4].departureDate,
                    this.travelForm.value.steps[4].departureHour,
                    this.travelForm.value.steps[4].departureMinute
                ),
                description: travelFormData[4].description,
                lat: travelFormData[3].lat,
                link: '',
                long: travelFormData[3].long,
                distance: this.distance,
                organisation: travelFormData[2].organisation,
                phoneNumber: travelFormData[2].phoneNumber,
                passenger: 1,
                postcode: travelFormData[3].postcode,
                streetAddress: travelFormData[3].streetAddress,
                transportationMeanId: travelFormData[4].transportationMeanId,
                travelType: travelFormData[0].travelType,
                userAddress: travelFormData[1].userAddress,
                userEmail: travelFormData[1].userEmail.email,
                userCity: travelFormData[1].userCity,
                userName: travelFormData[1].userName,
                userPhoneNumber: travelFormData[1].userPhoneNumber,
                userPostCode: travelFormData[1].userPostCode
            },
            travelFormData[4].destinationId
        );
        this._eventRepository.addSubmission(this.travel)
            .subscribe(response => {
                if (response.status === 'success') {
                    this.submissionSucceed = true;
                }
            });
    }

    getDepartureTime(): string {
        const travelFormData = this.travelForm.value.steps;

        return this.convertDatetime(
            this.travelForm.value.steps[4].departureDate,
            this.travelForm.value.steps[4].departureHour,
            this.travelForm.value.steps[4].departureMinute
        );
    }

    getSelectedDestination(id: number): string {
        return this.destinations.find((destination) => {
            return destination.id == id;
        }).name;
    }

    validate(formControl: FormControl): boolean {
        return (formControl.touched || formControl.dirty) && !formControl.valid;
    }

    emailMatcher(c: AbstractControl): { [key: string]: boolean } | null {
        const emailControl = c.get('email');
        const confirmControl = c.get('confirmEmail');

        if (emailControl.pristine || confirmControl.pristine) {
            return null;
        }

        if (emailControl.value === confirmControl.value) {
            return null;
        }
        return { match: true };
    }

    populateTestData(): void {
        this.travelForm.setValue({
            steps: [
                { travelType: 'offer' },
                {
                    userName: 'John Doe',
                    userAddress: 'Am Kotti 0',
                    userPostCode: '12345',
                    userCity: 'Berlin',
                    userPhoneNumber: '+49 123 456789',
                    userEmail: {
                        email: 'travelapi-frontend-mock@getnada.com',
                        confirmEmail: 'travelapi-frontend-mock@getnada.com'
                    }
                },
                {
                    organisation: 'Mock GbR',
                    contactName: 'John Doe',
                    phoneNumber: '+49 123 456789',
                    contactEmail: 'travelapi-frontend-mock@getnada.com'
                },
                {
                    streetAddress: 'Am Kotti 0',
                    postcode: '12345',
                    city: 'Berlin',
                    lat: 51,
                    long: 9
                },
                {
                    destinationId: this.destinations.find(() => true).id,
                    transportationMeanId: this.transportationMeans.find(
                        () => true
                    ).id,
                    departureDate: '2017-12-31T23:00:00.000Z',
                    departureHour: '12',
                    departureMinute: '0',
                    description: `Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.
                        Aenean massa.Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
                        Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim.
                        Donec pede justo, fringilla vel, aliquet nec, vulputate`
                }
            ]
        });
    }

    get slide(): string {
        if (isNaN(this.steps.last)) {
            return;
        }

        return this.steps.current < this.steps.last ? 'leftin' : 'rightin';
    }

    markerDragEndEvent(event: any): void {
        this.position = { lat: event.coords.lat, lng: event.coords.lng };

        this.travelForm
        .get('steps.3.lat')
        .patchValue(event.coords.lat);

        this.travelForm
        .get('steps.3.long')
        .patchValue(event.coords.lng);
    }

    googlePlacesAddressHandler(event: any): void {
        this.position = { lat: event.lat, lng: event.lng };
        this.mapZoom = 16;
        this.myMap.triggerResize(true);

        this.travelForm
        .get('steps.3.lat')
        .patchValue(event.lat);

        this.travelForm
        .get('steps.3.long')
        .patchValue(event.lng);

        this.travelForm
            .get('steps.3.streetAddress')
            .patchValue(
                `${event.addressFields.street} ${event.addressFields
                    .streetNumber}`
            );
        this.travelForm
            .get('steps.3.postcode')
            .patchValue(event.addressFields.postcode);
        this.travelForm
            .get('steps.3.city')
            .patchValue(event.addressFields.city);
    }

    getDistance() {
        const travelFormData = this.travelForm.value.steps;

        this._loader.load().then(() => {
            const nyc = new google.maps.LatLng(this.position.lat, this.position.lng);
            console.log(this.position.lng);
            console.log(this.position.lat);
            const bonn = new google.maps.LatLng(50.7035559, 7.047089);
            const distance = google.maps.geometry.spherical.computeDistanceBetween(nyc, bonn);
            this.distance = distance;
        });
    }
}
