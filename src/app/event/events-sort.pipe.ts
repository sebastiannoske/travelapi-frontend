import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'eventsSort'
})
export class EventsSortPipe implements PipeTransform {

  transform(value: any, keys: string[], asc: boolean): any {
    if (!keys || (keys && keys.length === 0)) {
      return value;
    }

    if (keys.length === 1) {
      if (asc) {
        return value.sort( (a, b) => {
          return a[keys[0]] < b[keys[0]] ? -1 : a[keys[0]] > b[keys[0]] ? 1 : 0;
        });
      } else {
        return value.sort( (a, b) => {
          return a[keys[0]] > b[keys[0]] ? -1 : a[keys[0]] < b[keys[0]] ? 1 : 0;
        });
      }
    }

    if (keys.length === 2) {
      if (asc) {
        return value.sort( (a, b) => {
          return a[keys[0]][keys[1]] < b[keys[0]][keys[1]] ? -1 : a[keys[0]][keys[1]] > b[keys[0]][keys[1]] ? 1 : 0;
        });
      } else {
        return value.sort( (a, b) => {
          return a[keys[0]][keys[1]] > b[keys[0]][keys[1]] ? -1 : a[keys[0]][keys[1]] < b[keys[0]][keys[1]] ? 1 : 0;
        });
      }
    }
  }

}
