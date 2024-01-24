import { Component } from '@angular/core';
import TabsService from './services/tabs.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';
  constructor(private tabs:TabsService){
  }

  ngOnInit(){
    //wait for tabs to init the editor before loading files
    this.tabs.getIsReady().subscribe((value)=>{
      if(value){
        const tabId1=this.tabs.addTab("main.js","proc main { add r1,r2,r3 }","./")
        this.tabs.setCurrentTab(tabId1);
      }
    })
  }
}
