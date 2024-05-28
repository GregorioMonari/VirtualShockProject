import { Component } from '@angular/core';
import AssemblerService from 'src/app/services/assembler.service';
import SimulationService from 'src/app/services/simulation.service';
import TabsService from 'src/app/services/tabs/tabs.service';

@Component({
    selector: 'app-controls',
    templateUrl: './controls.component.html',
    styleUrls: ['./controls.component.css'],
  })
  export class ControlsComponent {
    constructor(
      private assembler:AssemblerService,
      private simulation:SimulationService,
      private tabs:TabsService
      ) {}

    async compile(){
      const tab= this.tabs.getActiveTab();
      if(tab.saved){
        await this.assembler.assemble(tab.path);
      }else alert("save file before compiling")
    }

    async run(){
      alert("TBI");
      return;
      const editorValue:string=this.tabs.getEditor()?.getValue() as string;
      const machineCode:string = await this.assembler.assemble(editorValue) as string;
      console.log(machineCode)
      const res= await this.simulation.load("direct", machineCode)
      console.log(res)
      this.simulation.start()
    }
    async stop(){}
    async pause(){}
  }