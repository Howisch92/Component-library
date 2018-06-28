import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OdometerComponent } from './odometer.component';
import { OdometerService } from './odometer.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    OdometerComponent
  ],
  exports:[
    OdometerComponent
  ],
  providers:[
    OdometerService
  ]
})
export class OdometerModule { }
