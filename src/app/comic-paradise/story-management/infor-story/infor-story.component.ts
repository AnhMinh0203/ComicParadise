import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { OverlayBadgeModule } from 'primeng/overlaybadge';

interface CommentNode {
  key: string;
  label: string; // Tên người dùng (ví dụ: "Abc")
  avatar: string; // Chuỗi cho avatar (ví dụ: "U")
  content: string; // Nội dung bình luận (ví dụ: "Truyện hay nha :>")
  time: string; // Thời gian (ví dụ: "3 giờ trước")
  children?: CommentNode[]; // Chỉ chứa các reply trực tiếp (không lồng sâu hơn)
}
@Component({
  selector: 'app-infor-story',
  imports: [
    ButtonModule,
    TagModule,
    CardModule,
    PanelModule,
    TreeModule,
    AvatarModule,
    OverlayBadgeModule,
    CommonModule
  ],
  templateUrl: './infor-story.component.html',
  styleUrl: './infor-story.component.scss'
})
export class InforStoryComponent {
  childComments!: CommentNode[];

  ngOnInit() {
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
}
