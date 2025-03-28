import { Component } from '@angular/core';
import APIService from 'src/app/services/core/vm-api.service';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css'],
  })
  export class FooterComponent {
    public $apiConnectionStatus:String; //accessible by component html
    constructor(
      private api:APIService
    ) {
      this.$apiConnectionStatus="connecting";
    }

    ngOnInit(){
      const result = this.api.ping();
      result.subscribe(
      (value)=>{
        this.$apiConnectionStatus="connected";
      },
      (error)=>{
        this.$apiConnectionStatus="disconnected";
      })
    }
  }