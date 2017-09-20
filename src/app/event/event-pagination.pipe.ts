import { Pipe, PipeTransform } from '@angular/core';
import { EventPagination } from './event-pagination.service';
import { Travel, EventPager } from './interfaces/_index';

@Pipe({
    name: 'pagination'
})
export class EventPaginationPipe implements PipeTransform {
    constructor(private _pagination: EventPagination) {}

    transform(travels: Travel[], pager: EventPager): Travel[] {
        return travels.slice(pager.startIndex, pager.endIndex + 1);
    }
}
