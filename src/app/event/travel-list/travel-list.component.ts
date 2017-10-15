import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventRepository } from '../event-repository.service';
import { EventPagination } from '../event-pagination.service';
import {
    Travel,
    EventPager,
    Destination,
    TransportationMean
} from '../interfaces/_index';
import {
    trigger,
    state,
    style,
    transition,
    animate,
    keyframes
} from '@angular/animations';

@Component({
    selector: 'app-travel-list',
    templateUrl: './travel-list.component.html',
    styleUrls: ['./travel-list.component.scss'],
    animations: [
        trigger('viewChange', [
            transition('void => *', [
                style({
                    transform: 'translateX(-15px) scale(.95)',
                    height: 0,
                    opacity: '0'
                }),
                animate(
                    '.4s ease',
                    style({
                        transform: 'translateY(0) scale(1)',
                        height: '*',
                        opacity: '1'
                    })
                )
            ]),
            transition('* => void', [
                animate(
                    '.3s ease',
                    style({
                        height: 0,
                        opacity: 0,
                        transform: 'translateX(-15px) scale(.95)'
                    })
                )
            ])
        ]),
        trigger('showDeatilsWrapTrigger', [
            transition('void => *', [
                style({
                    transform: 'translate3d(30px, -15px, 0) scale(.9)',
                    opacity: '0'
                }),
                animate(
                    '.3s ease',
                    style({
                        transform: 'translate3d(0, 0, 0) scale(1)',
                        opacity: '1'
                    })
                )
            ]),
            transition('* => void', [
                animate(
                    '.3s ease',
                    style({
                        opacity: 0,
                        transform: 'translate3d(30px, -15px, 0) scale(.9)'
                    })
                )
            ])
        ])
    ]
})
export class TravelListComponent implements OnInit {
    travels: Travel[];
    travelsFiltered: Travel[];
    destinations: Destination[];
    textFilter: string;
    destinationFilter: null | Destination;
    currentDetailsTravelId: number;
    state: string;
    transportationMeanFilter: number[];
    transportationMeanDisplay: Array<
        TransportationMean & { iconClass: string }
    >;
    currentMapDetails: Travel;
    transportationMeanIcons: string[] = [
        'icon-directions-car',
        'icon-directions-bus',
        'icon-directions-train',
        'icon-directions-bike',
        'icon-directions-feed',
        'icon-directions-star'
    ];
    keys: string[];
    ascOrder: boolean;

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
        this.state = '';
        this.ascOrder = false;
        this.currentDetailsTravelId = 0;
        this._pagination.setPager(this.travels.length, 1);
        this.destinations = this._eventRepository.getDestinations(this.travels);
        this.transportationMeanFilter = this._eventRepository
            .getTransportationMeans()
            .map(transportationMean => transportationMean.id);
        this.transportationMeanDisplay = this._eventRepository
            .getTransportationMeans()
            .map(transportationMean => {
                return Object.assign(transportationMean, {
                    iconClass:
                        transportationMean.id - 1 in
                        this.transportationMeanIcons
                            ? this.transportationMeanIcons[
                                  transportationMean.id - 1
                              ]
                            : ''
                });
            });
    }

    public setPage(page: number): void {
        if (page < 1 || page > this.pager.totalPages) {
            return;
        }
        this._pagination.setPager(this.pager.totalItems, page);
    }

    public updateTransportationMeanFilter(transportationMeanId: number) {
        const index = this.transportationMeanFilter.indexOf(
            transportationMeanId
        );
        index !== -1
            ? this.transportationMeanFilter.splice(index, 1)
            : this.transportationMeanFilter.push(transportationMeanId);
        this.transportationMeanFilter = [...this.transportationMeanFilter];
    }

    public showMarkerDetails(travel: Travel) {
        this.currentMapDetails = travel;
    }

    public showMarkerFullDetails() {
        this.currentDetailsTravelId =
        this.currentDetailsTravelId === this.currentMapDetails.id ? 0 : this.currentMapDetails.id;
    }
}
