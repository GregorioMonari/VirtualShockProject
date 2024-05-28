import { Component } from '@angular/core';
import FileSystemService from '../../services/core/filesystem.service';
import TabsService from '../../services/tabs/tabs.service';

@Component({
  selector: 'app-burger-menu',
  templateUrl: './burger-menu.component.html',
  styleUrls: ['./burger-menu.component.css']
})
export class BurgerMenuComponent{
  constructor(
    private fs: FileSystemService,
    private tabs: TabsService
  ){}
  async openFile(){
    const options = {
      properties: ['openFile']
    };
    try {
      const filePaths = await window.api.openFileDialog(options);
      if (filePaths.length > 0) {
        const filename= filePaths[0]
        console.log('Selected file:', filename);
        const content= await this.fs.readFile(filename)
        const tabId= this.tabs.addTab(filename,content)
        this.tabs.switchActiveTab(tabId)
        console.log(this.tabs.getTabs())
      }
    } catch (err) {
      console.error('Failed to open file dialog:', err);
    }
  }

  saveFile(){
    try{
      this.tabs.saveActiveTab();
    }catch(err){
      console.error('failed to save file:',err)
    }
  }
  navigateTo(link:string){}
}
