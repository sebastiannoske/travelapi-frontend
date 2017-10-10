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
        destinationFilter: Destination,
        transportationMeanFilter: number[]
    ): Travel[] {
        const pipeline = [
            t => this.filterByDestination(t, destinationFilter),
            t => this.filterByTransportationMean(t, transportationMeanFilter),
            t => this.filterByText(t, textFilter)
        ];
        return pipeline.reduce((xs, f) => f(xs), travels);
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

    private filterByTransportationMean(
        travels: Travel[],
        transportationMeanFilter: number[]
    ): Travel[] {
        if (!transportationMeanFilter) {
            return travels;
        }
        return travels.filter(travel => {
            return (
                transportationMeanFilter.indexOf(
                    travel.transportation_mean.id
                ) !== -1
            );
        });
    }

    private filterByText(travels: Travel[], textFilter: string): Travel[] {
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
