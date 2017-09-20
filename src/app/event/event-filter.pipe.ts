import { Pipe, PipeTransform } from '@angular/core';
import { Travel } from './interfaces/_index';

@Pipe({
    name: 'filter',
    pure: false
})
export class EventFilterPipe implements PipeTransform {
    transform(travels: Travel[], filter: string): any {
        if (!filter) {
            return travels;
        }
        filter = filter.toLowerCase();
        return travels.filter(travel => {
            //do
            return true;
        });
    }

    private filterByString(filter) {
        if (filter) {
            filter = filter.toLowerCase();
        }
        return value => {
            return (
                !filter ||
                (value
                    ? ('' + value).toLowerCase().indexOf(filter) !== -1
                    : false)
            );
        };
    }
}
