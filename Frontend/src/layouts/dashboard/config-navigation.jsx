import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const navConfig = [
  {
    title: 'dashboard',
    path: '/admin',
    icon: icon('ic_analytics'),
  },
  {
    title: 'user',
    path: '/admin/user',
    icon: icon('ic_user'),
  },
  {
    title: 'Plan',
    path: '/admin/plan',
    icon: icon('ic_plan'),
  },
  {
    title: 'Email',
    path: '/admin/email',
    icon: icon('ic_email'),
  },
  {
    title: 'Account',
    path: '/admin/myAccount',
    icon: icon('ic_userz'),
  },

  // {
  //   title: 'Not found',
  //   path: '/404',
  //   icon: icon('ic_disabled'),
  // },
];

export default navConfig;
