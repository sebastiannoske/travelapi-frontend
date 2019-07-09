import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    trigger,
    state,
    style,
    transition,
    animate
} from '@angular/animations';
import {
    FormGroup,
    FormControl,
    FormArray,
    FormBuilder,
    Validators,
    AbstractControl
} from '@angular/forms';

import { EventRepository } from '../event-repository.service';
import { TravelSubmission, FormViewState } from '../classes/_index';
import { TransportationMean, Destination } from '../interfaces/_index';
import { DateAdapter, NativeDateAdapter } from '@angular/material';
import { AgmMap, GoogleMapsAPIWrapper, MapsAPILoader } from '@agm/core';
import { debounceTime } from 'rxjs/operators';

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
                style({ transform: 'translateX(30px)', opacity: 0 }),
                animate('.3s ease')
            ]),
            state('leftin', style({ transform: 'translateY(0)' })),
            transition('void => leftin', [
                style({ transform: 'translateX(-30px)', opacity: 0 }),
                animate('.3s ease')
            ])
        ])
    ]
})
export class TravelNewComponent implements OnInit {
    @ViewChild(AgmMap) myMap: AgmMap;
    @ViewChild('travelform') travelFormWrap: ElementRef;
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
    distanceObject: any;
    distance: number;
    mapStyles: any[];
    latlngBounds: any;
    headlines: any;

    constructor(
        private _fb: FormBuilder,
        private _eventRepository: EventRepository,
        private _dateAdapter: DateAdapter<NativeDateAdapter>,
        private _changeDetector: ChangeDetectorRef,
        private _loader: MapsAPILoader,
        private _http: HttpClient
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
        this.headlines = {
            1: 'Account für die Mitfahrbörse anlegen.',
            2: 'Kontaktdaten hinterlegen.',
            3: 'Abfahrtsort auswählen.',
            4: { offer: 'Mitfahrgelegenheit anbieten', request: 'Gesuch eintragen' },
            5: 'Zusammenfassung'
        };
        this.distance = 0;
        this.distanceObject = null;
        this.travelForm = this._fb.group({
            steps: this._fb.array([
                this._fb.group({
                    travelType: [
                        <'offer' | 'request'>'offer',
                        Validators.required
                    ],
                    destinationId: ['1', Validators.required]
                }),
                this._fb.group({
                    userName: ['', Validators.required],
                    /* userAddress: ['', Validators.required],
                    userPostCode: ['', Validators.required],
                    userCity: ['', Validators.required],
                    userPhoneNumber: ['', Validators.required], */
                    userEmail: this._fb.group(
                        {
                            email: [
                                '',
                                {
                                    updateOn: 'blur',
                                    validators: [Validators.email]
                                }
                            ],
                            confirmEmail: [
                                '',
                                {
                                    updateOn: 'blur',
                                    validators: [Validators.email]
                                }
                            ]
                        },
                        { validator: this.emailMatcher }
                    )
                }),
                this._fb.group({
                    organisation: '',
                    contactName: ['', Validators.required],
                    travelContact: this._fb.group({
                        phoneNumber: ['', Validators.required],
                        contactEmail: [
                            '',
                            { updateOn: 'blur', validators: [Validators.email] }
                        ]
                    })
                }),
                this._fb.group({
                    streetAddress: ['', Validators.required],
                    postcode: ['', Validators.required],
                    city: ['', Validators.required],
                    lat: null,
                    long: null
                }),
                this._fb.group({
                    transportationMeanId: [null, Validators.required],
                    departureDate: ['', Validators.required],
                    departureHour: [null, Validators.required],
                    departureMinute: [null, Validators.required],
                    description: ''
                })
            ])
        });

        this._http.get('assets/mapstyles/mapstyles.json').subscribe(data => {
            this.mapStyles = <any[]>data;
        });

        // this.debounceValidation(
        //     this.travelForm.get('steps.1.userEmail.email'),
        //     this.travelForm.get('steps.2.travelContact.contactEmail')
        // );

        this.validateTravelContact(
            this.travelForm.get('steps.2.travelContact')
        );

        this.steps = new FormViewState(
            (<FormArray>this.travelForm.controls.steps).length
        );
    }

    debounceValidation(
        ...controls: Array<FormGroup | FormControl | AbstractControl>
    ): void {
        controls.forEach(control => {
            control.valueChanges.pipe(debounceTime(1000)).subscribe(() => {
                (<any>control).validDebounced = !control.valid;
            });
        });
    }

    validateTravelContact(c: AbstractControl): void {
        const phoneControl = c.get('phoneNumber');
        const emailControl = c.get('contactEmail');

        phoneControl.valueChanges.subscribe(_ => {
            if (phoneControl.valid) {
                emailControl.clearValidators();
            } else {
                emailControl.setValidators(Validators.email);
            }
            emailControl.updateValueAndValidity({ emitEvent: false });
        });
        emailControl.valueChanges.subscribe(_ => {
            if (emailControl.valid) {
                phoneControl.clearValidators();
            } else {
                phoneControl.setValidators(Validators.required);
            }
            phoneControl.updateValueAndValidity({ emitEvent: false });
        });
    }

    convertDatetime(date: string, hour: string, minute: string): string {
        return moment(this.travelForm.value.steps[4].departureDate)
            .add(this.travelForm.value.steps[4].departureHour, 'hours')
            .add(this.travelForm.value.steps[4].departureMinute, 'minutes')
            .format('YYYY-MM-DD H:mm:ss');
    }

    save(): void {
        if (this.travelForm.valid) {
            this.inProgress = true;
            const travelFormData = this.travelForm.value.steps;

            this.travel = new TravelSubmission(
                {
                    city: travelFormData[3].city,
                    contactEmail: travelFormData[2].travelContact.contactEmail,
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
                    phoneNumber: travelFormData[2].travelContact.phoneNumber,
                    passenger: 1,
                    postcode: travelFormData[3].postcode,
                    streetAddress: travelFormData[3].streetAddress,
                    transportationMeanId:
                        travelFormData[4].transportationMeanId,
                    travelType: travelFormData[0].travelType,
                    userAddress: travelFormData[1].userAddress,
                    userEmail: travelFormData[1].userEmail.email,
                    userCity: travelFormData[1].userCity,
                    userName: travelFormData[1].userName,
                    userPhoneNumber: travelFormData[1].userPhoneNumber,
                    userPostCode: travelFormData[1].userPostCode
                },
                travelFormData[0].destinationId
            );
            this._eventRepository
                .addSubmission(this.travel)
                .subscribe(response => {
                    if (response.status === 'success') {
                        this.submissionSucceed = true;
                        this.travelForm.reset();
                        this.travelForm
                            .get('steps.0.travelType')
                            .patchValue('offer');
                        this.scrollTopAfterNextStep();
                    }
                });
        }
    }

    private markFormGroupAsTouched(c: FormGroup): void {
        Object.keys(c.controls).forEach(key => {
            const ac = c.get(key);
            if (ac instanceof FormGroup) {
                this.markFormGroupAsTouched(ac);
            }
            ac.markAsTouched();
        });
    }

    proceed(event: any, currentSlide: number): boolean {
        if (event.clientX === 0 && event.clientY === 0) {
            return false;
        }
        const formStep = <FormGroup>this.travelForm.get(
            `steps.${currentSlide}`
        );
        if (formStep.valid) {
            this.steps.next();
            this.scrollTopAfterNextStep();
        } else {
            this.markFormGroupAsTouched(formStep);
        }
        return false;
    }

    private scrollTopAfterNextStep() {
        setTimeout(() => {
            if (window['parentIFrame']) {
                window['parentIFrame'].sendMessage({
                    'scrollTo': this.travelFormWrap.nativeElement.getBoundingClientRect().top - 150
                });
            }
        }, 0);
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
        return this.destinations.find(destination => {
            return destination.id === +id;
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
                { travelType: 'offer', destinationId: this.destinations.find(() => true).id },
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

        this.travelForm.get('steps.3.lat').patchValue(event.coords.lat);

        this.travelForm.get('steps.3.long').patchValue(event.coords.lng);
    }

    googlePlacesAddressHandler(event: any): void {
        this.travelForm.get('steps.3.lat').patchValue(event.lat);

        this.travelForm.get('steps.3.long').patchValue(event.lng);

        this.travelForm
            .get('steps.3.streetAddress')
            .patchValue(
                `${event.addressFields.street} ${
                    event.addressFields.streetNumber
                }`
            );
        this.travelForm
            .get('steps.3.postcode')
            .patchValue(event.addressFields.postcode);
        this.travelForm
            .get('steps.3.city')
            .patchValue(event.addressFields.city);

        this.position = { lat: event.lat, lng: event.lng };
        this.mapZoom = 16;
        setTimeout(() => {
            this.myMap.triggerResize(true);
        this._changeDetector.markForCheck();
        }, 0);
    }

    getDistance() {
        const travelFormData = this.travelForm.value.steps;
        const that = this;

        const mapTravelMode = (
            transportationMeanId = this.travelForm.get(
                'steps.4.transportationMeanId'
            ).value
        ): 'BICYCLING' | 'DRIVING' | 'TRANSIT' | 'WALKING' => {
            switch (+transportationMeanId) {
                case 3:
                    return 'TRANSIT';
                case 4:
                    return 'BICYCLING';
                case 5:
                    return 'WALKING';
                default:
                    return 'DRIVING';
            }
        };

        this._loader.load().then(() => {
            const origin = new google.maps.LatLng(
                this.position.lat,
                this.position.lng
            );

            let destinationLat = 0;
            let destinationLong = 0;
            const selectedDestinationId = parseInt(travelFormData[0].destinationId, 10);

            // find selected destination long and lat
            this.destinations.forEach((currentDestination) => {
                if (currentDestination.id === selectedDestinationId) {
                    destinationLat = currentDestination.lat;
                    destinationLong = currentDestination.long;
                }
            });

            const destination = new google.maps.LatLng(destinationLat, destinationLong); // jugend klima demo
            const service = new google.maps.DistanceMatrixService();

            service.getDistanceMatrix(
                {
                    origins: [origin],
                    destinations: [destination],
                    travelMode: mapTravelMode(),
                    unitSystem: google.maps.UnitSystem.METRIC
                },
                callback
            );

            function callback(response, status) {
                // See Parsing the Results for
                // the basics of a callback function.
                that.distance = response.rows[0].elements[0].distance.value; // set distance in m
                that.distanceObject = response;
            }
        });
    }
}
