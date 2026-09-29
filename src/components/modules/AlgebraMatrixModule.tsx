import React, { useState } from 'react';
import { User, Item } from '../../types/recsys';
import { 
  computeUserCosineSimilarity, 
  computeUserPearsonCorrelation, 
  getUserAverageRating,
  getItemAverageRating 
} from '../../utils/mathRecsys';
import { 
  Split, 
  Calculator, 
  ArrowRight, 
  Layers, 
  Info, 
  Sigma, 
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
  Compass,
  TrendingDown,
  RotateCcw,
  Zap,
  MoveUpRight
} from 'lucide-react';

interface AlgebraMatrixModuleProps {
  users: User[];
  items: Item[];
}

export const AlgebraMatrixModule: React.FC<AlgebraMatrixModuleProps> = ({ users, items }) => {
  const [sliceMode, setSliceMode] = useState<'matrix' | 'user_slice' | 'item_slice' | 'similarity_calc' | 'svd_math'>('matrix');
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || 'u1');
  const [selectedUser2Id, setSelectedUser2Id] = useState<string>(users[1]?.id || 'u2');
  const [selectedItemId, setSelectedItemId] = useState<string>(items[0]?.id || 'i1');
  const [hoveredCell, setHoveredCell] = useState<{ uId: string; iId: string } | null>(null);

  // Innovation Visual States
  const [flySliceType, setFlySliceType] = useState<'row' | 'col' | null>('row');
  const [isMeanCentered, setIsMeanCentered] = useState<boolean>(false);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  const targetUser1 = users.find(u => u.id === selectedUserId) || users[0];
  const targetUser2 = users.find(u => u.id === selectedUser2Id) || users[1];
  const targetItem = items.find(i => i.id === selectedItemId) || items[0];

  // Calculations
  const cosineSim = computeUserCosineSimilarity(targetUser1, targetUser2, items);
  const pearsonSim = computeUserPearsonCorrelation(targetUser1, targetUser2, items);
  const user1Mean = getUserAverageRating(targetUser1);
  const user2Mean = getUserAverageRating(targetUser2);
  const itemMean = getItemAverageRating(targetItem.id, users);

  // Trigger slicing extraction animation
  const handleExtractSlice = (type: 'row' | 'col') => {
    setFlySliceType(type);
    setIsExtracting(true);
    setTimeout(() => setIsExtracting(false), 900);
  };

  // Convert Cosine Similarity into Geometric Angle θ (radians & degrees)
  const clampedCos = Math.max(-1, Math.min(1, cosineSim.similarity));
  const angleRad = Math.acos(clampedCos);
  const angleDeg = Number(((angleRad * 180) / Math.PI).toFixed(1));

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              模块 1
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              代数建模与评分矩阵 (Algebraic Modeling & Sparse Matrix)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            协同过滤将个性化推荐抽象为高维稀疏矩阵填补问题。给定评分矩阵 <span className="font-mono font-semibold text-slate-800">R ∈ ℝ^(m×n)</span>，支持<strong className="text-slate-800">矩阵切片抽取飞入动画</strong>、<strong className="text-slate-800">皮尔逊均值中心化动态水波刻度</strong>以及<strong className="text-slate-800">余弦夹角几何雷达测向仪</strong>推导。
          </p>
        </div>

        {/* Slice Selector Buttons */}
        <div className="flex items-center flex-wrap gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setSliceMode('matrix')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              sliceMode === 'matrix' ? 'bg-white text-indigo-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            全局矩阵切片
          </button>
          <button
            onClick={() => setSliceMode('user_slice')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              sliceMode === 'user_slice' ? 'bg-white text-indigo-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            用户向量切片
          </button>
          <button
            onClick={() => setSliceMode('item_slice')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              sliceMode === 'item_slice' ? 'bg-white text-indigo-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            物品分布切片
          </button>
          <button
            onClick={() => setSliceMode('similarity_calc')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              sliceMode === 'similarity_calc' ? 'bg-white text-indigo-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            余弦与皮尔逊推导
          </button>
          <button
            onClick={() => setSliceMode('svd_math')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              sliceMode === 'svd_math' ? 'bg-white text-indigo-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            低秩分解代数
          </button>
        </div>
      </div>

      {/* Slice View 1: Global Rating Matrix + Fly-in Slice Extraction + Mean Centering */}
      {sliceMode === 'matrix' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 9 Cols: Matrix with Dynamic Mean-Centering & Slicing Controls */}
            <div className="lg:col-span-8 bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Split className="h-4 w-4 text-indigo-600" />
                    稀疏评分矩阵 R ∈ ℝ^({users.length}×{items.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    横轴为物品向量，纵轴为用户向量。点击行/列切片抽取将触发动态平移“飞入”下方推导区。
                  </p>
                </div>

                {/* Mean Centering Switch & Animation Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMeanCentered(!isMeanCentered)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      isMeanCentered 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-200' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    <span>{isMeanCentered ? '已开启偏置消除 (r - r̄)' : '点击: 偏置消除 (均值中心化)'}</span>
                  </button>
                </div>
              </div>

              {/* Matrix Table */}
              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                      <th className="p-2.5 font-semibold sticky left-0 bg-slate-50 z-10 border-r border-slate-200 min-w-[130px]">
                        <div className="flex items-center justify-between">
                          <span>用户 \ 物品</span>
                          <button
                            onClick={() => handleExtractSlice('row')}
                            title="抽取选定行切片"
                            className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono hover:bg-indigo-100 cursor-pointer"
                          >
                            行切片
                          </button>
                        </div>
                      </th>
                      {items.map(item => {
                        const isColSelected = selectedItemId === item.id;
                        return (
                          <th
                            key={item.id}
                            onClick={() => {
                              setSelectedItemId(item.id);
                              handleExtractSlice('col');
                            }}
                            className={`p-2 text-center min-w-[95px] max-w-[110px] truncate transition-all cursor-pointer ${
                              isColSelected 
                                ? 'bg-indigo-100/90 text-indigo-950 font-bold ring-1 ring-indigo-400' 
                                : hoveredCell?.iId === item.id 
                                  ? 'bg-indigo-50/80 text-indigo-900 font-bold' 
                                  : 'hover:bg-slate-100/70'
                            }`}
                            title={`点击抽取列切片: ${item.title}`}
                          >
                            <div className="truncate font-semibold">{item.title.split(' ')[0]}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{item.category}</div>
                          </th>
                        );
                      })}
                      <th className="p-2.5 text-center bg-slate-100/70 border-l border-slate-200 min-w-[70px]">
                        均分 r̄_u
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => {
                      const uAvg = getUserAverageRating(u);
                      const isRowSelected = selectedUserId === u.id;
                      return (
                        <tr
                          key={u.id}
                          className={`border-b border-slate-100 transition-colors ${
                            isRowSelected ? 'bg-indigo-50/50 ring-1 ring-indigo-300' : 'hover:bg-slate-50/60'
                          }`}
                        >
                          <td className="p-2.5 font-medium sticky left-0 bg-white z-10 border-r border-slate-200 flex items-center justify-between">
                            <button
                              onClick={() => {
                                setSelectedUserId(u.id);
                                handleExtractSlice('row');
                              }}
                              className="text-left font-semibold text-slate-800 hover:text-indigo-600 truncate max-w-[90px] cursor-pointer flex items-center gap-1"
                            >
                              <span>{u.name.split(' ')[0]}</span>
                            </button>
                            <span className="text-[10px] text-slate-400 font-mono">[{u.id}]</span>
                          </td>
                          {items.map(i => {
                            const val = u.ratings[i.id];
                            const isHovered = hoveredCell?.uId === u.id && hoveredCell?.iId === i.id;
                            const isCellInSelectedRow = selectedUserId === u.id && flySliceType === 'row';
                            const isCellInSelectedCol = selectedItemId === i.id && flySliceType === 'col';

                            // Compute Mean-Centered Value
                            const centeredVal = val !== null && val !== undefined ? val - uAvg : null;

                            let bgClass = 'bg-slate-50/40 text-slate-300';
                            if (val !== null && val !== undefined) {
                              if (!isMeanCentered) {
                                if (val >= 4.5) bgClass = 'bg-indigo-100 text-indigo-900 font-bold';
                                else if (val >= 4.0) bgClass = 'bg-emerald-100 text-emerald-900 font-semibold';
                                else if (val >= 3.0) bgClass = 'bg-yellow-100 text-yellow-900 font-medium';
                                else if (val >= 2.0) bgClass = 'bg-amber-100 text-amber-900 font-medium';
                                else bgClass = 'bg-rose-100 text-rose-900 font-medium';
                              } else {
                                // Centered colors (Positive = Emerald, Negative = Rose)
                                if (centeredVal! >= 0.5) bgClass = 'bg-emerald-100 text-emerald-950 font-bold';
                                else if (centeredVal! >= 0) bgClass = 'bg-emerald-50 text-emerald-800 font-medium';
                                else if (centeredVal! >= -0.5) bgClass = 'bg-rose-50 text-rose-800 font-medium';
                                else bgClass = 'bg-rose-100 text-rose-950 font-bold';
                              }
                            }

                            return (
                              <td
                                key={i.id}
                                onMouseEnter={() => setHoveredCell({ uId: u.id, iId: i.id })}
                                onMouseLeave={() => setHoveredCell(null)}
                                onClick={() => {
                                  setSelectedUserId(u.id);
                                  setSelectedItemId(i.id);
                                }}
                                className={`p-2 text-center font-mono cursor-pointer transition-all duration-300 border-r border-slate-100 last:border-r-0 ${bgClass} ${
                                  isHovered ? 'ring-2 ring-indigo-500 ring-inset scale-105 z-20 shadow-xs' : ''
                                } ${
                                  (isCellInSelectedRow || isCellInSelectedCol) 
                                    ? 'ring-1 ring-indigo-400 bg-indigo-50/70 font-bold' 
                                    : ''
                                }`}
                              >
                                {val !== null && val !== undefined ? (
                                  <div className="flex flex-col items-center justify-center">
                                    <span className="transition-all duration-300">
                                      {isMeanCentered 
                                        ? (centeredVal! >= 0 ? `+${centeredVal!.toFixed(2)}` : centeredVal!.toFixed(2))
                                        : val.toFixed(1)
                                      }
                                    </span>
                                    {/* Water-wave micro bar for Pearson mean-centering */}
                                    <div className="w-8 h-1 bg-slate-200/60 rounded-full mt-0.5 overflow-hidden">
                                      <div 
                                        className={`h-full transition-all duration-500 rounded-full ${
                                          isMeanCentered 
                                            ? (centeredVal! >= 0 ? 'bg-emerald-500' : 'bg-rose-500') 
                                            : 'bg-indigo-500'
                                        }`}
                                        style={{ 
                                          width: isMeanCentered 
                                            ? `${Math.min(100, Math.abs(centeredVal!) * 40)}%` 
                                            : `${(val / 5) * 100}%` 
                                        }}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-300">—</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="p-2 text-center font-mono font-semibold bg-slate-50 text-slate-700 border-l border-slate-200">
                            {uAvg.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Micro Status Bar */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-3">
                  <span>当前状态: <strong className="text-slate-800">{isMeanCentered ? '已消除基线偏置 (去中心化)' : '原始绝对打分 (1.0~5.0)'}</strong></span>
                  <span className="text-indigo-600 font-medium">点击左侧行/表头可触发切片升起飞入</span>
                </div>
                <button
                  onClick={() => setIsMeanCentered(false)}
                  className="text-slate-400 hover:text-slate-700 text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>复位为原始评分</span>
                </button>
              </div>
            </div>

            {/* Right 4 Cols: Selected Focus Inspector */}
            <div className="lg:col-span-4 bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
                  <Calculator className="h-4 w-4 text-indigo-600" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    切片焦点推演视窗
                  </h4>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500">当前激活用户行向量 r⃗_u:</span>
                  <div className="flex items-center gap-2 mt-1 bg-white p-2.5 rounded-lg border border-slate-200">
                    <img src={targetUser1.avatar} alt={targetUser1.name} className="w-8 h-8 rounded-full object-cover" />
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-slate-800 truncate">{targetUser1.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{targetUser1.role}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500">当前激活物品列向量 r⃗_i:</span>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 mt-1">
                    <div className="text-xs font-bold text-slate-800">{targetItem.title}</div>
                    <div className="text-[10px] text-indigo-600 font-medium">{targetItem.category}</div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                  <div className="text-xs font-semibold text-slate-700">单元格取值状态:</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">R[{targetUser1.id}, {targetItem.id}]:</span>
                    <span className="font-mono font-bold text-indigo-700 text-sm">
                      {targetUser1.ratings[targetItem.id] !== null && targetUser1.ratings[targetItem.id] !== undefined
                        ? `${targetUser1.ratings[targetItem.id]?.toFixed(1)} 分 (已观测)`
                        : 'null (待预测)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">用户基准分 r̄_u:</span>
                    <span className="font-mono text-slate-700">{user1Mean.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">中心化残差 (Bias Residual):</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {targetUser1.ratings[targetItem.id] !== null && targetUser1.ratings[targetItem.id] !== undefined
                        ? (targetUser1.ratings[targetItem.id]! - user1Mean >= 0 ? `+${(targetUser1.ratings[targetItem.id]! - user1Mean).toFixed(2)}` : (targetUser1.ratings[targetItem.id]! - user1Mean).toFixed(2))
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => setSliceMode('similarity_calc')}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
                >
                  <Compass className="h-3.5 w-3.5" />
                  <span>启动余弦夹角与雷达测向</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Fly-in Slicing Extraction Stage */}
          <div className="bg-white rounded-xl p-5 border border-indigo-100 shadow-sm space-y-4 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping"></div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MoveUpRight className="h-4 w-4 text-indigo-600" />
                  <span>立体升起·动态切片推导区 (Floating Sliced Vector Extraction)</span>
                </h4>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleExtractSlice('row')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    flySliceType === 'row' 
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  抽取行向量 r⃗_{targetUser1.id}
                </button>
                <button
                  onClick={() => handleExtractSlice('col')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    flySliceType === 'col' 
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  抽取列向量 r⃗_{targetItem.id}
                </button>
              </div>
            </div>

            {/* Floating Visualized Sliced Elements */}
            <div className={`p-4 rounded-xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/50 via-slate-50 to-indigo-50/30 transition-all duration-700 transform ${
              isExtracting ? 'scale-[1.02] shadow-md border-indigo-400 ring-2 ring-indigo-200' : 'scale-100'
            }`}>
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-semibold text-slate-700">
                  {flySliceType === 'row' 
                    ? `当前飞入切片: 用户 [${targetUser1.name}] 的行偏好特征向量 (维度: 1 × ${items.length})` 
                    : `当前飞入切片: 物品 [${targetItem.title}] 的列评价分布向量 (维度: ${users.length} × 1)`}
                </span>
                <span className="text-[11px] text-indigo-600 font-mono font-medium">
                  {isExtracting ? '⚡ 正在从矩阵高维提取并平移升起...' : '✓ 已就绪进入点积与相似度代数推演'}
                </span>
              </div>

              {/* Sliced Elements Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                {flySliceType === 'row' ? (
                  items.map(item => {
                    const val = targetUser1.ratings[item.id];
                    const isRated = val !== null && val !== undefined;
                    return (
                      <div 
                        key={item.id} 
                        className={`p-2 rounded-lg border text-center transition-all ${
                          isRated 
                            ? 'bg-white border-indigo-200 shadow-xs ring-1 ring-indigo-50' 
                            : 'bg-slate-100/70 border-dashed border-slate-300'
                        }`}
                      >
                        <div className="text-[10px] text-slate-400 truncate">{item.title.split(' ')[0]}</div>
                        <div className="font-mono text-sm font-bold mt-0.5 text-indigo-700">
                          {isRated ? val.toFixed(1) : 'NaN'}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5">
                          {isRated && isMeanCentered ? `偏置: ${(val - user1Mean >= 0 ? `+${(val - user1Mean).toFixed(1)}` : (val - user1Mean).toFixed(1))}` : ''}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  users.map(u => {
                    const val = u.ratings[targetItem.id];
                    const isRated = val !== null && val !== undefined;
                    return (
                      <div 
                        key={u.id} 
                        className={`p-2 rounded-lg border text-center transition-all ${
                          isRated 
                            ? 'bg-white border-emerald-200 shadow-xs ring-1 ring-emerald-50' 
                            : 'bg-slate-100/70 border-dashed border-slate-300'
                        }`}
                      >
                        <div className="text-[10px] text-slate-400 truncate">{u.name.split(' ')[0]}</div>
                        <div className="font-mono text-sm font-bold mt-0.5 text-emerald-700">
                          {isRated ? val.toFixed(1) : 'NaN'}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5">{u.role.split(' ')[0]}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slice View 2: User Vector Slice */}
      {sliceMode === 'user_slice' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-indigo-600" />
                用户特征向量空间切片: r⃗_u ∈ ℝ^{items.length}
              </h3>
              <p className="text-xs text-slate-500">
                将矩阵 R 的单行切片抽取为一个离散稀疏偏好向量，展示该用户在各内容维度的打分偏向与缺失项。
              </p>
            </div>

            {/* Select User */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">切换用户:</span>
              <select
                value={selectedUserId}
                onChange={e => setSelectedUserId(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-indigo-500"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* User Profile Card */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <img src={targetUser1.avatar} alt={targetUser1.name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{targetUser1.name}</h4>
                  <p className="text-xs text-slate-500">{targetUser1.role}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">已评分项数:</span>
                  <span className="font-mono font-bold text-indigo-700">
                    {Object.values(targetUser1.ratings).filter(r => r !== null).length} / {items.length}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">用户平均打分 r̄_u:</span>
                  <span className="font-mono font-bold text-slate-800">{user1Mean.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">打分偏置 (Bias):</span>
                  <span className={`font-mono font-bold ${user1Mean >= 3.5 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {(user1Mean - 3.5).toFixed(2)} ({user1Mean >= 3.5 ? '宽容型' : '苛刻型'})
                  </span>
                </div>
              </div>
            </div>

            {/* Ratings Histogram / Slices */}
            <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {items.map(item => {
                const score = targetUser1.ratings[item.id];
                const isRated = score !== null && score !== undefined;
                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border transition-all ${
                      isRated
                        ? 'bg-white border-slate-200 hover:border-indigo-300 shadow-xs'
                        : 'bg-slate-50/60 border-dashed border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-mono text-slate-400">[{item.id}]</span>
                      <span className="text-[10px] text-indigo-600 font-medium truncate max-w-[80px]">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 truncate" title={item.title}>
                      {item.title}
                    </div>

                    <div className="mt-3 flex items-end justify-between">
                      {isRated ? (
                        <>
                          <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden mr-2">
                            <div
                              className="h-full bg-indigo-600 rounded-full"
                              style={{ width: `${(score / 5) * 100}%` }}
                            />
                          </div>
                          <span className="font-mono text-sm font-bold text-indigo-700">
                            {score.toFixed(1)}
                          </span>
                        </>
                      ) : (
                        <div className="w-full text-center py-1 bg-slate-100 rounded text-[11px] text-slate-400 font-mono">
                          待推断缺失值
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Slice View 3: Item Slice */}
      {sliceMode === 'item_slice' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-emerald-600" />
                物品打分分布切片: r⃗_i ∈ ℝ^{users.length}
              </h3>
              <p className="text-xs text-slate-500">
                将矩阵 R 的单列切片抽取为一个物品在全体用户群中的评价向量，透视其流行度与受众分化。
              </p>
            </div>

            {/* Select Item */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">选择物品:</span>
              <select
                value={selectedItemId}
                onChange={e => setSelectedItemId(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-emerald-500"
              >
                {items.map(i => (
                  <option key={i.id} value={i.id}>{i.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-200/80 flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  {targetItem.category}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-2">{targetItem.title}</h4>
                <div className="flex flex-wrap gap-1 mt-2">
                  {targetItem.tags.map(t => (
                    <span key={t} className="text-[10px] bg-white text-slate-600 px-1.5 py-0.5 rounded border border-emerald-200/60">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-emerald-200/60">
                  <span className="text-slate-600">全网热度指数:</span>
                  <span className="font-mono font-bold text-emerald-800">{targetItem.popularity} / 100</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-200/60">
                  <span className="text-slate-600">综合平均分:</span>
                  <span className="font-mono font-bold text-emerald-800">{itemMean.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">评价覆盖率:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {((users.filter(u => u.ratings[targetItem.id] !== null).length / users.length) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {users.map(u => {
                const score = u.ratings[targetItem.id];
                const isRated = score !== null && score !== undefined;
                return (
                  <div
                    key={u.id}
                    className={`p-3 rounded-lg border flex items-center justify-between ${
                      isRated ? 'bg-white border-slate-200' : 'bg-slate-50/60 border-slate-200/60 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                      <div className="text-xs">
                        <div className="font-medium text-slate-800">{u.name.split(' ')[0]}</div>
                        <div className="text-[10px] text-slate-400">{u.role}</div>
                      </div>
                    </div>
                    <div className="font-mono text-sm font-bold">
                      {isRated ? (
                        <span className="text-emerald-700">{score.toFixed(1)}</span>
                      ) : (
                        <span className="text-slate-300 font-normal">未打分</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Slice View 4: Cosine vs Pearson Mathematical Derivation + Geometric Radar Gauge */}
      {sliceMode === 'similarity_calc' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Calculator className="h-4 w-4 text-indigo-600" />
                余弦相似度 vs 皮尔逊相关系数：代数推导与共同评分交集切片
              </h3>
              <p className="text-xs text-slate-500">
                对比未去均值的原始向量夹角余弦与去中心化（Mean-Centered）皮尔逊系数如何消除用户的打分尺度偏好。
              </p>
            </div>

            {/* Select Two Users to Compare */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-medium">用户 u:</span>
                <select
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800 font-medium"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-medium">用户 v:</span>
                <select
                  value={selectedUser2Id}
                  onChange={e => setSelectedUser2Id(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800 font-medium"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id} disabled={u.id === selectedUserId}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Innovation 3: Geometric Vector Angle Radar / Gauge */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50/70 p-5 rounded-xl border border-slate-200">
            {/* Left Radar SVG Arc */}
            <div className="md:col-span-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-4">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                <Compass className="h-4 w-4 text-indigo-600" />
                <span>向量夹角几何测向仪 (Vector Angle Radar)</span>
              </div>

              <div className="relative w-48 h-48 flex items-center justify-center">
                {/* SVG Radar dial */}
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* Outer coordinate circle */}
                  <circle cx="100" cy="100" r="85" fill="none" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="3 3" />
                  <circle cx="100" cy="100" r="55" fill="none" stroke="#cbd5e1" strokeWidth="1" />
                  <circle cx="100" cy="100" r="25" fill="none" stroke="#e2e8f0" strokeWidth="1" />

                  {/* Coordinate Axes */}
                  <line x1="15" y1="100" x2="185" y2="100" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="100" y1="15" x2="100" y2="185" stroke="#cbd5e1" strokeWidth="1" />

                  {/* Vector 1 (User U - Fixed Reference Angle along positive X at 0 deg) */}
                  <line x1="100" y1="100" x2="180" y2="100" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
                  <polygon points="180,100 172,96 172,104" fill="#6366f1" />

                  {/* Vector 2 (User V - Dynamic Angle θ relative to Vector 1) */}
                  {(() => {
                    const lineX = 100 + 80 * Math.cos(-angleRad);
                    const lineY = 100 + 80 * Math.sin(-angleRad);
                    return (
                      <>
                        <line x1="100" y1="100" x2={lineX} y2={lineY} stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                        <circle cx={lineX} cy={lineY} r="4" fill="#10b981" />
                      </>
                    );
                  })()}

                  {/* Arc representing angle θ */}
                  {angleDeg > 1 && (
                    <path
                      d={`M ${100 + 40} 100 A 40 40 0 0 0 ${100 + 40 * Math.cos(-angleRad)} ${100 + 40 * Math.sin(-angleRad)}`}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Center Dot */}
                  <circle cx="100" cy="100" r="4" fill="#1e293b" />
                </svg>

                {/* Center Badge */}
                <div className="absolute text-center bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded shadow-xs border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-mono">夹角 θ</div>
                  <div className="text-xs font-bold text-amber-600 font-mono">{angleDeg}°</div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 text-[11px] mt-2">
                <span className="flex items-center gap-1 text-indigo-700 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
                  {targetUser1.name.split(' ')[0]} 向量
                </span>
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                  {targetUser2.name.split(' ')[0]} 向量
                </span>
              </div>
            </div>

            {/* Right Metric Interpretations */}
            <div className="md:col-span-7 space-y-3 flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs">
                  <div className="text-[10px] text-slate-500 font-medium">几何夹角余弦 cos(θ)</div>
                  <div className="text-lg font-mono font-bold text-indigo-700 mt-0.5">
                    {clampedCos.toFixed(4)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    夹角 θ = {angleDeg}° ({angleDeg < 45 ? '强同向偏好' : angleDeg < 90 ? '弱正相关' : '趋近正交或反向'})
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-indigo-200 shadow-xs">
                  <div className="text-[10px] text-indigo-600 font-medium">去中心化皮尔逊 Pearson r</div>
                  <div className="text-lg font-mono font-bold text-indigo-900 mt-0.5">
                    {pearsonSim.similarity.toFixed(4)}
                  </div>
                  <div className="text-[10px] text-indigo-700 mt-1">
                    消除了两位用户的评分宽容度偏置
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">代数几何机理说明:</div>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  若两位用户评分绝对值不同（如用户 A 打分在 4~5 分，用户 B 打分在 2~3 分），其向量在原始空间仍可能夹角较小；而经过均值中心化后，向量原点平移到个体偏好中心，皮尔逊相关系数能更真实地还原两人在“高于自身平均分还是低于自身平均分”上的共识程度。
                </p>
              </div>
            </div>
          </div>

          {/* Common Items Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sigma className="h-3.5 w-3.5 text-indigo-600" />
              共同评分项集合 I_(uv) 观测值与中心化偏移 (共 {pearsonSim.commonItems.length} 个物品)
            </h4>

            {pearsonSim.commonItems.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-medium">
                    <tr>
                      <th className="p-2.5">物品 ID & 标题</th>
                      <th className="p-2.5 text-center">r_(u,i)</th>
                      <th className="p-2.5 text-center">(r_(u,i) - r̄_u)</th>
                      <th className="p-2.5 text-center">r_(v,i)</th>
                      <th className="p-2.5 text-center">(r_(v,i) - r̄_v)</th>
                      <th className="p-2.5 text-center font-mono">余弦点积项</th>
                      <th className="p-2.5 text-center font-mono">皮尔逊协方差项</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pearsonSim.commonItems.map(iId => {
                      const item = items.find(it => it.id === iId);
                      const ru = targetUser1.ratings[iId]!;
                      const rv = targetUser2.ratings[iId]!;
                      const diffU = ru - user1Mean;
                      const diffV = rv - user2Mean;
                      const cosTerm = ru * rv;
                      const pearsonTerm = diffU * diffV;

                      return (
                        <tr key={iId} className="border-b border-slate-100 hover:bg-slate-50/50 font-mono">
                          <td className="p-2.5 font-sans font-medium text-slate-800">
                            {item?.title}
                          </td>
                          <td className="p-2.5 text-center font-bold text-indigo-700">{ru.toFixed(1)}</td>
                          <td className={`p-2.5 text-center ${diffU >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {diffU >= 0 ? `+${diffU.toFixed(2)}` : diffU.toFixed(2)}
                          </td>
                          <td className="p-2.5 text-center font-bold text-indigo-700">{rv.toFixed(1)}</td>
                          <td className={`p-2.5 text-center ${diffV >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {diffV >= 0 ? `+${diffV.toFixed(2)}` : diffV.toFixed(2)}
                          </td>
                          <td className="p-2.5 text-center text-slate-600">{cosTerm.toFixed(2)}</td>
                          <td className={`p-2.5 text-center font-bold ${pearsonTerm >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {pearsonTerm >= 0 ? `+${pearsonTerm.toFixed(2)}` : pearsonTerm.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-200">
                两位用户之间无共同评分项，这在极高稀疏矩阵中极其常见，被称为相似度退化问题！
              </div>
            )}
          </div>

          {/* Formulas side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cosine Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">余弦相似度 (Cosine Similarity)</span>
                <span className="font-mono text-base font-bold text-indigo-700">
                  {cosineSim.similarity.toFixed(4)}
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-xs text-slate-700 space-y-1">
                <div>sim_cos(u, v) = (r⃗_u · r⃗_v) / (||r⃗_u|| · ||r⃗_v||)</div>
                <div className="text-[11px] text-slate-500">
                  未考虑个人打分尺度差异（如宽容型常打5分，苛刻型常打3分但均表示喜欢）。
                </div>
              </div>
            </div>

            {/* Pearson Card */}
            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900">皮尔逊相关系数 (Pearson Correlation)</span>
                <span className="font-mono text-base font-bold text-indigo-800">
                  {pearsonSim.similarity.toFixed(4)}
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-indigo-200 font-mono text-xs text-slate-700 space-y-1">
                <div className="text-[11px] leading-relaxed">
                  sim(u,v) = ∑(r_ui - r̄_u)(r_vi - r̄_v) / [√∑(r_ui - r̄_u)² · √∑(r_vi - r̄_v)²]
                </div>
                <div className="text-[11px] text-indigo-700 font-medium">
                  分子累计协方差: {pearsonSim.numerator.toFixed(3)}，分母几何根: {pearsonSim.denominator.toFixed(3)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slice View 5: SVD Math Low Rank Decomposition */}
      {sliceMode === 'svd_math' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              低秩矩阵分解代数推导: R ≈ P · Q^T
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              当评分矩阵 R 存在极高稀疏性时，直接计算用户相似度会因共同评价极少而失真。SVD 构造 k 维稠密隐语义空间，将 R 映射为用户矩阵 P 与物品矩阵 Q 的点积。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* R Matrix */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-2">
              <div className="text-xs font-bold text-slate-700">评分矩阵 R</div>
              <div className="text-2xl font-mono font-bold text-slate-800">{users.length} × {items.length}</div>
              <div className="text-[11px] text-slate-500">高维极度稀疏观测矩阵</div>
            </div>

            <div className="text-center font-mono font-bold text-slate-400 text-lg flex items-center justify-center gap-2">
              <span>≈</span>
              <span className="text-xs font-sans text-indigo-600 font-semibold px-2 py-0.5 bg-indigo-50 rounded">
                Rank-k 降维逼近
              </span>
            </div>

            {/* P and Q */}
            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-200 text-center space-y-2">
              <div className="text-xs font-bold text-indigo-900">用户隐因子 P × 物品隐因子 Q^T</div>
              <div className="text-lg font-mono font-bold text-indigo-800">
                ({users.length} × k) · (k × {items.length})
              </div>
              <div className="text-[11px] text-indigo-700">连续稠密隐特征向量点积</div>
            </div>
          </div>

          {/* Loss Formulation */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 font-mono text-xs text-slate-700 space-y-2">
            <div className="font-bold text-slate-900 text-sm font-sans flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              目标损失函数 (Objective Loss with L2 Regularization):
            </div>
            <div className="p-3 bg-white rounded border border-slate-200 text-indigo-900 font-semibold overflow-x-auto">
              min_(P, Q) ∑_((u,i)∈K) ( r_ui - p⃗_u · q⃗_i^T )² + λ ( ||p⃗_u||² + ||q⃗_i||² )
            </div>
            <div className="text-[11px] text-slate-500 font-sans">
              其中 K 为所有已知评分对集合，λ 为正则化系数用于防止隐向量过拟合。在模块 4 与模块 8 中可交互观测梯度下降在真实轮次中的平滑收敛动态！
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
