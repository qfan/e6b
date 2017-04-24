import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  template: `<h1>Hello {{name}}</h1><h2>{{name2()}}</h2>`,
})
export class AppComponent  { 
  name = 'Angular'; 
  randName(id: Number) {
    this.name ='233' + id;
  };
  name2() {
    return this.name + '22222';
  }
}
