import { Component, OnInit, OnChanges } from '@angular/core';
import { Input } from '@angular/core';
import { SimpleChange } from '@angular/core/src/change_detection/change_detection_util';
import { WeatherService } from './weather.service';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/filter';
@Component({
  selector: 'app-weather-1-day',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss']
})
export class WeatherComponent implements OnInit {
  digits = null;
  colDigits = null;
  decimals = null;
  colDecimals = null;
  colUnit = null;
  unit = null;
  redraw = false;
  showDecimals = false;
  unitPrefix = '';
  obj = this;
  isStarted = false;
  el = null;
  baseurl = window.location;
  unitIndex = 0;
  factor = null;
  alive = true;
  weatherDays = null;
  geoCoords = null;
  data;
  @Input()
  nodeId: any;
  @Input()
  ownerNodeId: any;
  @Input()
  weather: any;

  weatherSubscription: Subscription;

  strDate: String;
  windSpeed: any;
  day: any;

  constructor(private weatherService: WeatherService) { }

  ngOnInit() {
    this.data =
      {
        elementid: "weather",
        noOfDays: 1,
        weathercoords: "56.179,10.105",
        interval: 3 * 60 * 60 * 1000
      };
    if (this.data != null) {
      var item = this.data;
    }
    this.initWeather(item);
    this.weatherSubscription = this.weatherService.getSiteData(this.nodeId).filter(p => !!p).map(currentdata => currentdata['GPS_COORDINATE'])
      .subscribe(gpscoords => {
        this.weatherService.getWeatherData(this.ownerNodeId, this.nodeId, gpscoords)
          .subscribe(weather => {
            this.loadWeather(weather);
          });
      });
  }
  initWeather = function (options) {
    this.el = options.elementid || null;
    this.digits = options.digits || null;
    this.colDigits = options.digitColor || null;
    this.decimals = options.decimals || null;
    this.colDecimals = options.decimalColor || null;
    this.colUnit = options.unitColor || null;
    this.unit = options.unit || null;
    this.redraw = false;
    this.showDecimals = false;
    this.unitPrefix = '';
    this.isStarted = options.started || 'true';
    this.baseurl = window.location || null;
    this.unitIndex = options.measureIndex || 0;
    this.factor = options.factor || null;
    this.geoCoords = options.weathercoords || null
    this.obj = this;

  }
  loadWeather = function (res) {
    if (res !== undefined) {
      var result = res;
      if (result && result.data && result.data.weather) {
        var weather = result.data.weather;
        this.day = weather[0];
        var d = new Date();
        d.setDate(parseInt(this.day.date.substr(8, 2)));
        d.setMonth(parseInt(this.day.date.substr(5, 2)) - 1);
        d.setFullYear(parseInt(this.day.date.substr(0, 4)));
        this.strDate = d.getDay() + "-" + d.getMonth();
        this.windSpeed = Math.round(this.day.hourly[0].windspeedKmph / 3.6);
      }
    }
  }
}
