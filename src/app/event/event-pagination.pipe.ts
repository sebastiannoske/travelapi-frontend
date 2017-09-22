import { Pipe, PipeTransform } from '@angular/core';
import { EventPagination } from './event-pagination.service';
import { Travel, EventPager } from './interfaces/_index';

@Pipe({
    name: 'pagination'
})
export class EventPaginationPipe implements PipeTransform {
    constructor(private _pagination: EventPagination) {}

    transform(travels: Travel[], pager: EventPager): Travel[] {
        this._pagination.setPager(
            travels.length,
            travels.length === pager.totalItems ? pager.currentPage : 1
        );
        return travels.slice(
            this._pagination.pager.startIndex,
            this._pagination.pager.endIndex + 1
        );
    }
}
