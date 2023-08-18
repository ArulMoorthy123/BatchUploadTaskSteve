import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
})
export class FilterArrayPipe implements PipeTransform {
  transform(items: any[], searchTerm: string, labelKey?: string,labelKey1?: string): any {
    if (!items || !searchTerm) {
      return items;
    }
    if (!labelKey) {
      return items.includes(searchTerm);
    } else {
      return items.filter((item) =>
      item[labelKey]
          ? item[labelKey].toLowerCase().includes(searchTerm.toLowerCase()) ===true || 
           item[labelKey1] && item[labelKey1].toLowerCase().includes(searchTerm.toLowerCase()) ===true
          : item.toLowerCase().includes(searchTerm.toLowerCase()) === true
      );
    }
  }
}
