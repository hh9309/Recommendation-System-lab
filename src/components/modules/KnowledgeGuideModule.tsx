import React from 'react';
import { 
  GraduationCap, 
  Users, 
  Box, 
  Layers, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle,
  Sparkles,
  ArrowRight,
  TrendingDown
} from 'lucide-react';

export const KnowledgeGuideModule: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              模块 10
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              推荐系统机理与协同过滤知识导引 (Academic & Engineering Guide)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            深入解析协同过滤核心机理差异、空间连续表示、三大致命推荐陷阱及工业界经典误区。为算法工程师与科研学者提供严谨的架构决策参考。
          </p>
        </div>

        <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-mono font-medium">
          工业界最佳实践指引
        </span>
      </div>

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Section 1: User-CF vs Item-CF */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <span className="w-5 h-5 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-700 font-mono">
                1
              </span>
              <span>核心机理差异：两大经典方法选型哲学</span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 mt-2">
              User-CF (“人以群分”) vs Item-CF (“物以类聚”)
            </h3>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              <strong>User-CF 基于用户相似度：</strong> 适用于用户规模远小于物品规模、用户兴趣多变且具有强烈社交传染性的场景（如热点微博、社交网络、短视频热梗）。优点是具备惊喜度（Serendipity），缺点是用户库暴增时计算开销呈 O(m²) 膨胀且在线相似度矩阵极难维护。
            </p>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              <strong>Item-CF 基于物品相似度：</strong> 适用于物品库相对稳定、长尾效应显著的场景（如亚马逊电商、Netflix 影视、图书零售）。物品之间的物理相似度相对静态，离线预先计算好物品相似度矩阵后，线上可根据用户实时点击流进行 O(1) 毫秒级查表推荐，且具备绝佳的推荐可解释性（“因为你看了 A，所以推荐 B”）。
            </p>
          </div>

          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-indigo-900 font-medium">
            💡 选型金标准：当 m ≫ n（用户远多于物品），优先选 Item-CF；当 n ≫ m（物品海量且寿命短），优先选 User-CF 或双塔 Embedding。
          </div>
        </div>

        {/* Section 2: Space Representation & SVD */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <span className="w-5 h-5 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-700 font-mono">
                2
              </span>
              <span>适用条件与连续空间表示</span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 mt-2">
              从离散高维稀疏空间到连续低维隐语义空间 (SVD)
            </h3>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              <strong>协同过滤的本质前提：</strong> 必须存在可观测的用户交互历史（显式打分、点击、停留、收藏）。协同过滤完全不依赖物品的文本/视觉属性即可推演，但受困于“高维稀疏性”（实际工业矩阵稀疏度常高达 99.9%）。
            </p>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              <strong>SVD 矩阵分解的几何突破：</strong> 将非结构化的 m×n 稀疏打分表映射为紧凑的 k 维连续语义空间（P ∈ ℝ^(m×k), Q ∈ ℝ^(n×k)）。使得未曾共同评分但具有相似隐偏好的用户和物品在连续欧氏空间中产生几何临近，有效破解维度灾难与相似度冷冻。
            </p>
          </div>

          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-emerald-900 font-medium">
            💡 隐语义泛化性：即便两位用户从未评价同一部电影，但只要他们喜欢的电影在隐空间基底投影接近，SVD 即可准确推断其交叉偏好。
          </div>
        </div>

        {/* Section 3: 3 Deadly Traps */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-700 text-xs font-bold uppercase tracking-wider">
              <span className="w-5 h-5 rounded-md bg-rose-100 flex items-center justify-center text-rose-700 font-mono">
                3
              </span>
              <span>三大致命推荐陷阱与工程死锁</span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 mt-2">
              冷启动死锁、极度稀疏失效与回音室茧房
            </h3>

            <div className="space-y-2 mt-2 text-xs text-slate-600">
              <div className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-100">
                <strong className="text-rose-900">陷阱一：实体冷启动 (Cold Start)</strong>
                <p className="mt-0.5 text-slate-600">新注册用户或新上架商品无交互历史，在评分矩阵中全为 0/null，余弦/皮尔逊公式分母为 0 导致向量无法计算。</p>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-100">
                <strong className="text-rose-900">陷阱二：稀疏性雪崩 (Sparsity Failure)</strong>
                <p className="mt-0.5 text-slate-600">用户间共同评价项极少（往往仅 1~2 项），皮尔逊相关系数退化为 1.0 或 -1.0 的极端偶然噪声，置信度崩溃。</p>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-100">
                <strong className="text-rose-900">陷阱三：回音室效应 (Echo Chamber / Diversity Collapse)</strong>
                <p className="mt-0.5 text-slate-600">纯协同过滤会不断推荐用户历史同质化内容，推荐多样性 (Diversity) 逐轮萎缩，最终形成狭隘的信息茧房。</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
            <strong>工程破局法：</strong> 引入 Multi-Armed Bandit (LinUCB) 探索新内容；使用基于内容的跨模态特征进行冷启动预充填；在重排层加入行列式点过程 (DPP) 强制打散品类。
          </div>
        </div>

        {/* Section 4: Misconceptions & Diagnostics */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider">
              <span className="w-5 h-5 rounded-md bg-amber-100 flex items-center justify-center text-amber-700 font-mono">
                4
              </span>
              <span>误区警示与诊断陷阱</span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 mt-2">
              热门物品偏差、准确率虚高与离线/在线割裂
            </h3>

            <div className="space-y-2 mt-2 text-xs text-slate-600">
              <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-100">
                <strong className="text-amber-900">误区一：热门物品偏置拉高离线指标 (Popularity Bias)</strong>
                <p className="mt-0.5 text-slate-600">如果模型每次都无脑推荐全网最火爆的爆款，离线 Hit Rate 与 Precision 往往极高，但用户打开 App 会觉得推荐毫无针对性，导致在线停留与转化暴跌。</p>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-100">
                <strong className="text-amber-900">误区二：预测评分高不等于真实当下喜欢</strong>
                <p className="mt-0.5 text-slate-600">用户即便给《辛德勒的名单》打了 5 星，在深夜疲惫时段依然更可能点击轻松的搞笑短视频。纯打分预估缺乏实时上下文 (Context-Aware) 考量。</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-xs text-amber-900 font-medium">
            💡 诊断修正：在计算物品共现相似度时，必须加入热门物品降权惩罚因子：sim(i, j) = C(i, j) / (N(i)^α · N(j)^(1-α))，并构建粗排、精排、重排多级工业漏斗！
          </div>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-indigo-600" />
          三大主流协同过滤技术选型决策全景矩阵
        </h3>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="p-3">评估维度</th>
                <th className="p-3 text-indigo-700">基于用户 (User-CF)</th>
                <th className="p-3 text-emerald-700">基于物品 (Item-CF)</th>
                <th className="p-3 text-amber-700">矩阵分解 (FunkSVD / BiasedMF)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3 font-semibold text-slate-800">计算复杂度 (离线/在线)</td>
                <td className="p-3 text-slate-600">离线 O(m²·n)，在线检索高</td>
                <td className="p-3 text-slate-600">离线 O(n²·m)，在线查表 O(1) 极快</td>
                <td className="p-3 text-slate-600">离线 SGD 迭代 O(epochs·|K|·k)，在线向量点积极快</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-800">长尾稀疏性抵抗力</td>
                <td className="p-3 text-rose-600 font-medium">较差 (共同评价项缺失)</td>
                <td className="p-3 text-amber-600 font-medium">中等 (依赖物品共现)</td>
                <td className="p-3 text-emerald-600 font-bold">极强 (低维连续隐空间插值)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-800">推荐可解释性 (Explainability)</td>
                <td className="p-3 text-slate-600">“与你品味相似的某某也喜欢” (较弱)</td>
                <td className="p-3 text-emerald-700 font-bold">“根据你曾看过的某某推荐” (最强)</td>
                <td className="p-3 text-slate-600">隐因子抽象不可读 (黑盒，需额外解释器)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-800">推荐惊喜度 (Serendipity)</td>
                <td className="p-3 text-emerald-700 font-bold">高 (跨品类发掘邻居的新偏好)</td>
                <td className="p-3 text-slate-600">中等 (偏向同类或互补品)</td>
                <td className="p-3 text-indigo-700 font-medium">良好 (隐空间语义交汇)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-800">适用业务形态</td>
                <td className="p-3 text-slate-700">新闻热点、社交圈子、短视频</td>
                <td className="p-3 text-slate-700">电商零售、影视库、音乐电台</td>
                <td className="p-3 text-slate-700">通用流媒体召回与精排打分底层</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
