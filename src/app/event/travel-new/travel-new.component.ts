import { Component, OnInit } from '@angular/core';
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
// import * as moment from 'moment';

@Component({
    selector: 'app-travel-new',
    templateUrl: './travel-new.component.html',
    styleUrls: ['./travel-new.component.scss'],
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
    travel: TravelSubmission = new TravelSubmission();
    travelForm: FormGroup;
    transportationMeans: TransportationMean[];
    destinations: Destination[];
    steps: FormViewState;
    test = false;
    constructor(
        private _fb: FormBuilder,
        private _eventRepository: EventRepository
    ) { }

    ngOnInit(): void {
        this.destinations = this._eventRepository.getDestinations();
        this.transportationMeans = this._eventRepository.getTransportationMeans();
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
                    city: ['', Validators.required]
                }),
                this._fb.group({
                    destinationId: [null, Validators.required],
                    transportationMeanId: [null, Validators.required],
                    departureTime: ['', Validators.required],
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

    onChange(src: string) {
        console.log(src);
    }

    save(): void {
        console.log(this.travelForm);
        console.log('Saved: ' + JSON.stringify(this.travelForm.value));
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

    public get slide(): string {
        if (isNaN(this.steps.last)) {
            return;
        }
        return this.steps.current < this.steps.last ? 'leftin' : 'rightin';
    }
}
