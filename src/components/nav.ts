import {
  BookOpen,
  CalendarDays,
  CircleCheck,
  CircleDot,
  Clock,
  Compass,
  GraduationCap,
  HandHeart,
  House,
  Info,
  LayoutGrid,
  Milestone,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  short?: string;
  icon: LucideIcon;
  description?: string;
}

export const NAV_TOOLS: NavItem[] = [
  { to: '/', label: 'Today', icon: House },
  { to: '/prayer', label: 'Prayer times', short: 'Prayer', icon: Clock, description: 'Today’s times and the next prayer' },
  { to: '/tracker', label: 'Prayer tracker', short: 'Tracker', icon: CircleCheck, description: 'Mark your five daily prayers' },
  { to: '/quran', label: 'Quran', icon: BookOpen, description: 'Read with translation and bookmarks' },
  { to: '/qibla', label: 'Qibla', icon: Compass, description: 'Direction of the Kaʿbah' },
  { to: '/duas', label: 'Duas & Adhkar', short: 'Duas', icon: HandHeart, description: 'Morning, evening and daily duas' },
  { to: '/tasbih', label: 'Tasbih', icon: CircleDot, description: 'A simple dhikr counter' },
  { to: '/calendar', label: 'Hijri calendar', short: 'Calendar', icon: CalendarDays, description: 'Islamic months and important dates' },
  { to: '/learn', label: 'Learn', icon: GraduationCap, description: 'Wudu, salah and the basics' },
];

export const NAV_META: NavItem[] = [
  { to: '/settings', label: 'Settings', icon: Settings, description: 'Location, calculation, reading and theme' },
  { to: '/roadmap', label: 'What’s coming', short: 'Roadmap', icon: Milestone, description: 'The SalaamStreet roadmap' },
  { to: '/about', label: 'About & privacy', short: 'About', icon: Info, description: 'Sources, privacy and credits' },
];

export const NAV_BOTTOM: NavItem[] = [
  NAV_TOOLS[0],
  NAV_TOOLS[1],
  NAV_TOOLS[3],
  NAV_TOOLS[4],
  { to: '/more', label: 'More', icon: LayoutGrid },
];
