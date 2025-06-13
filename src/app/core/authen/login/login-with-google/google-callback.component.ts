import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-google-callback',
  template: '',
  providers: [MessageService]
})
export class GoogleCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const accessToken = params['accessToken'];

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);

        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1000);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không nhận được token từ Google.'
        });
        this.router.navigate(['/login']);
      }
    });
  }
}
