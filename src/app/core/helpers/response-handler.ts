import { Injectable } from "@angular/core";
import { MessageService } from "primeng/api";

@Injectable({ providedIn: 'root' })
export class ResponseHandler {
  constructor(private messageService: MessageService) { }

  handleResponse<T>(res: { isSuccess: boolean; status: number; message: string; data?: T }) {
    if (res.isSuccess) {
      this.messageService.add({ severity: 'success', summary: 'Thông báo', detail: res.message });
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Thông báo', detail: res.message });
    }
  }

  showError(message: string) {
    this.messageService.add({ severity: 'error', summary: 'Thông báo', detail: message });
  }

  showWarning(message: string) {
    this.messageService.add({ severity: 'warn', summary: 'Thông báo', detail: message });
  }

  showwSuccess(message: string) {
    this.messageService.add({ severity: 'success', summary: 'Thông báo', detail: message });
  }

  showInfor(message: string) {
    this.messageService.add({ severity: 'infor', summary: 'Thông báo', detail: message });
  }
}
