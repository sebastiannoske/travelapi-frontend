import { Pipe, PipeTransform } from '@angular/core';
import { Travel } from './interfaces/_index';

@Pipe({
    name: 'filter',
    pure: true
})
export class EventFilterPipe implements PipeTransform {
    transform(travels: Travel[], filter: string): any {
        if (!filter) {
            return travels;
        }
        filter = filter.toLowerCase();

        return travels.filter(travel => {
            const searchString: string =
                travel.city +
                travel.destination.name +
                travel.postcode +
                travel.transportation_mean.name;

            return searchString.toLowerCase().indexOf(filter) !== -1;
        });

        // return travels.filter(travel => {
        //     return _.some(
        //         [
        //             travel.city,
        //             travel.destination.name,
        //             travel.postcode,
        //             travel.transportation_mean.name
        //         ],
        //         value => value.toLowerCase().indexOf(filter) !== -1
        //     );
        // });
    }
}
