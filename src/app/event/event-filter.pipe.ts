import { Pipe, PipeTransform } from '@angular/core';
import { Travel, Destination } from './interfaces/_index';

@Pipe({
    name: 'filter',
    pure: true
})
export class EventFilterPipe implements PipeTransform {
    transform(
        travels: Travel[],
        textFilter: string,
        destinationFilter: Destination
    ): Travel[] {
        return this.filterByText(
            this.filterByDestination(travels, destinationFilter),
            textFilter
        );
    }

    private filterByDestination(
        travels: Travel[],
        destinationFilter: Destination
    ): Travel[] {
        if (!destinationFilter) {
            return travels;
        }
        return travels.filter(travel => {
            return travel.destination.id === destinationFilter.id;
        });
    }

    private filterByText(travels: Travel[], textFilter): Travel[] {
        if (!textFilter) {
            return travels;
        }
        textFilter = textFilter.toLowerCase();

        return travels.filter(travel => {
            const searchString: string =
                travel.city +
                travel.destination.name +
                travel.postcode +
                travel.transportation_mean.name;

            return searchString.toLowerCase().indexOf(textFilter) !== -1;
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
