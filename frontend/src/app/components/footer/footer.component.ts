import { Component } from '@angular/core';
import APIService from 'src/app/services/api.service';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css'],
  })
  export class FooterComponent {
    constructor(
      private api:APIService
    ) {}

    ngOnInit(){
      const result = this.api.pingVmApi();
      result.subscribe((value)=>{
        console.log(value)
      })
    }
  }