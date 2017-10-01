import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { TravelSubmission } from '../classes/_index';

@Component({
    selector: 'app-travel-new',
    templateUrl: './travel-new.component.html',
    styleUrls: ['./travel-new.component.scss']
})
export class TravelNewComponent implements OnInit {
    travel: TravelSubmission = new TravelSubmission();
    travelForm: FormGroup;
    constructor() {}

    ngOnInit(): void {
        this.travelForm = new FormGroup({
            firstName: new FormControl(),
            lastName: new FormControl()
        });
    }

    save(): void {
        console.log(this.travelForm);
        console.log('Saved: ' + JSON.stringify(this.travelForm.value));
    }
}
