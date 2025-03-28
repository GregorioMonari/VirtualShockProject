import * as ace from "ace-builds"

export default class FileTab{
    private readonly _id: string;
    private _displayname: string;
    private _filename: string;

    //Dynamic sections
    private _$aceEditor:ace.Ace.Editor;
    private _saved: boolean;
    private _content: string;
    private _active: boolean;

    private _isNewUntitledFile:boolean;
    constructor(id: string, filename: string, content: string, aceEditor: ace.Ace.Editor, isNewUntitledFile=false){
        this._id= id;
        this._filename= filename;
        this._content= content;
        this._saved= true;
        this._active= false; //if deactivated content is cached into this object. Else, content is into the editor
        this._displayname= this.getDisplayName(filename)
        this._$aceEditor= aceEditor;
        this._isNewUntitledFile=isNewUntitledFile;
    }

    public set saved(flag : boolean) { this._saved = flag; }
    public get saved() : boolean { return  this._saved; }

    public set active(flag : boolean) { this._active = flag; }
    public get active() : boolean { return  this._active; }

    public set isNewUntitledFile(flag : boolean) { this._isNewUntitledFile = flag; }
    public get isNewUntitledFile() : boolean { return  this._isNewUntitledFile; }

    public set text(content: string) {
        if(this.active){
            //set text in the editor instead
            this._$aceEditor.session.setValue(content);
        }else{
            this._content=content;
        }
    }
    public get text() {
        if(this.active){
            //get text from the editor instead
            return this._$aceEditor.session.getValue();
        }else{
            return this._content;
        }
    }

    public set path(filename : string) { 
        this._filename = filename; 
        this._displayname = this.getDisplayName(filename);
    }
    public get path() : string { return  this._filename; }

    public get displayName() : string { return  this._displayname; }

    private getDisplayName(filename: string){
        let chars="";
        for(var i=0; i<filename.length;i++){
            const currChar= filename.charAt((filename.length-1) -i);
            if(currChar=="/"||currChar=="\\")break;
            chars=chars+currChar;
        }
        const out= chars.split("").reverse().join("");
        return out;
    }
}