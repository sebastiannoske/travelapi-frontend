import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'northToSouth'
})
export class NorthToSouthPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return value.sort((a, b) => {
      return a.lat < b.lat ? 1
      : a.lat > b.lat ? -1
      : 0;
    });
  }

}
