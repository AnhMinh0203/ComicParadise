// ./_nav.ts
import { INavData } from '@coreui/angular';
import { jwtDecode } from 'jwt-decode';
import { getRoleFromToken } from '../../core/helpers/token-helper';



export function getNavItems(): INavData[] {
  const role = getRoleFromToken();

  const fullNavItems: INavData[] = [
    {
      name: 'Dashboard',
      url: '/dashboard',
      iconComponent: { name: 'cil-speedometer' }
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
      ]
    },
    {
      name: 'Đăng xuất',
      url: '/logout',
      iconComponent: { name: 'cil-account-logout' }
    }
  ];

  if (role === 'Admin') return fullNavItems;
  if (role === 'Publisher') {
    return fullNavItems.filter(item =>
      ![
        'Hệ thống',
        'Quản lý hệ thống',
        'Báo cáo thống kê',
        'Quản lý báo cáo',
        'Quản lý thành viên',
        'Quản lý chuyên mục',
      ].includes(item.name || '')
    );
  }

  // Role khác thì trả về menu rỗng
  return [];
}
