import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
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
import { AgmMap, GoogleMapsAPIWrapper } from '@agm/core';

declare var ScrollMagic: any;
declare var TweenMax: any;

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
    @ViewChild('travelwrap') travelWrap: ElementRef;
    @ViewChild(AgmMap) myMap: AgmMap;
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
    scrollMagicController: any;
    detailsRequestedFromMapDetails: boolean;
    position: any;
    mapZoom: number;
    mapSearchString: string;
    mapSearchMode: boolean;
    currentUrl: string;

    public get pager(): EventPager {
        return this._pagination.pager;
    }

    constructor(
        private _eventRepository: EventRepository,
        private _route: ActivatedRoute,
        private _pagination: EventPagination
    ) {
        this.position = { lat: 51.1315, lng: 9.2127 };
        this.mapZoom = 6;
    }

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
        this.transportationMeanFilter = [];
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
        this.detailsRequestedFromMapDetails = false;
        this.scrollMagicController = new ScrollMagic.Controller({vertical: true});
        this.scrollMagicController.scrollTo(function (newpos) {

            TweenMax.to(window, .8, {scrollTo: {y: newpos, autoKill: false}});

        });

        // inform parent about applications clientHeight
        // setTimeout(() => {
        //     const event = new CustomEvent('setIframeHeight', { detail: {
        //         height: document.body.clientHeight, jumpTo: 0
        //     }});
        //     window.parent.document.dispatchEvent(event);
        // }, 300);

        // listen for given travel id to show its details
        this._route.params.subscribe(params => {
            if (params && params.travelId) {
                this.currentDetailsTravelId = <number>parseInt(params.travelId, 10);
                this.detailsRequestedFromMapDetails = true;

                const currentTravel = this.travels.find((travel) => {
                    return travel.id === this.currentDetailsTravelId;
                });
                this.showMarkerDetails(currentTravel);
            }
        });
    }

    public setTransportationMeanClassIcon(id: number) {
        return this.transportationMeanIcons[id - 1];
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
        this.currentUrl = window.location.href;

        if (!(this.currentUrl.indexOf(travel.id.toString()) > 0)) {
            this.currentUrl += '/' + travel.id;
        }
    }

    public setCurrentShareUrl(travelId: number) {
        this.currentUrl = window.location.href;
        if (!(this.currentUrl.indexOf(travelId.toString()) > 0)) {
            this.currentUrl += '/' + travelId;
        }
    }

    public showMarkerFullDetails() {
        // this.currentDetailsTravelId =
        // this.currentDetailsTravelId === this.currentMapDetails.id ? 0 : this.currentMapDetails.id;
        this.currentDetailsTravelId = this.currentMapDetails.id;

        if (this.currentDetailsTravelId > 0) {
            setTimeout(() => {
                // inform parent about applications clientHeight
                // const event = new CustomEvent('setIframeHeight', { detail: {
                //     height: document.body.clientHeight, jumpTo: this.travelWrap.nativeElement.offsetTop
                // }});
                // window.parent.document.dispatchEvent(event);

                setTimeout(() => {
                    this.scrollMagicController.scrollTo(this.travelWrap.nativeElement.offsetTop);
                }, 10);
            }, 400);
        }
    }

    onMapSearchStringChange() {
        if (this.mapSearchMode && this.mapSearchString.length === 0) {
            this.mapSearchMode = false;
        }
    }

    googlePlacesAddressHandler(event: any): void {
        this.position = { lat: event.lat, lng: event.lng };
        this.mapZoom = 9;
        this.myMap.triggerResize(true);
        // this.myMap.fitBounds();

        if (this.mapSearchString.length > 0) { // set mapSearchMode to true, to calculate distances of each travel to the desired departure
            this.mapSearchMode = true;

            this.keys = ['currentDistance'];
            this.ascOrder = true;
        }
    }
}
