import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'split',
})
export class splitPipe implements PipeTransform {

  transform(text: string, spliter: any = '/', postiton: any = 'first'): any {
    var self = this;
    let name = text.split(spliter);
    if (postiton == 'first') {
      return name[0]
    } else {
      return name.pop();
    }
  }
}
