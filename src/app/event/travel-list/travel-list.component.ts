import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventRepository } from '../event-repository.service';
import { EventPagination } from '../event-pagination.service';
import { Travel, EventPager, Destination } from '../interfaces/_index';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-travel-list',
    templateUrl: './travel-list.component.html',
    styleUrls: ['./travel-list.component.scss']
})
export class TravelListComponent implements OnInit {
    travels: Travel[];
    destinations: Destination[];
    textFilter: string;
    destinationFilter: null | Destination;

    public get pager(): EventPager {
        return this._pagination.pager;
    }

    constructor(
        private _eventRepository: EventRepository,
        private _route: ActivatedRoute,
        private _pagination: EventPagination
    ) {}

    ngOnInit() {
        this.travels =
            this._route.snapshot.data['type'] === 'offer'
                ? this._eventRepository.offers
                : this._eventRepository.requests;
        this._pagination.setPager(this.travels.length, 1);
        this.destinations = this._eventRepository.getDestinations(this.travels);
    }

    public setPage(page: number): void {
        if (page < 1 || page > this.pager.totalPages) {
            return;
        }
        this._pagination.setPager(this.pager.totalItems, page);
    }
}
