import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import { Response } from '@angular/http';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';


@Injectable()
export class SpeedometerService {

    private _restStream: Observable<any>;
    public get RestStream(): Observable<any> {
        return this._restStream;
    }

    private api = 'http://localhost:3000/';

    constructor(private httpClient: HttpClient) { }

    getSpeedometerData(ownernodeId: any, nodeId: any, datatype: any, measureFilter: any, siteTag: any, lang: any, now: any) {
        const interval = 5000;
        const source = Observable.timer(0, interval);
        const url = `${this.api + 'data/json_data/' + ownernodeId + '/' + nodeId}`;
        var getdata = this.httpClient.get(url, {
            params: new HttpParams().append('now', now ? now : '')
                .append('measureFilter', measureFilter ? measureFilter : '')
                .append('siteTag', siteTag ? siteTag : '')
                .append('lang', lang ? lang : '')
        });
        //Need the catch(handleerror)
        return source.switchMap(res => getdata).publishReplay(1).refCount();
    };

    handleError(error: Response | any) {
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        return Observable.of({ currentData: "No Connection" });
    }
}
