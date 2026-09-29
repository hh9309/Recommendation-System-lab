import React from 'react';
import { 
  Grid3X3, 
  Users, 
  Box, 
  Activity, 
  Briefcase, 
  Code2, 
  Bot, 
  GitFork, 
  FileDown, 
  GraduationCap 
} from 'lucide-react';

export type TabId = 
  | 'algebra' 
  | 'user_cf' 
  | 'item_cf' 
  | 'svd' 
  | 'cases' 
  | 'code' 
  | 'ai_chat' 
  | 'pipeline' 
  | 'reports' 
  | 'knowledge';

interface NavigationTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export const TABS_CONFIG = [
  { id: 'algebra', title: '代数与矩阵', icon: Grid3X3, desc: '评分矩阵与余弦/皮尔逊' },
  { id: 'user_cf', title: '基于用户', icon: Users, desc: '3D用户空间与K-NN演播' },
  { id: 'item_cf', title: '基于物品', icon: Box, desc: '共现矩阵与相关性切片' },
  { id: 'svd', title: '矩阵分解 SVD', icon: Activity, desc: '隐因子与几何收敛' },
  { id: 'cases', title: '四大案例', icon: Briefcase, desc: '影视/音乐/新闻/电商' },
  { id: 'code', title: '代码引擎', icon: Code2, desc: 'Python / Surprise / NumPy' },
  { id: 'ai_chat', title: 'AI 对话窗口', icon: Bot, desc: '稀疏度/冷启动智能随诊' },
  { id: 'pipeline', title: '全流程导引', icon: GitFork, desc: '数据→建模→Recharts评估' },
  { id: 'reports', title: '数据报告', icon: FileDown, desc: '矩阵与报告导出/上传' },
  { id: 'knowledge', title: '知识导引', icon: GraduationCap, desc: '推荐机理与避坑指南' },
] as const;

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="bg-slate-100/70 border-b border-slate-200/80 sticky top-[61px] z-20 backdrop-blur-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1.5 overflow-x-auto py-2.5 scrollbar-thin no-scrollbar">
          {TABS_CONFIG.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as TabId)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
