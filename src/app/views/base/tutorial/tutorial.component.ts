import { Component } from '@angular/core';
import { PanelModule } from 'primeng/panel';
import { SharedModule } from '../../../core/share/shared.module';
import { SpeedDialModule } from 'primeng/speeddial';
import { MenuItem, MessageService } from 'primeng/api';
import Quill from 'quill';
import { tutorialService } from '../service/tutorial.service';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-tutorial',
  imports: [
    PanelModule,
    SharedModule,
    SpeedDialModule,
    SelectModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService],
  templateUrl: './tutorial.component.html',
  styleUrl: './tutorial.component.scss'
})
export class TutorialComponent {
  isAddTutorial: boolean = false;
  isUpdateTutorial: boolean = false;
  isDeleteTutorial: boolean = false;

  items: MenuItem[] = [];
  editorAddInstance: any;
  editorUpdateInstance: any;
  selectedTitleTutorial: any;
  tutorialTitles: any[] = [];
  tutorials: any[] = [];
  selectedTutorialID: any;
  isLoading = false;
  toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    [{ 'header': 1 }, { 'header': 2 }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'font': [] }],
    [{ 'align': [] }],
    ['clean']
  ];
  contentTutorial: any;

  constructor(
    private messageService: MessageService,
    private _tutorialService: tutorialService,
  ) { }

  ngOnInit() {
    this.items = [
      {
        icon: 'pi pi-pencil',
        command: () => this.updateTutorialForm()
      },
      {
        icon: 'pi pi-refresh',
        command: () => this.refreshTutorial()
      },
      {
        icon: 'pi pi-trash',
        command: () => this.deleteTutorialForm()
      },
      {
        icon: 'pi pi-plus',
        command: () => this.addTutorialForm()
      }
    ];
    this.getAllTutorial();
    this.getTuttorialTitles();
  }



  refreshTutorial() {
    this.isLoading = true;
    setTimeout(() => {
      this.getAllTutorial();
      this.isLoading = false;
      this.messageService.add({ severity: 'success', summary: 'Đã làm mới', detail: 'Tải dữ liệu thành công' });
    }, 1000); // chờ 1 giây để nhìn thấy spinner
  }

  initializeAddQuill() {
    if (this.editorAddInstance) return;
    const quillContainer = document.getElementById('contentAddTutorial');
    if (quillContainer) {
      this.editorAddInstance = new Quill(quillContainer, {
        theme: 'snow',
        placeholder: 'Nhập nội dung hướng dẫn...',
        modules: {
          toolbar: this.toolbarOptions
        }
      });
    }
  }

  initializeUpdateQuill() {
    if (this.editorUpdateInstance) return;
    const quillContainer = document.getElementById('contentUpdateTutorial');
    if (quillContainer) {
      this.editorUpdateInstance = new Quill(quillContainer, {
        theme: 'snow',
        placeholder: 'Nhập nội dung hướng dẫn...',
        modules: {
          toolbar: this.toolbarOptions
        }
      });
    }
  }

  addTutorialForm() {
    this.isAddTutorial = true;
    this.selectedTitleTutorial = '';
    setTimeout(() => this.initializeAddQuill(), 0);
  }

  deleteTutorialForm() {
    this.isDeleteTutorial = true;
  }

  getTuttorialTitles(){
    this._tutorialService.getTutorialTitles().subscribe(
      (res: any) => {
        if (res && res.isSuccess) {
          this.tutorialTitles = res.data;
          this.selectedTitleTutorial = null;
        } else {
          this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra!' });
        }
      },
      (error: any) => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra!' });
      }
    );
  }

  addTutorial() {
    const content = this.editorAddInstance?.root?.innerHTML || '';
    const model = {
      title: this.selectedTitleTutorial,
      content: content
    };

    this._tutorialService.addTutorial(model).subscribe(
      (res: any) => {
        if (res && res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Thêm thành công!' });
          this.getAllTutorial();
          this.closeDialogs();
        } else {
          this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra!' });
        }
      },
      (error: any) => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra!' });
      }
    );
  }

  updateTutorialForm() {
    this.isUpdateTutorial = true;
    this.getTuttorialTitles();
    setTimeout(() => this.initializeUpdateQuill(), 0);
  }

  saveTutorial() {
    const content = this.editorUpdateInstance?.root?.innerHTML || '';
    const model = {
      tutorialID: this.selectedTutorialID,
      title: this.selectedTitleTutorial,
      content: content
    };

    this._tutorialService.updateTutorial(model).subscribe(
      (res: any) => {
        if (res && res) {
          this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Thêm thành công!' });
          this.getAllTutorial();
          this.closeDialogs();

        } else {
          this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra!' });
        }
      },
      (error: any) => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra!' });
      }
    );
  }

  closeDialogs() {
    this.isAddTutorial = false;
    this.isUpdateTutorial = false;
    this.selectedTitleTutorial = '';

    if (this.editorAddInstance) {
      this.editorAddInstance.setContents([]);
  }
  if (this.editorUpdateInstance) {
      this.editorUpdateInstance.setContents([]);
  }
  }


  resetEditor(containerId: string, instance: any): any {
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = '';
    return null;
  }



  onTitleSelected(title: string) {
    const selectedTutorial = this.tutorials.find(t => t.title == title);
    this.selectedTutorialID = selectedTutorial.tutorialID;
    this._tutorialService.getContentByTitle(title).subscribe((res: any) => {
      if (res && res.isSuccess && res.data) {
        this.contentTutorial = res.data; // Giả sử đây là nội dung HTML
        const quillEditor = document.querySelector('#contentUpdateTutorial .ql-editor');
        if (quillEditor) {
          quillEditor.innerHTML = this.contentTutorial;
        }
      }
    });
  }

  getAllTutorial() {
    this._tutorialService.getAllTutorials().subscribe(
      (res: any) => {
        if (res && res.isSuccess) {
          this.tutorials = res.data;
        } else {
          this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra!' });
        }
      },
      (error: any) => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra!' });
      }
    );
  }

  deleteTutorial() {
    this._tutorialService.deleteTutorial(this.selectedTutorialID).subscribe(
      (res: any) => {
        if (res && res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Xóa thành công!' });
          this.getTuttorialTitles();
          this.getAllTutorial();
          this.closeDialogs();
        } else {
          this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra!' });
        }
      },
      (error: any) => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra!' });
      }
    );
  }


}
