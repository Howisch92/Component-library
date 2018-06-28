import { Component, AfterViewInit, OnInit, OnChanges, Input } from '@angular/core';

import { SimpleChange } from '@angular/core/src/change_detection/change_detection_util';
import { SpeedometerService } from './speedometer.service';
import { Subscription } from 'rxjs';

// Havent found a solution yet, where external dependantcies is added to the "packaged" node module
var speedo = require("../../../src/assets/scripts/speedometer/speedometer_new");

@Component({
  selector: 'app-speedometer',
  templateUrl: './speedometer.component.html',
  styleUrls: ['./speedometer.component.scss'],
  providers:[SpeedometerService]
})
export class SpeedometerComponent implements AfterViewInit {
  speedometer: any;
  @Input()
  nodeId: any;
  @Input()
  speedometerId: string;
  @Input()
  ownerNodeId: any;
  @Input()
  measureFilter: string;

  datatype: string;
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
  siteTag: any;
  lang: any;
  displaytype: any;
  useColorGrade: any;

  subscription: Subscription;

  constructor(private speedometerService:SpeedometerService) { }

  ngOnInit() {
    this.subscription = this.speedometerService.getSpeedometerData(this.ownerNodeId,this.nodeId,null,this.measureFilter,null,null,null).map(currentdata => currentdata['currentData'])
    .subscribe(result => {
      this.speedometerCallback(result);
    });
  }

  ngAfterViewInit() {
    var data = {
      elementid: "speedometer",
      measureFilter: this.measureFilter,
      siteTag: this.siteTag,
      language: this.lang,
      datatype: this.datatype,
    }
    if (data != null) {
      var item = data;
      item.elementid += this.speedometerId;
      this.initSpeedometer(item || null);
    }
  }

  onResize(e) {
    this.speedometer.redraw();
  }

  initSpeedometer(options) {
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
    this.datatype = options.datatype || 'current';
    this.displaytype = options.displaytype || 'speedometer';
    this.useColorGrade = options.useColorGrade || 'true';
    this.obj = this;
    this.createSpeedometer();
  }

  getSpeedometer = function () {
    return this.speedometer;
  };

  loadData = function () {
    if (this.isStarted == 'true') {
      this.speedometerCallback(this.data)
    }
  }

  speedometerCallback = function (result) {
    if (result) {
      var data = result[0];
      var value = null;
      var max = null;
      var min = null;
      var redraw = this.obj.redraw;
      var calcFactor = this.factor;
      var current = data.currentData;
      value = data.currentData;
      if(data.currentMax){
      max = data.currentMax;
      } else {
        max = null;
      }
      this.unit = data.currentDataUnit;
      if (max) {
        if (this.factor == null) {
          calcFactor = 1;
          if (this.unitPrefix != "") {
            this.unitPrefix = "";
            redraw = true;
            this.showDecimals = false;
          }
          if ("L/h" == data.currentDataUnit) {
            if (max > 9999) {
              calcFactor = 0.001;
              redraw = true;
              this.showDecimals = true;
              if (this.unit == null) {
                this.unit = "m3/h";
              }
            }
          } else {
            if (max > 9999) {
              calcFactor = 0.001;
              if (this.unitPrefix != "k") {
                this.unitPrefix = "k";
                redraw = true;
                this.showDecimals = true;
              }
            }
            if (max > 9999999) {
              calcFactor = 0.000001;
              if (this.unitPrefix != "M") {
                this.unitPrefix = "M";
                redraw = true;
                this.showDecimals = true;
              }
            }
            if (max > 9999999999) {
              calcFactor = 0.000000001;
              if (this.unitPrefix != "G") {
                this.unitPrefix = "G";
                redraw = true;
                this.showDecimals = true;
              }
            }
          }
        }
      }

      if (data.dataType == "NEUTRAL") {
        this.speedometer.useColorGrade(false);
      } else if (data.dataType == "PRODUCTION") {
        this.speedometer.useColorGrade(this.useColorGrade == 'true' ? true : false);
        this.speedometer.setRedThreshold(0);
        this.speedometer.setYellowThreshold(0.5);
        this.speedometer.setGreenThreshold(1);
      } else if (data.dataType == "USAGE") {
        this.speedometer.useColorGrade(this.useColorGrade == 'true' ? true : false);
        this.speedometer.setRedThreshold(1);
        this.speedometer.setYellowThreshold(0.5);
        this.speedometer.setGreenThreshold(0);
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
  }

  setValue = function (value, min, max, redraw) {
    var calcUnit = this.unit;
    if (calcUnit == null) {
      calcUnit = "";
    }
    if (calcUnit != "") {
      calcUnit = this.unitPrefix + calcUnit;
    }
    if (redraw || (max && max > this.speedometer.max())) {
      this.obj.redraw = false;
      if (this.showDecimals || this.decimals != null) {
        var noDecimal = this.decimals;
        var noDigits = this.digits;
        if (noDigits == null) {
          if (value < 1) {
            noDigits = 1;
          } else if (value < 10) {
            noDigits = 2;
          } else {
            noDigits = 4;
          }
        }
        if (noDecimal == null) {
          if (value < 1) {
            noDecimal = 3;
          } else if (value < 10) {
            noDecimal = 2;
          } else {
            noDecimal = 1;
          }
        }
        this.speedometer.setDigits(noDigits);
        this.speedometer.setDecimals(noDecimal);
      } else {
        this.speedometer.setDigits(this.digits == null ? 5 : this.digits);
        this.speedometer.setDecimals(this.decimals == null ? 0 : this.decimals);
      }
      var niceRange = this.obj.getNiceRange(min, max, 10);
      this.speedometer.setMax(niceRange[niceRange.length - 1]);
      this.speedometer.setMin(niceRange[0]);
      this.speedometer.setRealMin(min);
      this.speedometer.setRealMax(max);
      this.speedometer.setMeterTicksCount(niceRange.length - 1);
      if (this.colDigits != null) {
        this.speedometer.setDigitColor(this.colDigits);
      }
      if (this.colDecimals != null) {
        this.speedometer.setDecimalColor(this.colDecimals);
      }
      this.speedometer.draw();
    }
    if (calcUnit != this.speedometer.unit) {
      this.speedometer.setUnit(calcUnit);
      this.speedometer.draw();
    }
    try {
      this.speedometer.animatedUpdate(value, null, null, 1000);
    } catch (e) {
      // ignorecreateSpeedometer
    }
  };

  createSpeedometer() {
    this.speedometer = new speedo.Speedometer(this.obj.el, { theme: 'default' });
    this.speedometer.draw();
  };

  getNiceRange = function (minVal, maxVal, steps) {
    var nice_steps = [1, 2, 2.5, 3, 4, 5, 7.5, 10];
    var delta = (maxVal - minVal) / steps;
    var scale = 1.0;
    while (true) {
      var diff = Math.abs(delta - Math.floor(delta));
      if (diff < 0.0001) {
        break;
      }
      if (scale > 1000) {
        break;
      }
      scale *= 10;
      delta *= 10;
    }
    while (delta > 10) {
      delta /= 10;
      scale /= 10;
    }

    var minNice = nice_steps[0];
    var maxNice = nice_steps[nice_steps.length - 1];
    for (var i = 0; i < nice_steps.length; i++) {
      var nice = nice_steps[i];
      var diff = Math.abs((nice / scale) - Math.floor(nice / scale));
      if ((nice / scale) > 10 || diff == 0) {
        if (delta >= nice && minNice < nice) {
          minNice = nice;
        }
        if (delta <= nice && maxNice > nice) {
          maxNice = nice;
        }
      }
    }

    var minDiff = delta - minNice;
    var maxDiff = delta - maxNice;
    delta = (minDiff < maxDiff) ? minNice : maxNice;
    delta /= scale;

    var min = minVal % delta;
    if (min > 0) {
      minVal -= min;
    } else if (min < 0) {
      minVal -= (min + delta);
    }
    var max = maxVal % delta;
    if (max > 0) {
      maxVal += delta - max;
    } else if (max < 0) {
      maxVal -= max;
    }

    var size = Math.floor(1 + (maxVal - minVal) / delta);
    var result = new Array(size);
    for (var idx = 0; idx < size; idx++) {
      result[idx] = Math.floor(minVal + (idx * delta));
    }

    return result;
  };
}
