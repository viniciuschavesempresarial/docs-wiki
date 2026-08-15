declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  export interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    strokeWidth?: number | string;
    absoluteStrokeWidth?: boolean;
    className?: string;
  }
  export type LucideIcon = FC<LucideProps>;

  export const BookOpen: LucideIcon;
  export const Edit3: LucideIcon;
  export const Edit: LucideIcon;
  export const Bot: LucideIcon;
  export const LogOut: LucideIcon;
  export const LogIn: LucideIcon;
  export const UserPlus: LucideIcon;
  export const KeyRound: LucideIcon;
  export const Mail: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const Search: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Filter: LucideIcon;
  export const RotateCcw: LucideIcon;
  export const Folder: LucideIcon;
  export const FileText: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const Calendar: LucideIcon;
  export const HardDrive: LucideIcon;
  export const Hash: LucideIcon;
  export const GitCompare: LucideIcon;
  export const GitCommit: LucideIcon;
  export const Library: LucideIcon;
  export const FileSearch: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const Eye: LucideIcon;
  export const Columns: LucideIcon;
  export const Plus: LucideIcon;
  export const Minus: LucideIcon;
  export const Layers: LucideIcon;
  export const CheckSquare: LucideIcon;
  export const Square: LucideIcon;
  export const User: LucideIcon;
  export const Send: LucideIcon;
  export const Trash2: LucideIcon;
  export const Upload: LucideIcon;
  export const X: LucideIcon;
}
