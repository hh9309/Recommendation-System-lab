import React, { useState, useRef, useEffect } from 'react';
import { User, Item } from '../../types/recsys';
import { trainFunkSvd } from '../../utils/mathRecsys';
import { 
  Activity, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  MoveRight,
  TrendingDown,
  Layers,
  Zap
} from 'lucide-react';

interface SVDLatentModuleProps {
  users: User[];
  items: Item[];
}

export const SVDLatentModule: React.FC<SVDLatentModuleProps> = ({ users, items }) => {
  const [latentK, setLatentK] = useState<number>(3);
  const [learningRate, setLearningRate] = useState<number>(0.04);
  const [lambdaReg, setLambdaReg] = useState<number>(0.02);
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || 'u1');
  const [selectedItemId, setSelectedItemId] = useState<string>(items[0]?.id || 'i1');
  
  // Gradient Descent Step Animation
  const [sgdStep, setSgdStep] = useState<number>(1);
  const [isPlayingSgd, setIsPlayingSgd] = useState<boolean>(false);

  // Train FunkSVD
  const svdResult = trainFunkSvd(users, items, latentK, 40, learningRate, lambdaReg);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const targetUser = users.find(u => u.id === selectedUserId) || users[0];
  const targetItem = items.find(i => i.id === selectedItemId) || items[0];

  const userFactor = svdResult.userFactors[targetUser.id] || [0.5, 0.5, 0.5];
  const itemFactor = svdResult.itemFactors[targetItem.id] || [0.5, 0.5, 0.5];

  // Dot product
  let dotProduct = 0;
  for (let f = 0; f < latentK; f++) {
    dotProduct += userFactor[f] * itemFactor[f];
  }
  const realScore = targetUser.ratings[targetItem.id];
  const error = realScore !== null && realScore !== undefined ? realScore - dotProduct : null;

  // Auto-play SGD steps
  useEffect(() => {
    if (!isPlayingSgd) return;
    const timer = setInterval(() => {
      setSgdStep(prev => (prev >= 30 ? 1 : prev + 1));
    }, 150);
    return () => clearInterval(timer);
  }, [isPlayingSgd]);

  // Render 2D Joint Latent Space
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 110;

    // Draw Coordinate Grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;

    // Concentric circles for vector magnitudes
    [0.5, 1.0, 1.5].forEach(r => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r * scale, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Axes
    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(30, centerY);
    ctx.lineTo(width - 30, centerY);
    ctx.moveTo(centerX, 30);
    ctx.lineTo(centerX, height - 30);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.fillText('隐因子 维度 1 (f₁)', width - 110, centerY - 8);
    ctx.fillText('隐因子 维度 2 (f₂)', centerX + 8, 40);

    // Draw Users (Circles)
    users.forEach(u => {
      const uf = svdResult.userFactors[u.id] || [0, 0];
      const x = centerX + uf[0] * scale;
      const y = centerY - uf[1] * scale;
      const isSelected = u.id === targetUser.id;

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, isSelected ? 8 : 5, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#4f46e5' : '#818cf8';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.font = isSelected ? 'bold 11px sans-serif' : '9px sans-serif';
      ctx.fillStyle = isSelected ? '#312e81' : '#64748b';
      ctx.fillText(u.name.split(' ')[0], x + 9, y + 3);
      ctx.restore();
    });

    // Draw Items (Diamonds)
    items.forEach(it => {
      const qf = svdResult.itemFactors[it.id] || [0, 0];
      const x = centerX + qf[0] * scale;
      const y = centerY - qf[1] * scale;
      const isSelected = it.id === targetItem.id;
      const size = isSelected ? 8 : 5;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - size, y);
      ctx.closePath();

      ctx.fillStyle = isSelected ? '#059669' : '#34d399';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.font = isSelected ? 'bold 11px sans-serif' : '9px sans-serif';
      ctx.fillStyle = isSelected ? '#064e3b' : '#64748b';
      ctx.fillText(it.title.split(' ')[0], x + 9, y + 3);
      ctx.restore();
    });

    // Draw vectors for Selected User & Item
    const targetUx = centerX + userFactor[0] * scale;
    const targetUy = centerY - userFactor[1] * scale;
    const targetIx = centerX + itemFactor[0] * scale;
    const targetIy = centerY - itemFactor[1] * scale;

    // Vector P_u (Indigo)
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(targetUx, targetUy);
    ctx.stroke();

    // Vector Q_i (Emerald)
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(targetIx, targetIy);
    ctx.stroke();

    // Arc between vectors for angle theta
    const angleU = Math.atan2(centerY - targetUy, targetUx - centerX);
    const angleI = Math.atan2(centerY - targetIy, targetIx - centerX);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, -Math.max(angleU, angleI), -Math.min(angleU, angleI));
    ctx.stroke();

    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('θ 夹角', centerX + 34, centerY - 10);

  }, [users, items, targetUser, targetItem, svdResult, userFactor, itemFactor]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              模块 4
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              矩阵分解 (SVD/FunkSVD) 隐空间与几何收敛
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            将稀疏评分矩阵 R 分解为连续隐空间中的用户向量 P 与物品向量 Q。通过 2D 联合隐空间同屏演播向量夹角点积拟合，并探究随机梯度下降 (SGD) 在损失曲面上的平滑物理收敛。
          </p>
        </div>

        {/* Hyperparams Badges */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-mono">
            因子数 k={latentK}
          </span>
          <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-mono">
            步长 γ={learningRate}
          </span>
          <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-mono">
            正则 λ={lambdaReg}
          </span>
        </div>
      </div>

      {/* Main 2-Col Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Joint 2D Latent Vector Projection */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-indigo-600" />
                2D 联合隐语义空间映射 (Joint Latent Vector Space)
              </h3>
              <p className="text-xs text-slate-500">
                用户向量 p⃗_u (蓝色圆点) 与物品向量 q⃗_i (绿色菱形) 被投影到同一连续特征空间。
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                <span className="text-slate-600">用户向量 p⃗_u</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rotate-45 bg-emerald-600"></span>
                <span className="text-slate-600">物品向量 q⃗_i</span>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="w-full h-[360px] bg-slate-50/70 rounded-xl border border-slate-200/80 flex items-center justify-center relative overflow-hidden">
            <canvas ref={canvasRef} className="w-full h-full block" />
          </div>

          {/* Mathematical Dot Product Breakdown Slice */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">用户隐向量 p⃗_[{targetUser.id}]:</span>
              <div className="font-mono font-bold text-indigo-700 mt-0.5">
                [{userFactor.map(v => v.toFixed(2)).join(', ')}]
              </div>
            </div>

            <div>
              <span className="text-slate-500 block">物品隐向量 q⃗_[{targetItem.id}]:</span>
              <div className="font-mono font-bold text-emerald-700 mt-0.5">
                [{itemFactor.map(v => v.toFixed(2)).join(', ')}]
              </div>
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-slate-500 block">点积拟合评分 r̂ = p⃗ · q⃗^T:</span>
              <div className="font-mono font-bold text-base text-slate-900 mt-0.5">
                {dotProduct.toFixed(2)} 分
                {realScore !== null && realScore !== undefined && (
                  <span className="text-xs font-normal text-slate-400 ml-1.5">
                    (真实: {realScore.toFixed(1)})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: SGD Gradient Convergence Physics */}
        <div className="space-y-4">
          {/* Target Pickers */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              隐空间点积配对测试
            </h4>

            <div>
              <label className="text-[11px] text-slate-500 block mb-1">目标用户:</label>
              <select
                value={selectedUserId}
                onChange={e => setSelectedUserId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-semibold text-slate-800"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-500 block mb-1">目标物品:</label>
              <select
                value={selectedItemId}
                onChange={e => setSelectedItemId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-semibold text-slate-800"
              >
                {items.map(i => (
                  <option key={i.id} value={i.id}>{i.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* SGD Dynamic Gradient Step Simulator */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                SGD 梯度更新几何演播
              </h4>
              <button
                onClick={() => setIsPlayingSgd(prev => !prev)}
                className="px-2 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium flex items-center gap-1 hover:bg-amber-100 cursor-pointer"
              >
                {isPlayingSgd ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                <span>{isPlayingSgd ? '暂停' : '演播梯度'}</span>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">当前更新步数:</span>
                <span className="font-mono font-bold text-slate-800">第 {sgdStep} / 30 步</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={sgdStep}
                onChange={e => setSgdStep(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700 space-y-1">
                <div className="text-slate-500">梯度微积分更新规则:</div>
                <div className="text-indigo-800 font-semibold">e_ui = r_ui - p_u · q_i^T</div>
                <div>p_u ← p_u + γ · (e_ui · q_i - λ · p_u)</div>
                <div>q_i ← q_i + γ · (e_ui · p_u - λ · q_i)</div>
              </div>

              <div className="flex justify-between items-center pt-1 text-[11px]">
                <span className="text-slate-500">当前残差 e_ui:</span>
                <span className="font-mono font-bold text-rose-600">
                  {error !== null ? `${error > 0 ? '+' : ''}${error.toFixed(3)}` : '缺失项(不回传梯度)'}
                </span>
              </div>
            </div>
          </div>

          {/* Hyperparameter Sliders */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-slate-500" />
              SVD 架构调节
            </h4>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">隐特征维度 k:</span>
                <span className="font-mono font-bold text-indigo-700">{latentK} 维</span>
              </div>
              <input
                type="range"
                min="2"
                max="5"
                value={latentK}
                onChange={e => setLatentK(parseInt(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">学习率 γ (Step Size):</span>
                <span className="font-mono font-bold text-slate-800">{learningRate}</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.08"
                step="0.01"
                value={learningRate}
                onChange={e => setLearningRate(parseFloat(e.target.value))}
                className="w-full accent-slate-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
