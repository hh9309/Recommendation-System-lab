import React from 'react';
import { DatasetPreset } from '../types/recsys';
import { DATASET_PRESETS } from '../data/datasets';
import { 
  Sparkles, 
  Database, 
  Layers, 
  Activity, 
  Film, 
  Music, 
  Newspaper, 
  ShoppingCart, 
  Bot,
  HelpCircle,
  TrendingDown
} from 'lucide-react';

interface HeaderProps {
  currentDataset: DatasetPreset;
  onSelectDataset: (presetId: string) => void;
  sparsityPercent: number;
  activeUsersCount: number;
  activeItemsCount: number;
  onOpenAIDiagnosis: () => void;
  onOpenKnowledge: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDataset,
  onSelectDataset,
  sparsityPercent,
  activeUsersCount,
  activeItemsCount,
  onOpenAIDiagnosis,
  onOpenKnowledge,
}) => {
  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-800 flex items-center justify-center text-white shadow-xs">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  内容个性化协同过滤推荐实验室
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  RecSys Lab v2.5
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                从稀疏矩阵、3D空间演播、SVD隐空间到 Recharts 动态收敛拟合与多维切片推演
              </p>
            </div>
          </div>

          {/* Controls: Preset Switcher + Status + AI Button */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Dataset Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-lg border border-slate-200/80 text-xs">
              <span className="text-slate-500 pl-1.5 font-medium flex items-center gap-1">
                <Database className="h-3.5 w-3.5" />
                案例库:
              </span>
              {(['netflix', 'spotify', 'news', 'ecommerce'] as const).map(key => {
                const preset = DATASET_PRESETS[key];
                const active = currentDataset.id === key;
                return (
                  <button
                    key={key}
                    onClick={() => onSelectDataset(key)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                      active
                        ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                    title={preset.description}
                  >
                    {key === 'netflix' && <Film className="h-3 w-3" />}
                    {key === 'spotify' && <Music className="h-3 w-3" />}
                    {key === 'news' && <Newspaper className="h-3 w-3" />}
                    {key === 'ecommerce' && <ShoppingCart className="h-3 w-3" />}
                    {preset.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>

            {/* Sparsity Indicator Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50/80 border border-amber-200/80 text-xs text-amber-800 font-medium" title="稀疏度 = 1 - 观测评分数 / (用户数 × 物品数)">
              <Activity className="h-3.5 w-3.5 text-amber-600" />
              <span>稀疏度:</span>
              <span className="font-semibold font-mono text-amber-900">{sparsityPercent}%</span>
            </div>

            {/* AI Diagnosis Button */}
            <button
              onClick={onOpenAIDiagnosis}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-medium shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Bot className="h-3.5 w-3.5" />
              <span>AI 随诊与答疑</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
            </button>

            {/* Knowledge Quick Link */}
            <button
              onClick={onOpenKnowledge}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="查看推荐系统核心机理与四大避坑导引"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
