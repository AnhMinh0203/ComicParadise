import { Component, OnInit } from '@angular/core';
import {SharedModule} from '../../../core/share/shared.module';
import { storyService } from '../../service/story.service';
import { categoryService } from '../../service/category.service';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { FileUploadModule } from 'primeng/fileupload';
import Quill from 'quill';

interface CommentNode {
  key: string;
  label: string; // Tên người dùng (ví dụ: "Abc")
  avatar: string; // Chuỗi cho avatar (ví dụ: "U")
  content: string; // Nội dung bình luận (ví dụ: "Truyện hay nha :>")
  time: string; // Thời gian (ví dụ: "3 giờ trước")
  children?: CommentNode[]; // Chỉ chứa các reply trực tiếp (không lồng sâu hơn)
}

@Component({
  selector: 'app-update-story',
  imports: [
    SharedModule,
    CardModule,
    FileUploadModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './update-story.component.html',
  styleUrl: './update-story.component.scss'
})
export class UpdateStoryComponent {
  chapterNumber:any;
  title: any;
  author: any;
  categories: any;
  categoriesSelect: any;
  description: any;
  publisher: any;
  coverImage: any;
  coverImageDisplay: any;
  chapterContent:any;

  editorInstance:any;

  isAddChapter: boolean = false;
  isAddNovel: boolean = false;
  isAddManga: boolean = false;
  isAddMangaPdf: boolean = false;
  isAddMangaImgs: boolean = false;

  //
  index:any;
  showValue:any;
  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private router: Router,
    private _storyService: storyService,
    private _categoryService: categoryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,

  ) { }

  typeStoryOptions: any[] = [{ label: 'Tiểu thuyết', value: 'Novel' }, { label: 'Truyện tranh', value: 'Manga' }];
  typeMangaOptions: any[] = [{ label: 'PDF', value: 'Pdf' }, { label: 'Ảnh', value: 'Imgs' }];
  selectStoryType: any;
  selectMangaType: any;

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
    ['clean']  // remove formatting button
  ];

  initializeQuill() {
    const quillContainer = document.getElementById('contentNovelStory');
    if (quillContainer) {
      this.editorInstance = new Quill(quillContainer, {
        theme: 'snow',
        placeholder: 'Nhập nội dung truyện...',
        modules:{
          toolbar: this.toolbarOptions
        }
      });
    }
  }

  childComments!: CommentNode[];
  ngOnInit() {
    this.getCategories();
    this.selectStoryType = this.typeStoryOptions[1].value;
    this.childComments = [
      {
        key: '0',
        label: '4 phản hồi',
        avatar: 'U',
        content: 'Truyện hay nha :>',
        time: '3 giờ trước',
        children: [
          {
            key: '0-0',
            label: 'Người Dùng 2',
            avatar: 'N',
            content: 'Cảm ơn bạn, mình cũng thích!',
            time: '4 giờ trước',
            children: [] // Không có reply con cho reply này
          },
          {
            key: '0-1',
            label: 'Người Dùng 3',
            avatar: 'P',
            content: 'Truyện này tuyệt vời quá!',
            time: '3.5 giờ trước',
            children: [] // Không có reply con cho reply này
          }
          ,
          {
            key: '0-1',
            label: 'Người Dùng 3',
            avatar: 'P',
            content: 'Truyện này tuyệt vời quá!',
            time: '3.5 giờ trước',
            children: [] // Không có reply con cho reply này
          }
          ,
          {
            key: '0-1',
            label: 'Người Dùng 3',
            avatar: 'P',
            content: 'Truyện này tuyệt vời quá!',
            time: '3.5 giờ trước',
            children: [] // Không có reply con cho reply này
          }
        ]
      }
    ];

  }

  addChapterForm(){
    this.isAddChapter = true;
    if(this.selectStoryType === "Novel"){
      this.isAddNovel = !this.isAddNovel;

      if (this.isAddNovel) {
        // Đợi DOM cập nhật trước khi khởi tạo Quill
        setTimeout(() => {
          this.initializeQuill();
        }, 0);
      }
    }

   else {

    this.isAddManga = true;
    this.selectMangaType = this.typeMangaOptions[1].value
    this.isAddMangaPdf
    }
  }

  confirmAddNovel(){
    this.messageService.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Thêm chương mới thành công'
    });
    return;
  }

  closeNovelForm(){
    this.isAddChapter = false;
  }

  resetForm(){
    this.chapterNumber = '';
    this.title = '';
    this.chapterContent = '';
    if (this.editorInstance) {
      this.editorInstance.setText(''); // Xóa nội dung trong Quill Editor
    }
  }

  getCategories() {
    this._categoryService.getCategories().subscribe((res: any) => {
      // console.log(res);
      if (res && res.isSuccess == true) {
        this.categories = res.data;
      }
    });
  }

  onUploadCoverImage(event: any) {
    const fileCoverImg = event.files[0];
    const maxSizeKB = 1000;
    console.log(fileCoverImg.size);
    if (fileCoverImg.size / 1024 > maxSizeKB) { // 1mb
      this.messageService.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Kích thước ảnh không được lớn hơn 1MB'
      });
      return;
    }

    const reader = new FileReader();
    this.coverImage = fileCoverImg;
    reader.onload = (e: any) => {
      this.coverImageDisplay = e.target.result;
    };
    reader.readAsDataURL(fileCoverImg);
  }


  onRemoveChildrenImg(event: any) {

  }

  onUploadChildrenImg(event: any) {

  }

  navigateTostoryManagement() {
    this.router.navigate(['/story-management']);
  }

  showWarning(message: string) {
    this.messageService.add({ severity: 'warn', summary: 'Cảnh báo', detail: message });
  }

  updateStory() {
    if (!this.title || this.title.trim() === "") {
      this.showWarning("Tên truyện không được để trống!");
      return;
    }
    if (!this.author || this.author.trim() === "") {
      this.showWarning("Tên tác giả không được để trống!");
      return;
    }
    if (!this.selectStoryType) {
      this.showWarning("Vui lòng chọn danh mục!");
      return;
    }
    if (!this.coverImage) {
      this.showWarning("Vui lòng chọn ảnh bìa cho truyện!");
      return;
    }

    const formData = new FormData();
    const publishID = JSON.parse(localStorage.getItem('user') || '{}').userId;

    formData.append("Title", this.title);
    formData.append("Author", this.author);
    formData.append("PublisherID", publishID);
    formData.append("Type", this.selectStoryType);
    // formData.append("CategoryIDs", this.categoriesSelect.map((c:any) => c.categoryID));

    this.categoriesSelect.forEach((c: any) => {
      formData.append("CategoryIDs", c.categoryID);
    });

    formData.append("Description", this.description);

    // Gửi ảnh chính (primary image)
    if (this.coverImage) {
      formData.append("CoverImage", this.coverImage);
    }

    //  Gửi request xuống BE
    this._storyService.addStory(formData).subscribe((res: any) => {
      if (res && res.isSuccess == true) {
        this.messageService.add({ severity: "success", summary: "Success", detail: res.data });
      } else {
        this.messageService.add({ severity: "error", summary: "Error", detail: res.data });
      }
    });
  }


}
