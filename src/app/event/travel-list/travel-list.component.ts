import {
    Component,
    OnInit,
    AfterViewInit,
    QueryList,
    ElementRef,
    ViewChild,
    ViewChildren
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    FormGroup,
    FormControl,
    FormArray,
    FormBuilder,
    Validators,
    AbstractControl
} from '@angular/forms';
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
import {
    AgmMap,
    GoogleMapsAPIWrapper,
    MapsAPILoader,
    LatLngBounds
} from '@agm/core';
import { ClusterStyle } from '@agm/js-marker-clusterer/services/google-clusterer-types';

declare var ScrollMagic: any;
declare var TweenMax: any;
declare var google: any;

@Component({
    selector: 'app-travel-list',
    templateUrl: './travel-list.component.html',
    styleUrls: ['./travel-list.component.scss'],
    providers: [GoogleMapsAPIWrapper],
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
export class TravelListComponent implements OnInit, AfterViewInit {
    @ViewChild('travelwrap') travelWrap: ElementRef;
    @ViewChild(AgmMap) myMap: AgmMap;
    @ViewChildren('filteredMarkers') filteredMarkers: QueryList<ElementRef>;
    travels: Travel[];
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
    usePanning: boolean;
    mapSearchString: string;
    mapSearchMode: boolean;
    currentUrl: string;
    mapStyles: any[];
    latlngBounds: LatLngBounds;
    markerClusterStyles: ClusterStyle[];
    lastFilteredMarkerLength: number;
    contactForm: FormGroup;

    public get pager(): EventPager {
        return this._pagination.pager;
    }

    constructor(
        private _eventRepository: EventRepository,
        private _route: ActivatedRoute,
        private _pagination: EventPagination,
        private _http: HttpClient,
        private _loader: MapsAPILoader,
        private _mapWrapper: GoogleMapsAPIWrapper,
        private _fb: FormBuilder
    ) {
        this.position = { lat: 51.1315, lng: 9.2127 };
        this.mapZoom = 6;
        this.lastFilteredMarkerLength = 0;
        this.usePanning = false;

        const temp = {
            url: './assets/images/icons/cluster-marker.png',
            height: 75,
            width: 75,
            textColor: '#fff',
            textSize: 12,
            backgroundPosition: 'center center'
        };

        this.markerClusterStyles = [
            temp, temp, temp
        ];
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
        this.scrollMagicController = new ScrollMagic.Controller({
            vertical: true
        });
        this.scrollMagicController.scrollTo(function(newpos) {
            TweenMax.to(window, 0.8, {
                scrollTo: { y: newpos, autoKill: false }
            });
        });
        this.contactForm = this._fb.group({
            contactId: '',
            email: [
                '',
                {
                    updateOn: 'blur',
                    validators: [Validators.email]
                }
            ],
            description: ['', Validators.required]
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
                this.currentDetailsTravelId = <number>parseInt(
                    params.travelId,
                    10
                );
                this.detailsRequestedFromMapDetails = true;

                const currentTravel = this.travels.find(travel => {
                    return travel.id === this.currentDetailsTravelId;
                });
                this.showMarkerDetails(currentTravel);
            }
        });

        this._http.get('assets/mapstyles/mapstyles.json').subscribe(data => {
            this.mapStyles = <any[]>data;
        });

        this._loader.load().then(() => {
            this.latlngBounds = new google.maps.LatLngBounds();

            if (this.travels && this.travels.length) {
                this.travels.map(location => {
                    this.latlngBounds.extend(
                        new google.maps.LatLng(location.lat, location.long)
                    );
                });
            }
        });
    }

    ngAfterViewInit() {
        this.filteredMarkers.changes.subscribe(t => {
            if (google) {
                if (this.filteredMarkers.length && this.lastFilteredMarkerLength !== this.filteredMarkers.length) {
                    this.lastFilteredMarkerLength = this.filteredMarkers.length;
                    this.latlngBounds = new google.maps.LatLngBounds();

                    this.filteredMarkers.forEach(e => {
                        this.latlngBounds.extend(
                            new google.maps.LatLng(
                                e.nativeElement.getAttribute('latitude'),
                                e.nativeElement.getAttribute('longitude')
                            )
                        );
                    });
                }
            }
        });
    }

    public contact(): void {
        if (this.contactForm.valid) {
            const travelFormData = this.contactForm.value;

            this._eventRepository
                .addContactSubmission(travelFormData)
                .subscribe(response => {
                    if (response.status === 'success') {
                        this.contactForm.reset();
                    }
                });
        }
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

        if (!this.usePanning) {
            this.usePanning = true;
        }

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
                // <any>window.parentIFrame.scrollToOffset(this.travelWrap.nativeElement.offsetTop);
                console.log(window);
                debugger;

                setTimeout(() => {
                    this.scrollMagicController.scrollTo(
                        this.travelWrap.nativeElement.offsetTop
                    );
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
        if (event && event.viewport) {
            this.position = { lat: event.lat, lng: event.lng };
            this.mapZoom = 9;
            this.myMap.triggerResize(true);
            this.latlngBounds = <LatLngBounds>event.viewport;

            if (this.mapSearchString.length > 0) {
                // set mapSearchMode to true, to calculate distances of each travel to the desired departure
                this.mapSearchMode = true;

                this.keys = ['currentDistance'];
                this.ascOrder = true;
            }
        }
    }
}
