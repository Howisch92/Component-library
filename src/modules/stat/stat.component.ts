import { Component, AfterViewInit, Injectable, OnChanges, HostListener,OnInit } from '@angular/core';
var Chart = require("../../../src/assets/scripts/chart");
import { window } from 'rxjs/operator/window';
var dateFormat = require('../../../src/assets/scripts/dateformat');
import { HttpClient } from '@angular/common/http';
import { Input, EventEmitter, Output } from '@angular/core';
import { last } from 'rxjs/operator/last';
import { SimpleChange } from '@angular/core/src/change_detection/change_detection_util';
import { Subscription } from 'rxjs/Subscription';
import { StatService } from './stat.service';

@Component({
  selector: 'app-stat',
  templateUrl: './stat.component.html',
  styleUrls: ['./stat.component.scss'],
  providers:[StatService]
  
})
@Injectable()
export class StatComponent {
  options: any;
  @Input()
  statId: string;
  @Input()
  nodeId: any;
  @Input()
  ownerNodeId: any;
  @Input()
  measureFilter: string;
  @Input()
  updatedChartTime: any;
  @Input()
  chartType: any;
  @Output()
  chartClickEvent: EventEmitter<any> = new EventEmitter();

  chartTime = (new Date()).getTime();
  obj = this;
  noConnectionBox = "";
  el: any;
  statdate: any;
  isStarted: any;
  ignoreCache: any;
  lang: any;
  siteTag: any;
  unitIndex: any;
  unit: any;
  statLoaded = false;
  timeout: any;
  datatype: string;
  displaytype: string;
  colChart: any;
  chart: any;
  graphtype: string;
  errorCallback: any;
  callback: any;
  chartLoadingInterval = null;
  interval: number;
  connectionLost: boolean = false;
  loading: boolean = false;
  groups = ["DAY", "WEEK", "MONTH", "YEAR"];
  selectedItem: string;
  subscription = new Subscription();

  constructor(private statService: StatService) {}

  ngOnInit(){
  }

  ngAfterViewInit() {
    this.options = [{ elementid: "stat" + this.statId, nodeid: this.nodeId, ownerid: this.ownerNodeId, measureFilter: this.measureFilter, datatype: 'stat', interval: 5000, displaytype: 'day', }];
    this.createChart(this.options);
    this.statService.getStatData(this.ownerNodeId,this.nodeId,this.chartType,this.measureFilter,null,null,new Date().getTime(),null).subscribe(res => { 
      this.statisticsCallback(res);
    });
  }

  ngOnChanges(changes: SimpleChange) {
    if (changes['chartType']) {
      this.loading = true;
    }
    if (changes['updatedChartTime']) {
      this.loading = true;
    }
  }
  createChart(options) {
    var options = options[0];
    var defaultTpl = "<table><tr>{ITEMS}</tr></table>";
    var defaultItemTpl = "<td id='weather_day_{INDEX}' class='weather_day'><div class='weather-date'>{DATE}</div><div class='weather-img'>{IMAGE}</div><div class='weather-temp max'>{MAXTEMP} &deg;C</div><div class='weather-temp min'>{MINTEMP} &deg;C</div><div class='weather-wind'>{WINDDIRECTION} {WINDSPEED} m/s</div><div class='weather-rain'>{RAIN} mm</div></td>";
    this.el = options.elementid || null;
    this.ownerNodeId = options.ownerid || null;
    this.nodeId = options.nodeid || this.ownerNodeId;
    this.datatype = options.datatype || 'current';
    this.displaytype = options.displaytype || 'year';
    this.statdate = options.statdate || null;
    this.interval = options.interval || 5000;
    this.unit = options.unit || null;
    this.colChart = options.chartColor || null;
    this.graphtype = options.chartType || 'bar';
    this.unitIndex = options.measureIndex || 0;
    this.callback = options.callback || null;
    this.errorCallback = options.error || null;
    this.timeout = options.timeout || 1000 * 60;
    this.measureFilter = options.measureFilter || null;
    this.siteTag = options.siteTag || null;
    this.lang = options.language || null;
    this.startChart();
  }

  startChart() {
    if (this.obj.datatype == "stat") {
      this.chart = new Chart.Chart(this.obj.el + "-body", this.graphtype);
      if (this.colChart != null) {
        if (typeof this.colChart == 'object') {
          this.chart.setChartColors(this.colChart);
        } else {
          this.chart.setColor(this.colChart);
        }
      }
      this.chart.redraw();
    }
    this.noConnectionBox = "<div id='" + this.obj.el + "-noConnectionBox' class='noConnectionBox'>Forbindelsen til serveren er tabt!</div>";
  }
  onResize(event) {
    this.chart.redraw();
  }
  initChart(elementId) {
    this.jqplotEventClick();
  };
  jqplotEventClick() {
    var obj = this.obj
    $("#stat1-body").bind('jqplotDataClick',
      function (ev, seriesIndex, pointIndex, data) {
        var d = new Date(obj.chartTime);
        obj.chartClickEvent.emit({ pointIndex: pointIndex, data: data, seriesIndex: seriesIndex, ev: ev });
      })
  };

  statisticsCallback(result) {
    if (result && result.statisticsList) {

      if (this.unitIndex >= result.statisticsList.length) {
        this.unitIndex = result.statisticsList.length - 1;
      }
      if (this.unitIndex < 0) {
        this.unitIndex = 0;
      }
      var data = result.statisticsList[this.unitIndex];
      this.connectionLost = false;
      if (this.chart && data) {
        this.chart.setLabels(null, data.yLabel, data.xLabel);
        var niceMax = 100;
        var niceMin = 0;
        var factor = parseFloat(data.factor ? data.factor : 1);
        if (data.maxValue) {
          niceMax = data.maxValue / factor;
          this.chart.setMax(niceMax);
        }
        if (data.data && data.data.length > 0) {
          var calcUnit = this.unit;
          if (this.unit == null) {
            calcUnit = data.valueUnit;
          }
          var uPrefix = "";
          if ("Liter" == data.valueUnit || "L" == data.valueUnit) {
            if (factor == 1000) {
              calcUnit = "m3";
            }
          } else {
            if (factor == 1000) {
              uPrefix = "k";
            } else if (factor == 1000000) {
              uPrefix = "M";
            } else if (factor == 1000000000) {
              uPrefix = "G";
            }
          }
          if (calcUnit != "") {
            calcUnit = uPrefix + calcUnit;
          }
          var d = new Array(data.data.length);
          var l = new Array(data.data.length);
          var t = new Array(data.data.length);
          var ad = new Array(data.data.length);
          var at = new Array(data.data.length);
          var date = new Date();
          date.setMinutes(date.getMinutes() - data.length);
          for (let i = 0; i < data.data.length; i++) {
            l[i] = " ";
            if (data.data.length < 13) {
              //l[i] = date.getHours() + ":" + ((date.getMinutes() < 10? '0' : '') + date.getMinutes())
              l[i] = data.data[i].name;
            }
            d[i] = data.data[i].value / factor;
            var adata = 0;
            if (data.additionalData && data.additionalData[i]) {
              adata = data.additionalData[i] / factor;
            }
            ad[i] = adata;
            t[i] = (Math.round((ad[i] + d[i]) * 100) / 100);
            if (ad[i] > 0) {
              t[i] += " ( " + (Math.round((d[i]) * 100) / 100) + " ) ";
            }
            t[i] += " " + calcUnit;
            at[i] = (Math.round((ad[i] + d[i]) * 100) / 100);
            if (d[i] > 0) {
              at[i] += " ( " + (Math.round((ad[i]) * 100) / 100) + " ) ";
            }
            at[i] += " " + calcUnit;
            if (d[i] + ad[i] > niceMax) {
              niceMax = d[i] + ad[i];
            }
            if (d[i] + ad[i] < niceMin) {
              niceMin = d[i] + ad[i];
            }
          }
          this.chart.setMax(niceMax, niceMin);
          this.chart.setData(d, l, t, ad, at);
          // this.chart.setTooltips(t);
          this.statLoaded = true;
        } else {
          var d = new Array(1);
          var l = new Array(1);
          var t = new Array(1);
          var ad = new Array(1);
          var at = new Array(1);
          d[0] = 0;
          ad[0] = 0;
          l[0] = "";
          t[0] = "";
          at[0] = "";
          this.chart.setData(d, l, t, ad, at);
        }
      }
    }
    if (this.chartLoadingInterval != null) {
      clearTimeout(this.chartLoadingInterval);
      this.chartLoadingInterval = null;
    }
  };

  changeDate(delta, date) {
    var d;
    if (date) {
      d = date;
    } else {
      d = new Date(this.chartTime);
    }
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);
    var today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    switch (this.chartType) {
      case "DAY":
        d = d.setDate(d.getDate() + delta);
        break;
      case "WEEK":
        delta *= 7;
        //					d = getMonday(new Date(d.setDate(d.getDate()+delta))).getTime();
        d = d.setDate(d.getDate() + delta);
        break;
      case "MONTH":
        //				d = d.setDate(1);
        d = new Date(d).setMonth(new Date(d).getMonth() + delta);
        break;
      case "YEAR":
        //				d = d.setDate(1);
        //				d = new Date(d).setMonth(0);
        d = new Date(d).setFullYear(new Date(d).getFullYear() + delta);
        break;
      default:
    }
    if (d > today.getTime() && delta > 0) {
      return;
    }
    this.chartTime = d;
  };
  getCharset() {
    var charset = "";
    if (document.charset) {
      charset = document.charset.toLowerCase();
    } else if (document.characterSet) {
      charset = document.characterSet.toLowerCase();
    }
    return charset;
  }
  getInterval() {
    return this.interval;
  }
  getChartType() {
    return this.chartTime;
  }
  noConnection() {
    this.connectionLost = true;
  }
}