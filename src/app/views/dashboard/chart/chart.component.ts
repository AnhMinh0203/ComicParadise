
import { SharedModule } from '../../../core/share/shared.module';




import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, ChangeDetectorRef, inject, effect } from '@angular/core';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-chart',
  imports: [
    SharedModule,
    ChartModule
  ],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss'
})
export class ChartComponent {
  data: any;

  options: any;

  platformId = inject(PLATFORM_ID);

  ngOnInit() {
      this.initChart();
  }

  initChart() {
      if (isPlatformBrowser(this.platformId)) {
          const documentStyle = getComputedStyle(document.documentElement);
          const textColor = documentStyle.getPropertyValue('--p-text-color');
          const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
          const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

          this.data = {
              labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
              datasets: [
                  {
                      type: 'line',
                      label: 'Thành viên',
                      borderColor: documentStyle.getPropertyValue('--p-orange-500'),
                      borderWidth: 2,
                      fill: false,
                      tension: 0.4,
                      data: [50, 25, 12, 48, 56, 76, 42]
                  },
                  {
                      type: 'bar',
                      label: 'Đầu truyện',
                      backgroundColor: documentStyle.getPropertyValue('--p-gray-500'),
                      data: [21, 84, 24, 75, 37, 65, 34],
                      borderColor: 'white',
                      borderWidth: 2
                  },
                  {
                      type: 'bar',
                      label: 'Báo cáo',
                      backgroundColor: documentStyle.getPropertyValue('--p-cyan-500'),
                      data: [41, 52, 24, 74, 23, 21, 32]
                  }
              ]
          };

          this.options = {
              maintainAspectRatio: false,
              aspectRatio: 0.6,
              plugins: {
                  legend: {
                      labels: {
                          color: textColor
                      }
                  }
              },
              scales: {
                  x: {
                      ticks: {
                          color: textColorSecondary
                      },
                      grid: {
                          color: surfaceBorder
                      }
                  },
                  y: {
                      ticks: {
                          color: textColorSecondary
                      },
                      grid: {
                          color: surfaceBorder
                      }
                  }
              }
          };

      }
  }
}
