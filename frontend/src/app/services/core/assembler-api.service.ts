import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from} from 'rxjs';
import { catchError, map } from 'rxjs/operators';
@Injectable({
    providedIn: 'root',
})
export default class AssemblerAPIService {
    constructor() {}
    assemble(filename:string): Observable<string>{
      console.log("assembling file: "+filename)
      const promise:Promise<string>= new Promise((resolve,reject)=>{
        window.api.assemble(filename)
        .then(output=>{
            resolve(output)
        })
        .catch(err=>{
            reject(err)
        })
      })
      return from(promise)
      /*
      const rootPath = 'http://localhost:3005/vshapi';
      const requestBody={source:"raw",value:rawText}//"./testProgram.txt"
      return this.http.post(`${rootPath}/assemble`,requestBody).pipe(
        map((payload: any) => {
          return payload as ExecutionApiResponse;
        }),
        catchError(this.handleError)
      );
      */
    }

    assembleSync(filename:string){
      return new Promise((resolve,reject)=>{
        window.api.assemble(filename)
        .then(output=>{
            resolve(output)
        })
        .catch(err=>{
            reject(err)
        })
      })
    }
}