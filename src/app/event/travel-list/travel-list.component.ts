import {
    Component,
    OnInit,
    AfterViewInit,
    QueryList,
    ElementRef,
    ViewChild,
    HostListener,
    ViewChildren
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    FormGroup,
    FormBuilder,
    Validators
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
    style,
    transition,
    animate,
    keyframes,
    state
} from '@angular/animations';
import {
    AgmMap,
    GoogleMapsAPIWrapper,
    MapsAPILoader,
    LatLngBounds
} from '@agm/core';
import { ClusterStyle } from '@agm/js-marker-clusterer/services/google-clusterer-types';

declare var ScrollMagic: any;
declare var TweenLite: any;
declare var google: any;

@Component({
    selector: 'app-travel-list',
    templateUrl: './travel-list.component.html',
    styleUrls: ['./travel-list.component.scss'],
    providers: [GoogleMapsAPIWrapper],
    animations: [
        trigger('viewChange', [
            transition('void => *', [
                state('*', style({
                    height: '*', transform: 'translateX(0)', opacity: 1
                })),
                animate('.7s ease',
                    keyframes([
                        style({ height: '0', transform: 'translateX(-30px)', opacity: 0, offset: 0 }),
                        style({ height: '*', transform: 'translateX(-30px)', opacity: 0, offset: .6 }),
                        style({ height: '*', transform: 'translateX(0)', opacity: 1, offset: 1 })
                    ])
                )
            ]),
            transition('* => void', [
                animate(
                    '.3s ease',
                    style({
                        height: 0,
                        opacity: 0,
                        transform: 'translateX(-15px)'
                    })
                )
            ])
        ]),
        trigger('showDeatilsWrapTrigger', [
            transition('void => *', [
                style({ transform: 'translateX(-30px)', opacity: 0 }),
                animate('300ms ease')
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
    formState: string;
    mobileView: boolean;

    public get pager(): EventPager {
        return this._pagination.pager;
    }

    constructor(
        private _eventRepository: EventRepository,
        private _route: ActivatedRoute,
        private _pagination: EventPagination,
        private _http: HttpClient,
        private _loader: MapsAPILoader,
        private _fb: FormBuilder
    ) {
        this.position = { lat: 51.1315, lng: 9.2127 };
        this.mapZoom = 6;
        this.lastFilteredMarkerLength = 0;
        this.usePanning = false;
        this.formState = 'waiting';
        this.mobileView = false;

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
        this.scrollMagicController.scrollTo(function (newpos) {
            TweenLite.to(window, 0.8, {
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
            if (this.travels && this.travels.length) {
                this.latlngBounds = new google.maps.LatLngBounds();
                let lastLat = 0;
                let lastLong = 0;

                this.travels.forEach(location => {
                    this.latlngBounds.extend(
                        new google.maps.LatLng(
                            location.lat,
                            location.long
                        )
                    );

                    const distance = this.calcCrow(lastLat, lastLong, location.lat, location.long);

                    if (distance > 20) {
                        lastLat = location.lat;
                        lastLong = location.long;
                    } else {
                        const phi = (Math.random() * 360) * (Math.PI / 180);
                        const x = Math.cos(phi) / 2000;
                        const y = Math.sin(phi) / 1000;

                        location.lat = location.lat + x;
                        location.long = location.long + y;
                    }
                });
            }
        });

        this.checkForMobileMode();
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

    private calcCrow(lat1, lon1, lat2, lon2) {
      const r = 6371000; // m
      const dLat = this.toRad(lat2 - lat1);
      const dLon = this.toRad(lon2 - lon1);
      lat1 = this.toRad(lat1);
      lat2 = this.toRad(lat2);

      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = r * c;
      return d;
    }

    // Converts numeric degrees to radians
    private toRad(value: number): number {
        return value * Math.PI / 180;
    }

    public contact(travel: Travel): void {
        if (this.contactForm.valid && this.formState === 'waiting') {
            const travelFormData = this.contactForm.value;
            this.formState = 'sending';

            this._eventRepository
                .addContactSubmission(travelFormData)
                .subscribe(response => {
                    if (response.status === 'success') {
                        // Wir haben deine Anfrage gesendet.
                        this.contactForm.reset();
                        travel.mailSend = true;
                        this.formState = 'succeed';

                        setTimeout(() => {
                            this.formState = 'waiting';
                        }, 3000);
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

    public updateDestinationFilterEventHandler(event: any) {
        this.destinationFilter = event.destination;
    }

    public updateTransportationMeanFilterEventHandler(event: any) {
        this.updateTransportationMeanFilter(event.filterId);
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
        this.currentDetailsTravelId = this.currentMapDetails.id;

        if (this.currentDetailsTravelId > 0) {
            setTimeout(() => {
                if (window['parentIFrame']) {
                    window['parentIFrame'].sendMessage({
                        'scrollTo': this.travelWrap.nativeElement.getBoundingClientRect().top
                    });
                }

                setTimeout(() => {
                    this.scrollMagicController.scrollTo(
                        this.travelWrap.nativeElement.getBoundingClientRect().top
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

    @HostListener('window:resize', [])
    checkForMobileMode() {
        if (document.body.clientWidth > 768 && this.mobileView) {
            this.mobileView = false;
        } else if (document.body.clientWidth <= 768 && !this.mobileView) {
            this.mobileView = true;
        }
    }
}
