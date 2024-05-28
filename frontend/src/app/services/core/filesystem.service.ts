import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export default class FileSystemService {
    constructor(){}
    async saveFile(filename: string, content: string) {
        try{
          await window.api.saveFile(filename, content); 
          console.log('File saved')
        }catch(err){
          console.error('Failed to save file '+filename+':', err)
        }
    }

    async readFile(filename: string): Promise<string>{
        let content:string= "";
        try {
            content = await window.api.readFile(filename);
            //console.log('File content:', content);
        } catch (err) {
            console.error('Failed to read file '+filename+':', err);
            throw err
        }
        return content;
    }
}