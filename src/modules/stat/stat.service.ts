import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import { Response } from '@angular/http';
import { switchMap } from 'rxjs/operators/switchMap';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable()
export class StatService {

  private _restStream: Observable<any>;
  public get RestStream(): Observable<any> {
    return this._restStream;
  }

  private statCacheMap: Map<number, any> = new Map<number, any>();

  private api = 'http://localhost:3000/';
  private statUrl = this.api + 'data/statisticsList/';

  constructor(private httpClient: HttpClient) { }

  getStatData(ownernodeId: any, nodeId: any, datatype: any, measureFilter: any, siteTag: any, lang: any, timestamp: any, now: any) {
    let interval = 5000;
    let ttl;
    if (datatype === 'DAY') {
      ttl = 10000;
    }
    if (datatype === 'WEEK') {
      ttl = 900000;
    }
    if (datatype === 'MONTH') {
      ttl = 1800000;
    }
    if (datatype === 'YEAR') {
      ttl = 3600000;
    }
    const source = Observable.timer(0, interval);
    const url = `${this.statUrl + ownernodeId + '/' + nodeId}`;
    var getStat = this.httpClient.get(url, {
      params: new HttpParams().append('type', datatype ? datatype : '')
        .append('timestamp', timestamp ? timestamp : '')
        .append('measureFilter', measureFilter ? measureFilter : '')
        .append('siteTag', siteTag ? siteTag : '')
        .append('lang', lang ? lang : '')
        .append('now', now ? now : '')
    });

    this._restStream = source.pipe(switchMap(result => {
      let getCachedIfExist = this.statCacheMap.get(ownernodeId + nodeId + datatype + measureFilter + siteTag + lang + timestamp);
      let now = Date.now();
      if (getCachedIfExist == null) {
        return getStat.map(result => {
          let newCachedObj: any = result;
          newCachedObj.ttl = now + ttl;
          this.statCacheMap.set(ownernodeId + nodeId + datatype + measureFilter + siteTag + lang + timestamp, newCachedObj);
          getCachedIfExist = newCachedObj;
          return getCachedIfExist;
        });
      } else if (getCachedIfExist.ttl < now) {
        return getStat.map(result => {
          let newCachedObj: any = result;
          newCachedObj.ttl = now + ttl;
          this.statCacheMap.set(ownernodeId + nodeId + datatype + measureFilter + siteTag + lang + timestamp, newCachedObj);
          getCachedIfExist = newCachedObj;
          return getCachedIfExist;
        });
      } else {
        return Observable.of(getCachedIfExist);
      }
    }));
    return this._restStream;
  }

}
