import { Component } from '@angular/core';
import ParserService from 'src/app/services/parser.service';
import SimulationService from 'src/app/services/simulation.service';
import TabsService from 'src/app/services/tabs.service';

@Component({
    selector: 'app-controls',
    templateUrl: './controls.component.html',
    styleUrls: ['./controls.component.css'],
  })
  export class ControlsComponent {
    constructor(
      private parser:ParserService,
      private simulation:SimulationService,
      private tabs:TabsService
      ) {}

    async compile(){
      const editorValue:string=this.tabs.getEditor()?.getValue() as string;
      const machineCode:string = await this.parser.parse(editorValue) as string;
      console.log(machineCode)
    }

    async run(){
      const editorValue:string=this.tabs.getEditor()?.getValue() as string;
      const machineCode:string = await this.parser.parse(editorValue) as string;
      console.log(machineCode)
      const res= await this.simulation.load("direct", machineCode)
      console.log(res)
      this.simulation.start()
    }

    async stop(){}
    async pause(){}


  }