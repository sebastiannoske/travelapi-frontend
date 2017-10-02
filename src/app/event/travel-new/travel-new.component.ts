import { Component, OnInit } from '@angular/core';
import {
    FormGroup,
    FormControl,
    FormBuilder,
    Validators,
    AbstractControl
} from '@angular/forms';

import { TravelSubmission } from '../classes/_index';

@Component({
    selector: 'app-travel-new',
    templateUrl: './travel-new.component.html',
    styleUrls: ['./travel-new.component.scss']
})
export class TravelNewComponent implements OnInit {
    travel: TravelSubmission = new TravelSubmission();
    travelForm: FormGroup;
    activeStep = 1;
    constructor(private _fb: FormBuilder) {}

    ngOnInit(): void {
        this.travelForm = this._fb.group({
            steps: this._fb.array([
                this._fb.group({
                    travelType: [
                        <'offer' | 'request'>'offer',
                        [Validators.required]
                    ]
                }),
                this._fb.group({
                    userName: ['', [Validators.required]],
                    userAddress: ['', [Validators.required]],
                    userPostCode: ['', [Validators.required]],
                    userCity: ['', [Validators.required]],
                    userPhoneNumber: ['', [Validators.required]]
                    // userEmail: this._fb.group(
                    //     {
                    //         email: [
                    //             '',
                    //             [Validators.required, Validators.email]
                    //         ],
                    //         confirmEmail: ['', Validators.required]
                    //     },
                    //     { validator: this.emailMatcher }
                    // )
                })
            ])
        });
    }

    save(): void {
        console.log(this.travelForm);
        console.log('Saved: ' + JSON.stringify(this.travelForm.value));
    }

    validateText(formControl: FormControl): boolean {
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
}
