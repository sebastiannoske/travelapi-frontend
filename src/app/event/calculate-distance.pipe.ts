import { Pipe, PipeTransform } from '@angular/core';

const R = 6371;
const radFactor = Math.PI / 180;
import { Travel } from './interfaces/_index';

@Pipe({
  name: 'calculateDistance'
})
export class CalculateDistancePipe implements PipeTransform {

  transform(value: Travel[], mapSearchMode: boolean, LngLatDeparture?: any): any {
    if ( mapSearchMode ) {
      value.map((travel) => {
        travel.currentDistance = this.distance(travel.lat, travel.long, LngLatDeparture.lat, LngLatDeparture.lng);
      });

      return value;
    } else {
      value.map((travel) => {
        travel.currentDistance = 0;
      });

      return value;
    }
  }

  private distance(lat1, lon1, lat2, lon2) {
    const dLat = (lat2 - lat1) * radFactor;
    const dLon = (lon2 - lon1) * radFactor;
    const a =
       0.5 - Math.cos(dLat) / 2 +
       Math.cos(lat1 * radFactor) * Math.cos(lat2 * radFactor) *
       (1 - Math.cos(dLon)) / 2;

    return R * 2 * Math.asin(Math.sqrt(a)) * 1000;
  }

}
