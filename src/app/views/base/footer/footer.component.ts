import { Component } from '@angular/core';
import { TableModule } from 'primeng/table';
import { SharedModule } from '../../../core/share/shared.module';
import { footerContentService } from '../service/footer-content.service';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SpeedDialModule } from 'primeng/speeddial';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ResponseHandler } from 'src/app/core/helpers/response-handler';

@Component({
  selector: 'app-footer',
  imports: [
    TableModule,
    SharedModule,
    ToggleSwitchModule,
    InputSwitchModule,
    SpeedDialModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  footerContents: any[] = [];
  footerLinks: any[] = [];
  footerIcons: any[] = [];
  displayAddFooterDialog: boolean = false;
  displayUpdateFooterDialog: boolean = false;
  actions: MenuItem[] | null = null;
  newFooter: any = {
    title: '',
    iconName: '',
    link: '',
    isActive: true
  };

  selectedFooter: any = {
    title: '',
    iconName: '',
    link: '',
    isActive: true,
    footerContentID: null
  };



  constructor(
    private footerContentService: footerContentService,
    private confirmationService: ConfirmationService,
    private _responseHandler: ResponseHandler
  ) { }

  ngOnInit() {
    this.getFooterContents();

    this.actions = [
      {
        icon: 'pi pi-pencil',
        command: (footer) => {
          this.onEditFooter(footer);
        }
      },
      {
        icon: 'pi pi-trash',
        command: (footer) => {
          this.onDeleteFooter(footer);
        }
      },

    ];
  }

  getFooterContents() {
    this.footerContentService.getFooterContents().subscribe((res: any) => {
      if (res && res.isSuccess) {
        this.footerContents = res.data;
        this.footerLinks = this.footerContents.filter(x => x.title && x.isActive);
        this.footerIcons = this.footerContents.filter(x => x.iconName && x.isActive);
      }
    }, (error: any) => {
      console.log(error);
    });
  }

  onToggleActive(footerContentID: any) {
    const model = { footerContentID };

    this.footerContentService.updateFooterStatus(model).subscribe((res: any) => {
      if (res && res.isSuccess) {
        const index = this.footerContents.findIndex(item => item.footerContentID === footerContentID);
        if (index !== -1) {
          this.footerContents[index].isActive = !this.footerContents[index].isActive;

          this.footerLinks = this.footerContents.filter(x => x.title && x.isActive);
          this.footerIcons = this.footerContents.filter(x => x.iconName && x.isActive);
        }

        this._responseHandler.showwSuccess(res.data);
      }
    }, (error: any) => {
      console.log(error);
    });
  }

  openDialog() {
    this.newFooter = {
      title: '',
      iconName: '',
      link: '',
      isActive: true
    };
    this.displayAddFooterDialog = true;
  }

  closeDialog() {
    this.displayAddFooterDialog = false;
  }



  addFooterContent() {
    if (!this.newFooter.title?.trim() && !this.newFooter.iconName?.trim()) {
      this._responseHandler.showWarning('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    this.footerContentService.addFooterContent(this.newFooter).subscribe((res: any) => {
      if (res && res.isSuccess) {
        this._responseHandler.showwSuccess(res.data);
        this.getFooterContents();
        this.closeDialog();
      }
    }, (error: any) => {
      console.log(error);
    });
  }

  setCurrentFooter(footerContent: any) {
    this.selectedFooter = footerContent;
  }

  onEditFooter(footerContent: any) {
    this.displayUpdateFooterDialog = true;
  }

  onDeleteFooter(footerContent: any) {
    this.confirmationService.confirm({
      message: 'Xác nhận xóa chân trang này?',
      header: 'Cảnh báo',
      closable: true,
      closeOnEscape: true,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Hủy bỏ',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Xác nhận',
        severity: 'danger',
      },
      accept: () => {
        this.deleteFooterContent();
      }
    });
  }

  updateFooterContent() {
    if (!this.selectedFooter.title?.trim() && !this.selectedFooter.iconName?.trim()) {
      this._responseHandler.showWarning('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    this.footerContentService.updateFooterContent(this.selectedFooter).subscribe((res: any) => {
      if (res && res.isSuccess) {
        this._responseHandler.showwSuccess(res.data);
        this.getFooterContents();
        this.closeDialog();
      }
    }, (error: any) => {
      console.log(error);
    });
  }

  deleteFooterContent() {
    this.footerContentService.deleteFooterContent(this.selectedFooter.footerContentID).subscribe((res: any) => {
      if (res && res.isSuccess) {
        this._responseHandler.showwSuccess(res.data);
        this.getFooterContents();
        this.closeDialog();
      }
    }, (error: any) => {
      console.log(error);
    });
  }
}
