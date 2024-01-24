import { Injectable } from '@angular/core';
import { Subject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import * as ace from "ace-builds"

/*
Quando aggiorno questa struttura?
- quando apro/chiudo un nuovo file
- quando cambio la finestra corrente
- per tutti gli altri casi, è l'editor, non la struttura a cambiare
*/


interface FileTab{
    isSaved:boolean;
    text:string; //null if currFileTab, text is stored into editor
    path:string;
    name:string;
}

@Injectable({
    providedIn: 'root',
})
export default class TabsService {
    private isReady:Subject<boolean>=new Subject();
    private muteOnChange:boolean=false; //used to set if file is saved
    private nFiles=0;
    private currTabId="";
    private $aceEditor!:ace.Ace.Editor;
    private fileTabs:Map<string,FileTab>=new Map<string,FileTab>();//currTab has no text, it is stored into editor instead


    constructor(){}
    getIsReady():Observable<boolean>{
        return this.isReady.asObservable();
    }
    setEditor(editor:ace.Ace.Editor){
        this.$aceEditor=editor;

        this.$aceEditor.on("change",()=>{
          if(!this.muteOnChange){
            if(this.fileTabs.has(this.currTabId)){
                const cell:FileTab=this.fileTabs.get(this.currTabId) as FileTab;
                cell.isSaved=false;
                this.fileTabs.set(this.currTabId,cell);
            }
          }
        });
        this.isReady.next(true);
    }
    getEditor():ace.Ace.Editor|null{return this.$aceEditor;}
    getFileTabs(){return this.fileTabs;}
    getCurrentTabId(){return this.currTabId;}

    addTab(name:string,text:string,path:string):string{
        const newTabId=this.nFiles.toString();
        this.nFiles++;
        const newFileTab:FileTab={
            isSaved:true,
            text:text,
            path:path,
            name:name
        }
        if(!this.fileTabs.has(newTabId)){
            this.fileTabs.set(newTabId,newFileTab);
        }
        return newTabId;
    }

    removeTab(id:string){
        if(this.fileTabs.has(id)){
            this.fileTabs.delete(id);
        }
    }

    //salva la tab corrente nella cache e carica nell'editor la nuova tab indicata dall'id
    setCurrentTab(id:string){
        if(id!=this.currTabId){//stiamo cambiando tab
            this.muteOnChange=true;
            //Salva tab corrente nella cache
            if(this.fileTabs.has(this.currTabId)){
                let cell:FileTab=this.fileTabs.get(this.currTabId) as FileTab;
                cell.text=this.$aceEditor.session.getValue();
                this.fileTabs.set(this.currTabId,cell);
            }
            //Cambia tab corrente
            this.currTabId=id;


            //Preleva il testo corrente dalla cache
            if(this.fileTabs.has(id)){
                let cell:FileTab=this.fileTabs.get(id) as FileTab;
                this.$aceEditor.session.setValue(cell.text);
                cell.text="";
                this.fileTabs.set(this.currTabId,cell);
            }
            this.muteOnChange=false;
        }
    }
}