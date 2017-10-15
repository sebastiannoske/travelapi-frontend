import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterCurrentDetails'
})
export class FilterCurrentDetailsPipe implements PipeTransform {

  transform(travel: any, currentTravelDetailId: number): any {

    if (currentTravelDetailId > 0) {
      return travel.filter((currentTravel) => {
        return currentTravel.id === currentTravelDetailId;
      });
    } else {
      return travel;
    }
  }

}
