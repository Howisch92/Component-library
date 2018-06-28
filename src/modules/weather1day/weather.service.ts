import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable()
export class WeatherService {

    private api = 'http://localhost:3000/';

    constructor(private httpClient: HttpClient) { }

    getSiteData(nodeId: any) {
        const url = `${this.api + "sites/node/" + nodeId}`;
        return this.httpClient.get(url);
      }

    getWeatherData(ownernodeid, nodeid, gpscoords) {
        const interval = 5000;
        const source = Observable.timer(0, interval);
        const url = `${this.api + "data/weather/" + ownernodeid + "/" + nodeid}`
        var getdata = this.httpClient.get(url, { params: new HttpParams().append('geoCoords', gpscoords ? gpscoords : '') });
        return source.switchMap(res => getdata).publishReplay(1).refCount();
      }
}
