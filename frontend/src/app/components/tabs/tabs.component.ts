import { Component } from '@angular/core';
import TabsService from '../../services/tabs/tabs.service';
import FileTab from '../../services/tabs/FileTab';

@Component({
    selector: 'app-tabs',
    templateUrl: './tabs.component.html',
    styleUrls: ['./tabs.component.css'],
  })
  export class TabsComponent{

    public $tabs:Map<string,FileTab>=new Map();
    constructor(private tabs:TabsService){
      this.$tabs=tabs.getTabs();
    }

    ngOnInit(){
      //TODO: reopen closed tabs
    }

    onTabClick(id:string){
      this.tabs.switchActiveTab(id)
    }
  }