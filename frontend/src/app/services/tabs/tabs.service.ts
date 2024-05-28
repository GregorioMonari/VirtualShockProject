import { Injectable } from '@angular/core';
import { Subject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import * as ace from "ace-builds"
import FileTab from './FileTab';
import FileSystemService from '../core/filesystem.service';

/*
Quando aggiorno questa struttura?
- quando apro/chiudo un nuovo file
- quando cambio la finestra corrente
- per tutti gli altri casi, è l'editor, non la struttura a cambiare
*/

/*
interface FileTab{
    isSaved:boolean;
    text:string; //null if currFileTab, text is stored into editor
    path:string;
    name:string;
}*/

@Injectable({
    providedIn: 'root',
})
export default class TabsService {
    private openedTabs=0; //should be opened tabs
    private activeTabId="";
    private tabsDb:Map<string,FileTab>=new Map<string,FileTab>();//currTab has no text, it is stored into editor instead
    
    private isReady:Subject<boolean>=new Subject();
    public getIsReady():Observable<boolean>{return this.isReady.asObservable();}
    private muteOnChange:boolean=false; //used to set if file is saved
    private $aceEditor!:ace.Ace.Editor;
    constructor(private fs: FileSystemService){}


    addTab(filename:string,text:string): string{
        console.log("adding tab for file: "+filename)
        const newTabId=this.openedTabs.toString();
        this.openedTabs++;
        const newFileTab:FileTab= new FileTab(newTabId,filename,text,this.$aceEditor);
        if(!this.tabsDb.has(newTabId)){
            this.tabsDb.set(newTabId,newFileTab);
        }
        console.log("added tab "+newTabId+" for file "+filename+":",newFileTab)
        console.log("opened tabs: "+this.getTabs().size)
        return newTabId;
    }

    getTabs(): Map<string,FileTab>{
        return this.tabsDb;
    }

    getTab(id:string): FileTab{
        if(this.getTabs().has(id)){
            let cell:FileTab=this.getTabs().get(id) as FileTab;
            return cell;
        }else{
            throw new Error("no tab with id "+id+" found")
        }
    }

    getActiveTab():FileTab{
        return this.getTab(this.activeTabId)
    }

    //salva la tab corrente nella cache e carica nell'editor la nuova tab indicata dall'id
    switchActiveTab(id:string){
        if(id==this.activeTabId) return; //return if switching to same tab
        this.muteOnChange=true;
        console.log("switching active tab to id: "+id)
        //1. Salva tab corrente nella cache se esiste, altrimenti skippa
        if(this.tabsDb.has(this.activeTabId)){
            let cell:FileTab=this.tabsDb.get(this.activeTabId) as FileTab;
            cell.active=false;
            cell.text=this.$aceEditor.session.getValue();
            this.tabsDb.set(this.activeTabId,cell);
        }
        //2. Sposta il testo dalla cache all'editor e rendi tab attiva
        if(this.tabsDb.has(id)){
            let cell:FileTab=this.tabsDb.get(id) as FileTab;
            this.$aceEditor.session.setValue(cell.text);
            cell.text="";
            cell.active=true;
            this.tabsDb.set(id,cell);
        }
        //3. Cambia id tab corrente
        this.activeTabId=id;
        this.muteOnChange=false;
        console.log("switched active tab")
    }

    saveTab(id:string){
        const tab= this.getTab(id);
        if(!tab.saved){
            console.log("saving file: "+tab.path)
            this.fs.saveFile(tab.path,tab.text);
            tab.saved=true;
        }else{
            console.warn("tab "+id+" already saved, skipping saving process")
        }
    }

    saveActiveTab(){ this.saveTab(this.activeTabId) }

    removeTab(id:string){
        throw new Error("to be implemented")
        if(this.tabsDb.has(id)){
            this.tabsDb.delete(id);
        }
    }

    //Init editor
    setEditor(editor:ace.Ace.Editor){
        this.$aceEditor=editor;
        this.$aceEditor.on("change",()=>{
          if(!this.muteOnChange){
            if(this.getTabs().has(this.activeTabId)){
                const tab:FileTab=this.getTabs().get(this.activeTabId) as FileTab;
                tab.saved=false;
                this.getTabs().set(this.activeTabId,tab);
            }
          }
        });
        this.isReady.next(true);
        console.log("ace editor set, tabs service has been correctly initialized")
    }
    getEditor():ace.Ace.Editor|null{return this.$aceEditor;}
}