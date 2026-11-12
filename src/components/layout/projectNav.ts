import {
  Activity,
  ActivitySquare,
  BarChart,
  Brain,
  ChartCandlestick,
  Images,
  Layers,
  LineChart,
  Link2,
  Pencil,
  Sparkle,
  Tags,
  Upload,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface ProjectNavItem {
  section: 'Data' | 'Insights' | 'Models' | 'Settings';
  label: string;
  path: string;
  icon: LucideIcon;
  /** Show the project's image count next to it. */
  count?: boolean;
  /** Extra search words for the command palette. */
  keywords?: string[];
}

/** The pages of a project, shared by the project sidebar and the command palette. */
export const projectNavItems = (projectId: string): ProjectNavItem[] => [
  { section: 'Data', label: 'Upload Data', path: `/projects/${projectId}/upload`, icon: Upload, keywords: ['import', 'files'] },
  { section: 'Data', label: 'Link Data', path: `/projects/${projectId}/link`, icon: Link2, keywords: ['storage', 'register', 's3', 'bucket'] },
  { section: 'Data', label: 'Dataset', path: `/projects/${projectId}/dataset`, icon: Images, count: true, keywords: ['images', 'browse'] },
  { section: 'Data', label: 'Annotate', path: `/projects/${projectId}/annotate`, icon: Pencil, keywords: ['jobs', 'label'] },
  { section: 'Data', label: 'Auto Annotate', path: `/projects/${projectId}/auto-annotate`, icon: Sparkle, keywords: ['ai', 'model', 'predict'] },
  { section: 'Insights', label: 'Analysis', path: `/projects/${projectId}/analysis`, icon: BarChart },
  { section: 'Insights', label: 'Analytics', path: `/projects/${projectId}/analytics`, icon: LineChart, keywords: ['stats', 'charts'] },
  { section: 'Insights', label: 'Activity', path: `/projects/${projectId}/activity`, icon: Activity, keywords: ['history', 'log'] },
  { section: 'Models', label: 'Versions', path: `/projects/${projectId}/versions`, icon: Layers, keywords: ['dataset versions', 'export', 'download'] },
  { section: 'Models', label: 'Models', path: `/projects/${projectId}/models`, icon: Brain },
  { section: 'Models', label: 'Training', path: `/projects/${projectId}/sessions`, icon: ActivitySquare, keywords: ['sessions', 'train'] },
  { section: 'Models', label: 'Evaluation', path: `/projects/${projectId}/evaluation`, icon: ChartCandlestick, keywords: ['metrics', 'map'] },
  { section: 'Settings', label: 'Classes', path: `/projects/${projectId}/classes`, icon: Tags, keywords: ['labels', 'categories'] },
  { section: 'Settings', label: 'Members', path: `/projects/${projectId}/members`, icon: Users, keywords: ['team', 'roles', 'permissions'] },
];
