import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatComponent } from './stat.component';
import { StatService } from './stat.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    StatComponent
  ],
  exports:[
    StatComponent
  ],
  providers:[
    StatService
  ]
})
export class StatModule { }
