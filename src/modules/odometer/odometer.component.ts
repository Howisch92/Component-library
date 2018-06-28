"use strict";
import { Component, AfterViewInit, OnInit ,OnChanges, SimpleChange, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { OdometerService } from './odometer.service';

var Odometer = require('../../../src/assets/scripts/odometer');

@Component({
  selector: 'app-odometer',
  templateUrl: './odometer.component.html',
  styleUrls: ['./odometer.component.scss']
})
export class OdometerComponent implements AfterViewInit {
  odometer: any;
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
  
  interval: any;
  siteTag: any;
  lang: any;
  connectionLost:boolean = false;


  @Input()
  odoId: string;
  @Input()
  nodeId: string;
  @Input()
  ownerNodeId: string;
  @Input()
  measureFilter: string;
  datatype: string;
  @Input()
  data: any;

  odometerSubscription: Subscription;

  constructor(private odometerService: OdometerService) { }

  ngOnInit(){
    this.odometerSubscription = this.odometerService.getOdometerData(this.ownerNodeId,this.nodeId,null,this.measureFilter,null,null)
    .map(currentdata => currentdata['currentData'])
    .subscribe(result => {
      this.odometerCallback(result);
    });
  }

  ngOnChanges(change: SimpleChange) {
    if(!change['data'] && this.odometer) {
      this.odometer.stopAnimation();
      this.odometer.drawNumber(0);
    } else if(change['data'] && this.odometer) {
      if(change['data'].currentValue === "No Connection") {
        this.noConnection();
      } else {
      this.odometerCallback(change['data'].currentValue);
      }
    }
  }

  ngAfterViewInit() {
    var data =
      {
        elementid: "odometer",
        measureFilter: this.measureFilter,
        siteTag: this.siteTag,
        language: this.lang,
        datatype: this.datatype,
        interval: 5000,
      };
    if (data != null) {
      var item = data;
      item.elementid += this.odoId;
      this.initOdometer(item);
    }
  }
  onResize(e) {
    this.odometer.redraw();
  }

  initOdometer(options) {
    this.interval = options.interval || 5000;
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
    this.datatype = options.datatype || 'today';


    this.obj = this;

    this.createOdometer();
    this.start();
  }

  getOdometer = function () {
    return this.odometer;
  };

  start = function () {
    this.obj.isStarted = 'true';
    this.loadData();
  };

  createOdometer() {
    this.odometer = new Odometer.Odometer(this.obj.el, { digits: 6 });

  }

  loadData = function () {
    if (this.isStarted == 'true') {
      this.odometerCallback(this.data)
    }
  }

  odometerCallback = function (result) {
    if (result) {
      var data = result[this.unitIndex];
      this.connectionLost = false;
      var value = null;
      var max = null;
      var min = null;
      var redraw = this.obj.redraw;
      var calcFactor = this.factor;
      if (data.dailyData == null) {
        data.dailyData = 0;
        $(".odometer").hide();
        $("#labelToday").parent().hide();
        return;
      } else {
        $(".odometer").show();
      }

      value = data.dailyData;
      if (value != null) {
        if (this.unit == null) {
          this.unit = data.dailyDataUnit;
        }
        if (this.factor == null) {
          calcFactor = 1;
          this.unitPrefix = "";
          this.showDecimals = false;
          //TODO This is somewhat of a HACK!!!
          if ("Liter" == data.dailyDataUnit || "L" == data.dailyDataUnit) {
            if (value > 99999) {
              calcFactor = 0.001;
              this.showDecimals = true;
              if (this.unit == null) {
                this.unit = "m3";
              }
            }
          } else {
            if ("Wh" == data.dailyDataUnit || value > 99999) {
              calcFactor = 0.001;
              this.unitPrefix = "k";
              this.showDecimals = true;
            }
            if (value > 99999999) {
              calcFactor = 0.000001;
              this.unitPrefix = "M";
              this.showDecimals = true;
            }
            if (value > 99999999999) {
              calcFactor = 0.000000001;
              this.unitPrefix = "G";
              this.showDecimals = true;
            }
          }
        }
      }
    }

    if (value != null) {
      var noDecimal = this.decimals;
      if (noDecimal == null) {
        if ((value * calcFactor) < 1) {
          noDecimal = 3;
        } else if ((value * calcFactor) < 10) {
          noDecimal = 2;
        } else {
          noDecimal = 1;
        }
      }
      var pow = Math.pow(10, noDecimal);
      value = Math.round((value * calcFactor) * pow) / pow;
      max = Math.round((data.currentMax * calcFactor) * pow) / pow;
      min = Math.round(((data.currentMin ? data.currentMin : 0) * calcFactor) * pow) / pow;
      this.obj.redraw = redraw;
      this.setValue(value, min, max, redraw);
    }
  }

  setValue = function (value, min, max, redraw) {
    var calcUnit = this.unit;
    if (calcUnit == null) {
      calcUnit = "";
    }
    if (calcUnit != "") {
      calcUnit = this.unitPrefix + calcUnit;
    }
    if (this.showDecimals || this.decimals != null) {
      this.odometer.setDigits(this.digits == null ? 5 : this.digits);
      this.odometer.setDecimals(this.decimals == null ? 1 : this.decimals);
      if (this.colDecimals != null) {
        this.odometer.setDecimalColor(this.colDecimals);
      }
    } else {
      this.odometer.setDigits(this.digits == null ? 6 : this.digits);
      this.odometer.setDecimals(this.decimals == null ? 0 : this.decimals);
    }
    if (this.colDigits != null) {
      this.odometer.setDigitColor(this.colDigits);
    }
    if (this.colUnit != null) {
      this.odometer.setUnitColor(this.colUnit);
    }
    this.odometer.setUnit(calcUnit);
    if (value === 0) {
      this.odometer.drawNumber(value);
    } else {
      this.odometer.animatedUpdate(value, 1000);
    }
    if (this.element) {
      var dec = 0;
      if (this.showDecimals || this.decimals != null) {
        dec = this.decimals == null ? 1 : this.decimals;
      }
      var val = value.toFixed(dec);
      if (calcUnit != "") {
        val += " " + calcUnit;
      }
      this.element.html(val);
    }
  };
  noConnection() {
    this.connectionLost = true;
    this.odometer.drawNumber(0);
  }
}

