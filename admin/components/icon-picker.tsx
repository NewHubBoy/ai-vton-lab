'use client';

import { useState, useMemo } from 'react';
import {
  LayoutDashboard, Users, UserCog, Menu, Building2, Shield, FileText,
  Settings, Settings2, Home, BookOpen, Album, Siren, TableOfContents,
  CircleDollarSign, Shirt, ShoppingCart, Package, Box, Inbox,
  Mail, Bell, Calendar, Clock, Search, Filter, List, Grid3X3,
  Image, Camera, Video, Music, Headphones, Mic, Phone,
  MessageSquare, MessageCircle, Send, Share2, Link, ExternalLink,
  Download, Upload, Cloud, Database, Server, Cpu, HardDrive,
  Folder, FolderOpen, File, FileCode, FilePlus, FileEdit,
  Edit, Pencil, Trash, Trash2, Plus, Minus, X, Check,
  ChevronRight, ChevronLeft, ChevronUp, ChevronDown, ArrowRight,
  Eye, EyeOff, Lock, Unlock, Key, KeyRound, LogIn, LogOut,
  User, UserPlus, UserMinus, UserCheck, UserX, Users2,
  Heart, Star, Bookmark, Flag, Tag, Tags, Hash,
  Zap, Activity, TrendingUp, TrendingDown, BarChart, PieChart,
  Globe, Map, MapPin, Navigation, Compass,
  CreditCard, Wallet, DollarSign, Coins, Receipt, ShoppingBag,
  Truck, Car, Plane, Train, Bus, Bike,
  Sun, Moon, CloudRain, Snowflake, Wind,
  Wifi, WifiOff, Bluetooth, Battery, Power, Plug,
  Monitor, Laptop, Tablet, Smartphone, Watch, Tv,
  Printer, Keyboard, Mouse, Gamepad2,
  Code, Terminal, Bug, Wrench, Hammer, Cog,
  Layers, Layout, Columns3, Rows3, Table, Kanban,
  AlertCircle, AlertTriangle, Info, HelpCircle, CircleHelp,
  CheckCircle, XCircle, PlusCircle, MinusCircle,
  Play, Pause, Square, SkipBack, SkipForward, Repeat, Shuffle,
  Volume, Volume1, Volume2, VolumeX,
  Maximize, Minimize, Move, GripVertical,
  Copy, Clipboard, ClipboardList, ClipboardCheck,
  Save, FolderInput, FolderOutput, Archive, ArchiveRestore,
  RefreshCw, RotateCw, RotateCcw, Loader,
  MoreHorizontal, MoreVertical, Grip,
  Briefcase, Building, Store, Factory, Landmark,
  GraduationCap, Library, Newspaper, Rss, Radio,
  Gift, Award, Trophy, Medal, Crown,
  Smile, Frown, Meh, ThumbsUp, ThumbsDown,
  MessageSquarePlus, MessagesSquare, AtSign, Contact,
  FolderClosed, FolderMinus, FolderPlus, Files,
  FileQuestion, FileWarning, FileX, FileCheck,
  UserCircle, UserSquare, Contact2, BadgeCheck,
  ShieldCheck, ShieldAlert, ShieldX, ShieldQuestion,
  LockKeyhole, KeySquare, Fingerprint, ScanFace,
  Gauge, LineChart, BarChart3, AreaChart,
  Calculator, Binary, Braces, Brackets,
  Blocks, Component, Puzzle, Boxes,
  Palette, Paintbrush, PenTool, Highlighter,
  Type, Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  ListOrdered, ListChecks, ListTodo, ListTree,
  Network, GitBranch, GitCommit, GitMerge, GitPullRequest,
  Workflow, Share, Forward, Reply, ReplyAll,
  ScanLine, QrCode, Barcode,
  Sparkles, Wand2, Bot, Brain, Lightbulb,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// 显式的图标映射表
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard, Users, UserCog, Menu, Building2, Shield, FileText,
  Settings, Settings2, Home, BookOpen, Album, Siren, TableOfContents,
  CircleDollarSign, Shirt, ShoppingCart, Package, Box, Inbox,
  Mail, Bell, Calendar, Clock, Search, Filter, List, Grid3X3,
  Image, Camera, Video, Music, Headphones, Mic, Phone,
  MessageSquare, MessageCircle, Send, Share2, Link, ExternalLink,
  Download, Upload, Cloud, Database, Server, Cpu, HardDrive,
  Folder, FolderOpen, File, FileCode, FilePlus, FileEdit,
  Edit, Pencil, Trash, Trash2, Plus, Minus, X, Check,
  ChevronRight, ChevronLeft, ChevronUp, ChevronDown, ArrowRight,
  Eye, EyeOff, Lock, Unlock, Key, KeyRound, LogIn, LogOut,
  User, UserPlus, UserMinus, UserCheck, UserX, Users2,
  Heart, Star, Bookmark, Flag, Tag, Tags, Hash,
  Zap, Activity, TrendingUp, TrendingDown, BarChart, PieChart,
  Globe, Map, MapPin, Navigation, Compass,
  CreditCard, Wallet, DollarSign, Coins, Receipt, ShoppingBag,
  Truck, Car, Plane, Train, Bus, Bike,
  Sun, Moon, CloudRain, Snowflake, Wind,
  Wifi, WifiOff, Bluetooth, Battery, Power, Plug,
  Monitor, Laptop, Tablet, Smartphone, Watch, Tv,
  Printer, Keyboard, Mouse, Gamepad2,
  Code, Terminal, Bug, Wrench, Hammer, Cog,
  Layers, Layout, Columns3, Rows3, Table, Kanban,
  AlertCircle, AlertTriangle, Info, HelpCircle, CircleHelp,
  CheckCircle, XCircle, PlusCircle, MinusCircle,
  Play, Pause, Square, SkipBack, SkipForward, Repeat, Shuffle,
  Volume, Volume1, Volume2, VolumeX,
  Maximize, Minimize, Move, GripVertical,
  Copy, Clipboard, ClipboardList, ClipboardCheck,
  Save, FolderInput, FolderOutput, Archive, ArchiveRestore,
  RefreshCw, RotateCw, RotateCcw, Loader,
  MoreHorizontal, MoreVertical, Grip,
  Briefcase, Building, Store, Factory, Landmark,
  GraduationCap, Library, Newspaper, Rss, Radio,
  Gift, Award, Trophy, Medal, Crown,
  Smile, Frown, Meh, ThumbsUp, ThumbsDown,
  MessageSquarePlus, MessagesSquare, AtSign, Contact,
  FolderClosed, FolderMinus, FolderPlus, Files,
  FileQuestion, FileWarning, FileX, FileCheck,
  UserCircle, UserSquare, Contact2, BadgeCheck,
  ShieldCheck, ShieldAlert, ShieldX, ShieldQuestion,
  LockKeyhole, KeySquare, Fingerprint, ScanFace,
  Gauge, LineChart, BarChart3, AreaChart,
  Calculator, Binary, Braces, Brackets,
  Blocks, Component, Puzzle, Boxes,
  Palette, Paintbrush, PenTool, Highlighter,
  Type, Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  ListOrdered, ListChecks, ListTodo, ListTree,
  Network, GitBranch, GitCommit, GitMerge, GitPullRequest,
  Workflow, Share, Forward, Reply, ReplyAll,
  ScanLine, QrCode, Barcode,
  Sparkles, Wand2, Bot, Brain, Lightbulb,
};

// 获取所有可用的图标名称
const availableIconNames = Object.keys(iconMap);

// 动态获取图标组件
export const getIconComponent = (iconName: string): LucideIcon | null => {
  if (!iconName) return null;
  return iconMap[iconName] || null;
};

interface IconPickerProps {
  value?: string;
  onChange?: (iconName: string) => void;
  placeholder?: string;
  className?: string;
}

export function IconPicker({ value, onChange, placeholder = '选择图标', className }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // 过滤图标
  const filteredIcons = useMemo(() => {
    if (!search) return availableIconNames;
    const searchLower = search.toLowerCase();
    return availableIconNames.filter((name) => name.toLowerCase().includes(searchLower));
  }, [search]);

  // 渲染选中的图标
  const renderSelectedIcon = () => {
    if (!value) return null;
    const Icon = iconMap[value];
    if (!Icon) return null;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className={cn('w-full justify-start', className)}>
          {value && renderSelectedIcon() ? (
            <div className="flex items-center gap-2">
              {renderSelectedIcon()}
              <span>{value}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start" onWheel={(e) => e.stopPropagation()}>
        <div className="p-2 border-b">
          <Input placeholder="搜索图标..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-8" />
        </div>
        <ScrollArea className="h-75">
          <div className="grid grid-cols-6 gap-1 p-2">
            {filteredIcons.map((iconName) => {
              const Icon = iconMap[iconName];
              if (!Icon) return null;

              return (
                <Button
                  key={iconName}
                  variant={value === iconName ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-10 w-10"
                  title={iconName}
                  onClick={() => {
                    onChange?.(iconName);
                    setOpen(false);
                    setSearch('');
                  }}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              );
            })}
          </div>
          {filteredIcons.length === 0 && <div className="p-4 text-center text-sm text-muted-foreground">未找到匹配的图标</div>}
        </ScrollArea>
        {value && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => {
                onChange?.('');
                setOpen(false);
              }}
            >
              清除选择
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// 用于在列表中显示图标的简单组件
interface IconDisplayProps {
  iconName?: string;
  className?: string;
  fallback?: React.ReactNode;
}

export function IconDisplay({ iconName, className, fallback }: IconDisplayProps) {
  if (!iconName) {
    return fallback ? <>{fallback}</> : <span className="text-muted-foreground">-</span>;
  }

  const Icon = iconMap[iconName];
  if (!Icon) {
    return fallback ? <>{fallback}</> : <span className="text-muted-foreground">-</span>;
  }

  return <Icon className={cn('h-4 w-4', className)} />;
}
