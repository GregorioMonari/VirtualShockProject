import { Component } from '@angular/core';
import { AfterViewInit, ElementRef, ViewChild } from "@angular/core"

import * as ace from "ace-builds"
import 'ace-builds/src-noconflict/mode-assembly_vsh';

import TabsService from 'src/app/services/tabs.service';

@Component({
    selector: 'app-code-editor',
    templateUrl: './code-editor.component.html',
    styleUrls: ['./code-editor.component.css'],
  })
  export class CodeEditorComponent implements AfterViewInit {
    private aceEditor!:ace.Ace.Editor;
    @ViewChild("editor") private editor!: ElementRef<HTMLElement>; //il punto esclamativo assicura a ts che sicuramente inizializzo la variabile nel codice

    constructor(private tabs:TabsService){}

    ngAfterViewInit(): void {
      //ace.config.set("fontSize","50p");
      //TODO: FIND RIGHT PATH FOR MODE-ASSEMBLY_VSH
      ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.4.12/src-noconflict');
      //ace.config.set('basePath', 'C:/Users/Utente/git/VirtualShockProject/frontend/node_modules/ace-builds/src-noconflict');
      this.aceEditor=ace.edit(this.editor.nativeElement)

      this.aceEditor.session.setValue("<h1>Ace editor component works!</h1>")
      this.aceEditor.setTheme('ace/theme/twilight');
      this.aceEditor.session.setMode('ace/mode/assembly_vsh');

      this.tabs.setEditor(this.aceEditor)
    }
  }