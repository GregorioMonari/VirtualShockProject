import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';


@Injectable({
    providedIn: 'root',
})
export default class APIService {
    
    constructor(private http: HttpClient) {}


    
    pingVmApi(): Observable<Object> {
        const rootPath = 'http://localhost:8084/vshapi';
        return this.http.get(`${rootPath}/ping`).pipe(
          map((payload: unknown) => {
            if (this.validate(payload)) {
              return {
                "mao":"mai"//...payload
              };
            }
            throw new Error('Invalid payload');
          }),
          catchError(this.handleError)
        );
    }
    
    private validate(payload:any){
        return true;
    }
    private handleError(error: HttpErrorResponse): Observable<never> {
        if (error.status == 404) {
            return throwError(() => new Error('Resource not found'));
        }
        return throwError(() => new Error('Unknown error while downloading data from api'));
    }

    
}