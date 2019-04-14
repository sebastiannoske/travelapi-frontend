import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-map-filter-overlay',
  templateUrl: './map-filter-overlay.component.html',
  styleUrls: ['./map-filter-overlay.component.scss']
})
export class MapFilterOverlayComponent implements OnInit, OnDestroy {
  @Input() destinations: any[];
  @Input() destinationFilter: any[];
  @Input() transportationMeanDisplay: any[];
  @Input() transportationMeanFilter: any[];
  @Output() onCloseEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() updateTransportationMeanFilterEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() updateDestinationFilterEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
    console.log(this.destinationFilter);
    document.body.classList.add('modal-open');
  }

  ngOnDestroy() {
    document.body.classList.remove('modal-open');
  }

  updateTransportationMeanFilter(filterId: number) {
    this.updateTransportationMeanFilterEvent.emit({ filterId: filterId });
  }

  updateDestinationFilter(destination: any) {
    this.updateDestinationFilterEvent.emit({ destination: destination });
  }

  close() {
    this.onCloseEvent.emit({ close: true });
  }

}
