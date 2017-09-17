import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
    private _event: any;

    constructor(private _route: ActivatedRoute) {}

    ngOnInit(): void {
        this._event = this._route.snapshot.data['event'];
        //console.log(this._event);
    }
}
