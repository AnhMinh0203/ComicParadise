import { Component } from '@angular/core';
import { WidgetsCardComponent } from './widgets-card/widgets-card.component';
import { ChartComponent } from './chart/chart.component';


@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
  standalone: true,
  imports: [
    WidgetsCardComponent,
    ChartComponent
  ]
})
export class DashboardComponent {}
