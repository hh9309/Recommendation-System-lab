import React from 'react';
import { DatasetPreset } from '../../types/recsys';
import { DATASET_PRESETS } from '../../data/datasets';
import { 
  Briefcase, 
  Film, 
  Music, 
  Newspaper, 
  ShoppingCart, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Database,
  BarChart2
} from 'lucide-react';

interface CasesLibraryModuleProps {
  currentDataset: DatasetPreset;
  onSelectDataset: (presetId: string) => void;
}

export const CasesLibraryModule: React.FC<CasesLibraryModuleProps> = ({
  currentDataset,
  onSelectDataset
}) => {
  const casesList = [
    {
      id: 'netflix',
      title: 'Netflix 影视流媒体个性化推荐',
      domain: '长视频流媒体 (Video Streaming)',
      icon: Film,
      themeColor: 'from-blue-600 to-indigo-700',
      badge: '经典 Netflix Prize 范式',
      scenarioSummary: '基于用户对电影与剧集的显式 1~5 星打分，通过低秩隐因子挖掘电影的隐性题材特征与用户的审美取向。',
      coreChallenge: '评分矩阵稀疏度极高（>80%），冷启动用户缺乏行为记录，长尾经典电影难以被发掘。',
      recommendedTech: 'FunkSVD / BiasedMF 隐语义模型 + Item-CF 协同召回 + 深度重排'
    },
    {
      id: 'spotify',
      title: 'Spotify 音乐歌单日推生成',
      domain: '音频与播客流媒体 (Audio Streaming)',
      icon: Music,
      themeColor: 'from-emerald-600 to-teal-700',
      badge: '音频特征与行为混合',
      scenarioSummary: '结合单曲收听完成率、收藏/跳过隐式反馈，以及音频声学特征（BPM、能量感、原声度）预测用户即时心流。',
      coreChallenge: '单曲消费频次高但生命周期各异，通勤/学习等实时场景上下文（Context）对推荐影响极大。',
      recommendedTech: 'Item2Vec 歌曲向量检索 + 序列推荐 (SASRec) + 探索与利用 (Bandit)'
    },
    {
      id: 'news',
      title: '新闻资讯流毫秒级实时推送',
      domain: '信息流与图文资讯 (News & Feed)',
      icon: Newspaper,
      themeColor: 'from-amber-600 to-orange-700',
      badge: '高时效性与长尾平衡',
      scenarioSummary: '模拟今日头条、知乎高频动态信息流。新闻具备极强的时效半衰期，系统须在热点追踪与防信息茧房之间寻求平衡。',
      coreChallenge: '新文章海量产生（极度冷启动），热门大事件容易造成推荐同质化，回音室效应（Echo Chamber）明显。',
      recommendedTech: 'LinUCB 强化学习冷启动 + 多目标深度排序 (MMoE) + DPP 多样性打散'
    },
    {
      id: 'ecommerce',
      title: '电商零售商品交叉组合加购',
      domain: '电商零售与外设配件 (E-Commerce)',
      icon: ShoppingCart,
      themeColor: 'from-rose-600 to-pink-700',
      badge: '购物篮共现与互补品',
      scenarioSummary: '模拟“买了此商品的人还买了...”(Frequently Bought Together)。挖掘键盘、显示器、人体工学椅之间的生态互补。',
      coreChallenge: '需严格区分“替代品”（买了机械键盘无需推荐同款键盘）与“互补品”（买了键盘推荐手托和显示器）。',
      recommendedTech: 'Item-CF 共现切片分析 + 图神经网络 (LightGCN / PinSage) + 实时购物车重排'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              模块 5
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              四大经典应用案例库 (Real-World Benchmark Library)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            支持一键全局载入不同业务场景。每个案例封装了特定领域的物品元数据、用户行为模式与稀疏分布，在其他模块可实时观测不同业务对算法性能的影响。
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">当前激活案例:</span>
          <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
            {currentDataset.name}
          </span>
        </div>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {casesList.map(c => {
          const Icon = c.icon;
          const isActive = currentDataset.id === c.id;
          const presetData = DATASET_PRESETS[c.id];

          return (
            <div
              key={c.id}
              className={`rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                isActive
                  ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div>
                {/* Header Tag & Action */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.themeColor} flex items-center justify-center text-white shadow-xs`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">{c.domain}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    isActive ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {c.badge}
                  </span>
                </div>

                {/* Scenario Summary */}
                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {c.scenarioSummary}
                </p>

                {/* Stats Pill */}
                <div className="mt-3 flex items-center gap-3 py-2 px-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Database className="h-3.5 w-3.5 text-slate-400" />
                    <span>用户数: <strong className="text-slate-800 font-mono">{presetData.users.length}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <BarChart2 className="h-3.5 w-3.5 text-slate-400" />
                    <span>物品库: <strong className="text-slate-800 font-mono">{presetData.items.length}</strong></span>
                  </div>
                </div>

                {/* Items Preview Chips */}
                <div className="mt-3">
                  <span className="text-[11px] text-slate-400 font-medium">典型推荐样本:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {presetData.items.slice(0, 4).map(it => (
                      <span
                        key={it.id}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium truncate max-w-[140px]"
                        title={it.title}
                      >
                        {it.title.split(' ')[0]}
                      </span>
                    ))}
                    <span className="text-[10px] text-slate-400 self-center">+{presetData.items.length - 4} 更多</span>
                  </div>
                </div>

                {/* Challenge & Tech Stack */}
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-[11px]">
                  <div>
                    <span className="text-amber-800 font-medium">业务难点: </span>
                    <span className="text-slate-600">{c.coreChallenge}</span>
                  </div>
                  <div>
                    <span className="text-indigo-700 font-medium">推荐架构方案: </span>
                    <span className="text-slate-600 font-mono">{c.recommendedTech}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onSelectDataset(c.id)}
                  disabled={isActive}
                  className={`w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-100 text-indigo-700 font-semibold cursor-default'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                  }`}
                >
                  {isActive ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                      <span>当前正在演播该案例</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>一键切换并载入实验室</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
