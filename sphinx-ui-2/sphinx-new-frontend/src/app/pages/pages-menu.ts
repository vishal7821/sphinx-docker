import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Dashboard',
    icon: 'home-outline',
    link: '/pages/courses',
    home: true,
  },
  // {
  //   title: 'COURSE FEATURES',
  //   group: true,
  // },
  // {
  //   title: 'Course Settings',
  //   icon: 'settings',
  //   children: [
  //     {
  //       title: 'Roles',
  //       link: '/pages/course/roles',
  //       icon: 'funnel',
  //     },
  //     {
  //       title: 'Sections',
  //       link: '/pages/course/sections',
  //       icon: 'folder',
  //     },
  //     {
  //       title: 'Topics',
  //       link: '/pages/course/topics',
  //       icon: 'link',
  //     },
  //     {
  //       title: 'Roaster',
  //       icon: 'people',
  //       link: '/pages/course/roaster',

  //     },
  //   ],
  // },
  // {
  //   title: 'Assignment Manager',
  //   icon: 'clipboard',
  //   link: '/pages/assignment',
  //   home: true,
  // },
  // {
  //   title: 'Event Manager',
  //   icon: 'list',
  //   link: '/pages/events',
  //   home: true,
  // },
  // {
  //   title: 'My Events',
  //   icon: 'list',
  //   link: '/pages/myevents',
  //   home: true,
  // },
  // {
  //   title: 'Auth',
  //   icon: 'lock-outline',
  //   children: [
  //     {
  //       title: 'Login',
  //       link: '/auth/login',
  //     },
  //     {
  //       title: 'Register',
  //       link: '/auth/register',
  //     },
  //     {
  //       title: 'Request Password',
  //       link: '/auth/request-password',
  //     },
  //     {
  //       title: 'Reset Password',
  //       link: '/auth/reset-password',
  //     },
  //   ],
  // },
  {
    title: 'Profile',
    link: '/pages/profile',
    icon: 'person',
  },
  {
    title: 'Logout',
    link: '/auth/logout',
    icon: 'log-out',
  },
];
