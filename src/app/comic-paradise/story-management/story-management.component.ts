import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { ButtonModule, CardModule, FormModule } from '@coreui/angular';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { PaginatorState } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { RatingModule } from 'primeng/rating';
import { ButtonModule as PrimeUIButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SplitButtonModule } from 'primeng/splitbutton';
import { HttpClientModule } from '@angular/common/http';
import { FileUploadModule } from 'primeng/fileupload';
import { ImageModule } from 'primeng/image';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { EditorModule } from 'primeng/editor';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
// ---

import { ConfirmationService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { storyService } from '../service/story.service';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { TabViewModule } from 'primeng/tabview';
import { getUserIdFromToken } from '../../core/helpers/token-helper';
import { ResponseHandler } from '../../core/helpers/response-handler';
interface Story {
  StoryID: number;
  Title: string;
  Status: string;
  CoverImage: string;
  category: string;
  PublisherName: number;
  TotalChapter: string;
}

@Component({
  selector: 'app-story-management',
  standalone: true,
  imports: [
    CardModule,
    ButtonModule,
    TableModule,
    RatingModule,
    PrimeUIButtonModule,
    TagModule,
    PaginatorModule,
    FormModule,
    RouterOutlet,
    CommonModule,
    DialogModule,
    SelectModule,
    EditorModule,
    FileUploadModule,
    ImageModule,
    FormsModule,
    InputTextModule,
    HttpClientModule,
    ConfirmDialog,
    ToastModule,
    TabsModule,
    MenuModule,
    TabViewModule,
    SplitButtonModule

  ],
  providers: [ConfirmationService],
  templateUrl: './story-management.component.html',
  styleUrl: './story-management.component.scss',
  encapsulation: ViewEncapsulation.None
})


export class StoryManagementComponent {
  @ViewChild('dt') dt?: Table;
  @ViewChild('menu') menu!: Menu;

  first: number = 0;
  rows: number = 5;
  isAddstoryPage: boolean = false;
  isInforstoryPage: boolean = false;
  isUpdateStoryPage: boolean = false;
  isContentChapterPage: boolean = false;

  visible: boolean = false;

  primaryImg: any;
  title = 'User';


  keySearch: any;


  stories!: Story[];
  myStories!: Story[];
  pendingStories!: Story[];

  selectedStory: any;
  items: MenuItem[] | undefined;
  itemApproval: MenuItem[] | undefined;
  activeIndex: number = 0;
  userID: any;
  constructor(
    private router: Router,
    private confirmationService: ConfirmationService,
    private _storyService: storyService,
    private _responseHandler: ResponseHandler
  ) {
    this.router.events.subscribe(() => {
      this.isAddstoryPage = this.router.url.includes('/story-management/add-story');
      this.isInforstoryPage = this.router.url.includes('/story-management/infor-story');
      this.isUpdateStoryPage = this.router.url.includes('/story-management/update-story');
      this.isContentChapterPage = this.router.url.includes('/story-management/chapter-content');
    });
  }


  ngOnInit() {
    this.userID = getUserIdFromToken();
    this.onTabChange({ index: 0 });
    this.items = [
      { label: 'Xem nội dung', icon: 'pi pi-file-check', command: () => this.onDetail(this.selectedStory?.storyID) },
      {
        label: 'Gỡ / Hủy gỡ',
        icon: 'pi pi-delete-left',
        command: () => {
          if (this.selectedStory) {
            // Đổi trạng thái dựa vào trạng thái hiện tại
            const newStatus = this.selectedStory.status === "Rejected" ? "Approved" : "Rejected";
            this.updateStatus(newStatus, this.selectedStory.storyID);
          }
        }
      },
      { label: 'Cập nhật', icon: 'pi pi-pen-to-square', command: () => this.onEdit(this.selectedStory.storyID) },
      { label: 'Xóa', icon: 'pi pi-trash', command: (event: any) => this.onDelete(this.selectedStory.storyID, event) }
    ];

    this.itemApproval = [
      { label: 'Phê duyệt', icon: 'pi pi-check', command: () => this.approveStory(this.selectedStory) },
      { label: 'Từ chối', icon: 'pi pi-times', command: () => this.rejectStory(this.selectedStory) }
    ];



  }
  exportExcel() {
    this._responseHandler.showInfor('Chức năng xuất Excel đang phát triển');
  }

  navigateToAddStory() {
    this.router.navigate(['/story-management/add-story']);
  }

  navigateToInforStory(storyID: number) {
    this.router.navigate(['/story-management/infor-story', storyID]);
  }

  navigateToUpdateStory(storyID: number) {
    this.router.navigate(['/story-management/update-story', storyID]);
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
  }

  setCurrentStory(story: any) {
    this.selectedStory = story;
  }

  getSeverity(status: string): "success" | "danger" | "warn" | undefined {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Pending':
        return 'warn';
      case 'Rejected':
        return 'danger';
      default:
        return undefined;
    }
  }

  onUpload(event: any) {
    const file = event.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.primaryImg = e.target.result; // Set the image source to the uploaded file's data URL
      console.log('Image Source:', this.primaryImg); // Check the image source in the console
    };
    reader.readAsDataURL(file); // Convert the file to a data URL for image preview
  }

  confirm_delete(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Xác nhận xóa truyện ',
      header: 'Cảnh báo',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Hủy bỏ',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Đồng ý',
        severity: 'danger',
      },

      accept: () => {
        this._responseHandler.showwSuccess('Xóa thành công');
      },
      reject: () => {
        this._responseHandler.showInfor('Bạn đã từ chối');
      },
    });
  }


  onTabChange(event: any) {
    const tabIndex = event.index;
    if (tabIndex == 0) {

      this.loadMyStories();
    } else if (tabIndex == 1) {
      this.loadStories();
    } else if (tabIndex == 2) {
      this.loadPendingStories();
    }
  }

  loadMyStories() {
    this._storyService.getMyStories(this.userID).subscribe((res: any) => {
      if (res) {
        this.myStories = res.data;
      }
    });
  }

  loadStories() {
    this._storyService.getStories().subscribe((res: any) => {
      if (res) {
        this.stories = res.data;
      }
    });
  }

  loadPendingStories() {
    this._storyService.getPendingStories("Pending").subscribe((res: any) => {
      if (res) {
        this.pendingStories = res.data;
      }
    });
  }

  onEdit(storyID: number) {
    this.navigateToUpdateStory(storyID);
  }


  onDelete(storyID: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Bạn có chắc muốn xóa truyện này ?',
      header: 'Cảnh báo',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Hủy bỏ',
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
        this._storyService.deleteStory(storyID).subscribe((res: any) => {
          if (res && res.isSuccess == true) {
            this._responseHandler.showwSuccess(res.data);
            this.loadStories();
            return;
          }
          else {
            this._responseHandler.showWarning(res.data);
            return;
          }
        });
      }
    });
  }

  onDetail(storyID: number) {
    this.navigateToInforStory(storyID);
  }

  updateStatus(status: string, storyID: number) {
    this._storyService.updateStatus(status, storyID).subscribe((res: any) => {
      console.log(res);
      if (res && res.isSuccess == true) {
        this._responseHandler.showwSuccess(res.data);
        this.loadStories();
        return;
      }
      else {
        this._responseHandler.showWarning(res.data);
        return;
      }
    });
  }
  searchStory() {
    this._storyService.searchStories(this.keySearch).subscribe((res: any) => {
      if (res && res.isSuccess == true) {
        this.stories = res.data;
      }
      else {
        this._responseHandler.showWarning("Truyện không tồn tại");
      }
    });
  }

  getActionItems(story: any): MenuItem[] {
    return [
      {
        label: 'Phê duyệt',
        icon: 'pi pi-check',
        command: () => this.approveStory(story)
      },
      {
        label: 'Từ chối',
        icon: 'pi pi-times',
        command: () => this.rejectStory(story)
      }
    ];
  }

  approveStory(story: any) {
    this.updateStatus("Approved", story.storyID);
  }
  rejectStory(story: any) {
    this.updateStatus("Rejected", story.storyID);
  }
}
