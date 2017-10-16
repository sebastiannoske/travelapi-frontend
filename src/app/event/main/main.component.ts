import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { EventHead } from '../interfaces/_index';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
    eventHead: EventHead;
    constructor(private _route: ActivatedRoute) {}

    ngOnInit(): void {
        this.eventHead = this._route.snapshot.data['eventHead'];

        setTimeout(() => {
            const event = new CustomEvent('setIframeHeight', { detail: document.body.clientHeight });
            window.parent.document.dispatchEvent(event);
        }, 1000);
    }

    @HostListener('window:resize', [])
    dispatchNewHeight() {
        setTimeout(() => {
            const event = new CustomEvent('setIframeHeight', { detail: document.body.clientHeight });
            window.parent.document.dispatchEvent(event);
        }, 100);
    }
}
