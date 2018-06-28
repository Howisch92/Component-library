import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class OdometerService {

    private _restStream: Observable<any>;
    public get RestStream(): Observable<any> {
        return this._restStream;
    }
    private api = 'http://localhost:3000/';

    constructor(private httpClient: HttpClient) { }

    getOdometerData(ownernodeId: any, nodeId: any, datatype: any, measureFilter: any, siteTag: any, lang: any) {
        const interval = 5000;
        const source = Observable.timer(0, interval);
        const url = `${this.api + 'data/json_data/' + ownernodeId + '/' + nodeId}`;
        var getdata = this.httpClient.get(url, {
          params: new HttpParams().append('type', datatype ? datatype : '')
            .append('measureFilter', measureFilter ? measureFilter : '')
            .append('siteTag', siteTag ? siteTag : '')
            .append('lang', lang ? lang : '')
        });
        return source.switchMap(result => getdata).publishReplay(1).refCount();
    
      }
}