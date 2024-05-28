import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';


import { ExecutionApiResponse } from '../../interfaces/simulation-output.interface';

@Injectable({
    providedIn: 'root',
})
export default class VirtualMachineAPIService {
    
    constructor(private http: HttpClient) {}


    
    ping(): Observable<Object> {
        console.log("Pinging Vm Api...")
        const rootPath = 'http://localhost:8084/vshapi';
        return this.http.get(`${rootPath}/ping`).pipe(
          map((payload: any) => {
            return {
              ...payload
            };
          }),
          catchError(this.handleError)
        );
    }


    execute(filePath:string): Observable<ExecutionApiResponse> {
      console.log("Executing code...")
      const rootPath = 'http://localhost:8084/vshapi';
      const requestBody={source:"file",value:filePath}//"./testProgram.txt"
      return this.http.post(`${rootPath}/execute`,requestBody).pipe(
        map((payload: any) => {
          return payload as ExecutionApiResponse;
        }),
        catchError(this.handleError)
      );
    }

    executeString(stringProgram:string): Observable<ExecutionApiResponse> {
      console.log("Executing code...")
      const rootPath = 'http://localhost:8084/vshapi';
      const requestBody={source:"direct",value:stringProgram}//"./testProgram.txt"
      return this.http.post(`${rootPath}/execute`,requestBody).pipe(
        map((payload: any) => {
          return payload as ExecutionApiResponse;
        }),
        catchError(this.handleError)
      );
    }
    
    private handleError(error: HttpErrorResponse): Observable<never> {
      if (error.status == 404) {
          return throwError(() => new Error('404: Resource not found'));
      }
      console.log(error)
      return throwError(() => new Error('Unknown error while performing Vm api request'));
    }

    
}