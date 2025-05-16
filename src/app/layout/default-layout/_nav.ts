import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
    // badge: {
    //   color: 'info',
    //   text: 'NEW'
    // }
  },
  {
    title: true,
    name: 'Quản trị'
  },
  {
    name: 'Quản lý truyện',
    url: '/story-management',
    iconComponent: { name: 'cil-inbox' }
  },
  {
    name: 'Quản lý thành viên',
    url: '/member-management',
    iconComponent: { name: 'cil-user' }
  },
  {
    name: 'Quản lý chuyên mục',
    url: '/category-management',
    iconComponent: { name: 'cil-bookmark' }
  },
  {
    name: 'Quản lý báo cáo',
    url: '/report-management',
    iconComponent: { name: 'cil-report-slash' }
  },
  {
    name: 'Báo cáo thống kê',
    url: '/statistical-report-management',
    iconComponent: { name: 'cil-chart-pie' }
  },
  {
    name: 'Hệ thống',
    title: true
  },
  {
    name: 'Quản lý hệ thống',
    url: '/system-management',
    iconComponent: { name: 'cil-puzzle' },
    children: [
      {
        name: 'Hướng dẫn sử dụng',
        url: '/system-management/tutorial',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Quản lý chân trang',
        url: '/system-management/footer',
        icon: 'nav-icon-bullet'
      },
      // {
      //   name: 'Banner',
      //   url: '/system-management/banner',
      //   icon: 'nav-icon-bullet'
      // },
    ]
  },

  // {
  //   title: true,
  //   name: 'Tài liệu',
  //   class: 'mt-auto'
  // },
  // {
  //   name: 'Docs',
  //   url: 'https://coreui.io/angular/docs/',
  //   iconComponent: { name: 'cil-description' },
  //   attributes: { target: '_blank' }
  // }
];
