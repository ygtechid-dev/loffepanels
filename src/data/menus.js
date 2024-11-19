import { faPage4, faWhatsapp, faWindows } from "@fortawesome/free-brands-svg-icons";
import {
  faTachometer,
  faTable,
  faLock,
  faNoteSticky,
  faNotdef,
  faDatabase,
  faShare,
  faMobile,
  faShop,
  faIdCard,
  faMoneyCheck,
  faList,
  faSquare
} from "@fortawesome/free-solid-svg-icons";

const initMenu = [
  {
    label: "Dashboard",
    path: "/",
    icon: faTachometer,
  },
  {
    label: 'Master Data'
  },
  {
    label: "Data User Mobile",
    path: "/data-user",
    icon: faMobile,
  },
  {
    label: "Setting Data Outlet",
    path: "/data-outlet",
    icon: faShop,
  },
  {
    label: "Setting Data Membership",
    path: "/data-membership",
    icon: faIdCard,
  },
  {
    label: "Setting Data Table Reservasi",
    path: "/floor-management",
    icon: faTable,
  },
  {
    label: 'Transaksi'
  },
  {
    label: "Transaksi App",
    path: "/data-transaksi",
    icon: faMoneyCheck,
  },
  {
    label: "Daftar Waiting List",
    path: "/data-waitinglist",
    icon: faList,
  },
  {
    label: 'Setting'
  },
  {
    label: "Banner Management",
    path: "/banner-management",
    icon: faSquare,
  },
  {
    label: "WhatsApp Setting",
    path: "/kirim",
    icon: faWhatsapp,
  },
  // {
  //   label: "Master Perlengkapan",
  //   path: "/table",
  //   icon: faTable,
  // },

  // {
  //   label: 'Otentikasi'
  // },
  // {
  //   label: "Login",
  //   path: "/auth/login",
  //   icon: faLock,
  // },
  // {
  //   label: "Register",
  //   path: "/auth/register",
  //   icon: faNoteSticky,
  // },
];

export default initMenu