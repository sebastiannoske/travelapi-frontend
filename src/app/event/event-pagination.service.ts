import { Injectable } from '@angular/core';
import { EventPager } from './interfaces/_index';

@Injectable()
export class EventPagination {
    private _pager: EventPager;

    constructor() {}

    public get pager() {
        return this._pager;
    }

    public setPager(
        totalItems: number,
        currentPage: number = 1,
        pageSize: number = 10
    ): void {
        // calculate total pages
        const totalPages = Math.ceil(totalItems / pageSize);

        let startPage: number, endPage: number;
        if (totalPages <= 5) {
            // less than pageSize total pages so show all
            startPage = 1;
            endPage = totalPages;
        } else {
            // more than pageSize total pages so calculate start and end pages
            if (currentPage <= 2) {
                startPage = 1;
                endPage = 5;
            } else if (currentPage + 2 >= totalPages) {
                startPage = totalPages - 4;
                endPage = totalPages;
            } else {
                startPage = currentPage - 2;
                endPage = currentPage + 2;
            }
        }

        // calculate start and end item indexes
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

        // create an array of pages to ng-repeat in the pager control
        // const pages = _.range(startPage, endPage + 1); loddash
        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        // return object with all pager properties required by the view
        this._pager = {
            totalItems: totalItems,
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
            startIndex: startIndex,
            endIndex: endIndex,
            pages: pages
        };
    }
}
