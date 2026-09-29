import React, { useState } from 'react';
import { User, Item } from '../../types/recsys';
import { computeItemItemSimilarityMatrix } from '../../utils/mathRecsys';
import { 
  Box, 
  Layers, 
  Scissors, 
  Filter, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Check, 
  RotateCcw,
  Play,
  Pause
} from 'lucide-react';

interface ItemCFSliceModuleProps {
  users: User[];
  items: Item[];
}

export const ItemCFSliceModule: React.FC<ItemCFSliceModuleProps> = ({ users, items }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || 'u1');
  const [simThreshold, setSimThreshold] = useState<number>(0.35);
  const [activeTab, setActiveTab] = useState<'co_occur' | 'sim_matrix' | 'pipeline_slice'>('pipeline_slice');
  const [pipelineStep, setPipelineStep] = useState<number>(2); // 0: User History, 1: Co-occur scan, 2: Pruning, 3: Candidates
  const [hoveredPair, setHoveredPair] = useState<{ i1: string; i2: string } | null>(null);

  const { similarityMatrix, coOccurrenceMatrix } = computeItemItemSimilarityMatrix(users, items);

  const targetUser = users.find(u => u.id === selectedUserId) || users[0];

  // User's liked items (rated >= 3.5)
  const userLikedItems = items.filter(it => {
    const s = targetUser.ratings[it.id];
    return s !== null && s !== undefined && s >= 3.0;
  });

  // Items unrated by user
  const unratedItems = items.filter(it => targetUser.ratings[it.id] === null || targetUser.ratings[it.id] === undefined);

  // Compute Item-CF scores for unrated items
  const candidatesWithScore = unratedItems.map(candidate => {
    let num = 0;
    let den = 0;
    const contributingSeeds: { item: Item; sim: number; rating: number }[] = [];

    userLikedItems.forEach(seed => {
      const sim = similarityMatrix[seed.id]?.[candidate.id] || 0;
      const rating = targetUser.ratings[seed.id] || 0;

      if (sim >= simThreshold) {
        num += sim * rating;
        den += sim;
        contributingSeeds.push({ item: seed, sim, rating });
      }
    });

    const score = den > 0 ? num / den : 0;
    const isPruned = den === 0;

    return {
      item: candidate,
      score,
      contributingSeeds,
      isPruned
    };
  }).sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              模块 3
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              基于物品的协同过滤 (Item-CF) 共现切片
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            同屏渲染物品共现矩阵与打分相关性分布；动态演播基于目标用户的历史偏好种子，求解全网物品关联度，切片裁切不相关长尾噪点，推演出高保真推荐候选集。
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('pipeline_slice')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'pipeline_slice' ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            兴趣裁切与候选推演
          </button>
          <button
            onClick={() => setActiveTab('co_occur')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'co_occur' ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            物品共现切片矩阵 C
          </button>
          <button
            onClick={() => setActiveTab('sim_matrix')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'sim_matrix' ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            物品余弦相似度矩阵 S
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'pipeline_slice' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: User History Seeds & Controls */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  用户历史兴趣种子切片
                </h4>
                <select
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 font-semibold text-slate-800"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <p className="text-xs text-slate-500">
                Item-CF 将用户曾高分评价的物品作为“偏好种子”，去全网物品相似度矩阵中检索关联物品：
              </p>

              <div className="space-y-2">
                {userLikedItems.length > 0 ? (
                  userLikedItems.map(item => {
                    const score = targetUser.ratings[item.id]!;
                    return (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/70 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-800">{item.title}</div>
                          <div className="text-[10px] text-emerald-700 font-medium">{item.category}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-sm font-bold text-emerald-800">
                            ★ {score.toFixed(1)}
                          </span>
                          <div className="text-[9px] text-slate-400">历史喜爱项</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-200">
                    该用户暂无高分历史评分（可能为冷启动用户），Item-CF 无法找到偏好种子。
                  </div>
                )}
              </div>
            </div>

            {/* Threshold Filter Slice */}
            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Scissors className="h-3.5 w-3.5 text-rose-500" />
                  相似度裁切截断阈值 τ
                </span>
                <span className="font-mono font-bold text-xs px-2 py-0.5 bg-rose-50 text-rose-700 rounded border border-rose-200">
                  sim ≥ {simThreshold.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={simThreshold}
                onChange={e => setSimThreshold(parseFloat(e.target.value))}
                className="w-full accent-rose-500"
              />
              <p className="text-[11px] text-slate-500">
                裁切掉相关度低于 τ 的长尾物品，能大幅抑制假相关（如热门物品因高点击率造成的虚假共现）。
              </p>
            </div>
          </div>

          {/* Right 2 Columns: Dynamic Slicing & Candidate Generation */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Filter className="h-4 w-4 text-emerald-600" />
                    候选集裁切推演矩阵 (Pruning & Candidate Derivation)
                  </h3>
                  <p className="text-xs text-slate-500">
                    对用户未评分物品计算基于种子的加权预估打分，并实时切除不相关物品。
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">共 {unratedItems.length} 个未评分候选</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded font-semibold border border-emerald-200">
                    有效推荐: {candidatesWithScore.filter(c => !c.isPruned).length} 项
                  </span>
                </div>
              </div>

              {/* Candidate Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {candidatesWithScore.map(c => {
                  return (
                    <div
                      key={c.item.id}
                      className={`p-4 rounded-xl border transition-all ${
                        c.isPruned
                          ? 'bg-slate-50/70 border-slate-200/60 opacity-60'
                          : 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-800">{c.item.title}</div>
                          <span className="text-[10px] text-emerald-600 font-medium">{c.item.category}</span>
                        </div>
                        {c.isPruned ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            已裁切 (低于阈值)
                          </span>
                        ) : (
                          <div className="text-right">
                            <span className="font-mono text-base font-bold text-emerald-700">
                              {c.score.toFixed(2)} 分
                            </span>
                            <div className="text-[9px] text-slate-400">预测得分</div>
                          </div>
                        )}
                      </div>

                      {/* Contributing Seeds Slice */}
                      <div className="mt-3 pt-2 border-t border-slate-100 text-[11px]">
                        <span className="text-slate-400 font-medium">推荐因果链 (种子相似度贡献):</span>
                        {c.contributingSeeds.length > 0 ? (
                          <div className="mt-1 space-y-1">
                            {c.contributingSeeds.map(cs => (
                              <div key={cs.item.id} className="flex items-center justify-between text-[10px]">
                                <span className="text-slate-600 truncate max-w-[130px]">
                                  因喜欢《{cs.item.title.split(' ')[0]}》
                                </span>
                                <span className="font-mono text-emerald-800 font-semibold">
                                  sim={cs.sim.toFixed(2)} × {cs.rating}分
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[10px] text-rose-600 mt-1">
                            与当前用户的任何喜爱项相似度均小于 {simThreshold.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Math Logic Footnote */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 font-mono">
                推导公式: r̂_(u,i) = (∑_(j∈I_u) sim(i,j) · r_uj) / (∑_(j∈I_u) sim(i,j))
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Co-Occurrence Matrix Table */}
      {activeTab === 'co_occur' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Box className="h-4 w-4 text-emerald-600" />
                物品两两共现矩阵 C ∈ ℕ^({items.length}×{items.length})
              </h3>
              <p className="text-xs text-slate-500">
                矩阵元素 C[i, j] 表示全网同时评分/购买物品 i 与物品 j 的用户人数。
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                <tr>
                  <th className="p-2.5 font-semibold sticky left-0 bg-slate-50 border-r border-slate-200">
                    物品
                  </th>
                  {items.map(it => (
                    <th key={it.id} className="p-2 text-center truncate max-w-[100px]" title={it.title}>
                      {it.title.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(i1 => (
                  <tr key={i1.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-2.5 font-semibold sticky left-0 bg-white border-r border-slate-200 truncate max-w-[120px]">
                      {i1.title.split(' ')[0]}
                    </td>
                    {items.map(i2 => {
                      const count = coOccurrenceMatrix[i1.id]?.[i2.id] || 0;
                      const isDiag = i1.id === i2.id;
                      return (
                        <td
                          key={i2.id}
                          className={`p-2 text-center font-mono font-bold ${
                            isDiag
                              ? 'bg-slate-100 text-slate-500'
                              : count > 3
                              ? 'bg-emerald-100 text-emerald-900'
                              : count > 1
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'text-slate-300'
                          }`}
                        >
                          {count}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 3: Cosine Similarity Matrix Table */}
      {activeTab === 'sim_matrix' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              物品余弦相似度矩阵 S ∈ [0, 1]^({items.length}×{items.length})
            </h3>
            <p className="text-xs text-slate-500">
              sim(i, j) = (r⃗_i · r⃗_j) / (||r⃗_i|| · ||r⃗_j||)，已对不同物品流行度进行归一化。
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                <tr>
                  <th className="p-2.5 font-semibold sticky left-0 bg-slate-50 border-r border-slate-200">
                    物品
                  </th>
                  {items.map(it => (
                    <th key={it.id} className="p-2 text-center truncate max-w-[100px]" title={it.title}>
                      {it.title.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(i1 => (
                  <tr key={i1.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-2.5 font-semibold sticky left-0 bg-white border-r border-slate-200 truncate max-w-[120px]">
                      {i1.title.split(' ')[0]}
                    </td>
                    {items.map(i2 => {
                      const sim = similarityMatrix[i1.id]?.[i2.id] || 0;
                      const isDiag = i1.id === i2.id;
                      return (
                        <td
                          key={i2.id}
                          className={`p-2 text-center font-mono font-medium ${
                            isDiag
                              ? 'bg-slate-100 text-slate-400'
                              : sim >= 0.7
                              ? 'bg-indigo-100 text-indigo-900 font-bold'
                              : sim >= 0.4
                              ? 'bg-indigo-50 text-indigo-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {sim.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
