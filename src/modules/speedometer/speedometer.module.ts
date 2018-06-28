import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpeedometerComponent } from './speedometer.component';
import { SpeedometerService } from './speedometer.service';
import { HttpClientModule } from '@angular/common/http'


@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  declarations:[
    SpeedometerComponent
  ],
  exports:[
    SpeedometerComponent
  ],
  providers:[
    SpeedometerService
  ],
})
export class SpeedometerModule { }
