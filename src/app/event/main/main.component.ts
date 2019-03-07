import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { EventHead } from '../interfaces/_index';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
    eventHead: EventHead;
    mobileMenuVisible: boolean;
    constructor(private _route: ActivatedRoute) {
        this.mobileMenuVisible = false;
    }

    ngOnInit(): void {
        this.eventHead = this._route.snapshot.data['eventHead'];
    }
}
