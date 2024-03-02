import { Component } from '@angular/core';

interface FileTab{
  isSaved:boolean;
  text:string|null; //null if currFileTab, text is stored into editor
  path:string;
  name:string;
}
import TabsService from 'src/app/services/tabs.service';

@Component({
    selector: 'app-tabs',
    templateUrl: './tabs.component.html',
    styleUrls: ['./tabs.component.css'],
  })
  export class TabsComponent{

    public $tabs:Map<string,FileTab>=new Map();

    constructor(private tabs:TabsService){
      this.$tabs=tabs.getFileTabs();
    }

    ngOnInit(){
      
    }

    onTabClick(id:string){
      if(this.tabs.getCurrentTabId()!=id){//stiamo cambiando tab
        this.tabs.setCurrentTab(id);
      }
    }

  }