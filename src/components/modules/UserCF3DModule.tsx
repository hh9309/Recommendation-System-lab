import React, { useState, useRef, useEffect } from 'react';
import { User, Item } from '../../types/recsys';
import { predictUserRatingsCF, getUserAverageRating } from '../../utils/mathRecsys';
import { 
  Users, 
  Rotate3d, 
  Sparkles, 
  Sliders, 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  ArrowRight,
  Eye,
  Layers
} from 'lucide-react';

interface UserCF3DModuleProps {
  users: User[];
  items: Item[];
}

export const UserCF3DModule: React.FC<UserCF3DModuleProps> = ({ users, items }) => {
  const [targetUserId, setTargetUserId] = useState<string>(users[0]?.id || 'u1');
  const [kNeighbors, setKNeighbors] = useState<number>(3);
  const [usePearson, setUsePearson] = useState<boolean>(true);
  const [selectedUnratedItem, setSelectedUnratedItem] = useState<string>('');
  const [isRotatingAuto, setIsRotatingAuto] = useState<boolean>(false);
  const [animStep, setAnimStep] = useState<number>(3); // 0: select, 1: scan, 2: link neighbors, 3: filled

  // 3D Canvas rotation angles
  const [rotX, setRotX] = useState<number>(20);
  const [rotY, setRotY] = useState<number>(-35);
  const [zoom, setZoom] = useState<number>(1);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const targetUser = users.find(u => u.id === targetUserId) || users[0];
  const { predictedRatings, neighbors, itemDetails } = predictUserRatingsCF(
    targetUser,
    users,
    items,
    kNeighbors,
    usePearson
  );

  // Unrated items for target user
  const unratedItems = items.filter(it => targetUser.ratings[it.id] === null || targetUser.ratings[it.id] === undefined);

  useEffect(() => {
    if (unratedItems.length > 0 && !selectedUnratedItem) {
      setSelectedUnratedItem(unratedItems[0].id);
    }
  }, [unratedItems, selectedUnratedItem]);

  // Handle Canvas Mouse Drag for 3D gesture rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;
    setRotY(prev => prev + deltaX * 0.6);
    setRotX(prev => Math.max(-80, Math.min(80, prev - deltaY * 0.6)));
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Auto rotation loop
  useEffect(() => {
    if (!isRotatingAuto) return;
    const interval = setInterval(() => {
      setRotY(prev => (prev + 0.8) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [isRotatingAuto]);

  // 3D projection & rendering onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, width, height);

    // Symmetrically center 3D coordinates on canvas
    const centerX = width / 2;
    const centerY = height / 2;
    // Balanced scale factor to guarantee the 3D cube, grid, and node labels stay perfectly centered
    const baseScale = Math.min(width, height) * 0.30;
    const scale = baseScale * zoom;

    const radX = (rotX * Math.PI) / 180;
    const radY = (rotY * Math.PI) / 180;

    // 3D Rotation Function with strict centroid alignment
    const project = (x: number, y: number, z: number): { x2d: number; y2d: number; depth: number } => {
      // Rotate around Y
      const x1 = x * Math.cos(radY) + z * Math.sin(radY);
      const y1 = y;
      const z1 = -x * Math.sin(radY) + z * Math.cos(radY);

      // Rotate around X
      const x2 = x1;
      const y2 = y1 * Math.cos(radX) - z1 * Math.sin(radX);
      const z2 = y1 * Math.sin(radX) + z1 * Math.cos(radX);

      // Balanced perspective projection centered on (0, 0, 0)
      const fov = 650;
      const distance = 650 + z2 * scale * 0.5;
      const factor = fov / Math.max(50, distance);

      return {
        x2d: centerX + x2 * scale * factor,
        y2d: centerY - y2 * scale * factor,
        depth: z2
      };
    };

    // Draw Symmetrical 3D Axes Centered at (0,0,0)
    const origin = project(0, 0, 0);
    const axisLen = 1.25;
    const xAxis = project(axisLen, 0, 0);
    const yAxis = project(0, axisLen, 0);
    const zAxis = project(0, 0, axisLen);

    // Negative axes for symmetrical bounding visual
    const xAxisNeg = project(-axisLen, 0, 0);
    const yAxisNeg = project(0, -axisLen, 0);
    const zAxisNeg = project(0, 0, -axisLen);

    ctx.lineWidth = 1.2;

    // X Axis (Red)
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
    ctx.beginPath();
    ctx.moveTo(xAxisNeg.x2d, xAxisNeg.y2d);
    ctx.lineTo(xAxis.x2d, xAxis.y2d);
    ctx.stroke();

    // Y Axis (Green)
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
    ctx.beginPath();
    ctx.moveTo(yAxisNeg.x2d, yAxisNeg.y2d);
    ctx.lineTo(yAxis.x2d, yAxis.y2d);
    ctx.stroke();

    // Z Axis (Blue)
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.45)';
    ctx.beginPath();
    ctx.moveTo(zAxisNeg.x2d, zAxisNeg.y2d);
    ctx.lineTo(zAxis.x2d, zAxis.y2d);
    ctx.stroke();

    // Axes Labels
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('+X 偏好', xAxis.x2d + 5, xAxis.y2d);
    ctx.fillStyle = '#10b981';
    ctx.fillText('+Y 偏好', yAxis.x2d + 5, yAxis.y2d);
    ctx.fillStyle = '#6366f1';
    ctx.fillText('+Z 偏好', zAxis.x2d + 5, zAxis.y2d);

    // Origin center marker
    ctx.beginPath();
    ctx.arc(origin.x2d, origin.y2d, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();

    // Draw Symmetrical Centered Grid on XZ plane (-1 to 1)
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.15)';
    ctx.lineWidth = 0.8;
    for (let i = -1; i <= 1; i += 0.5) {
      const p1 = project(i, 0, -1);
      const p2 = project(i, 0, 1);
      ctx.beginPath();
      ctx.moveTo(p1.x2d, p1.y2d);
      ctx.lineTo(p2.x2d, p2.y2d);
      ctx.stroke();

      const p3 = project(-1, 0, i);
      const p4 = project(1, 0, i);
      ctx.beginPath();
      ctx.moveTo(p3.x2d, p3.y2d);
      ctx.lineTo(p4.x2d, p4.y2d);
      ctx.stroke();
    }

    // Target User projected point
    const targetProj = project(targetUser.latent3D[0], targetUser.latent3D[1], targetUser.latent3D[2]);

    // Draw K-NN glowing lines from target user to neighbors
    if (animStep >= 2) {
      neighbors.forEach((n, idx) => {
        const neighborProj = project(n.user.latent3D[0], n.user.latent3D[1], n.user.latent3D[2]);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(targetProj.x2d, targetProj.y2d);
        ctx.lineTo(neighborProj.x2d, neighborProj.y2d);

        // Glowing gradient edge
        ctx.strokeStyle = idx === 0 ? 'rgba(99, 102, 241, 0.9)' : 'rgba(16, 185, 129, 0.7)';
        ctx.lineWidth = Math.max(1.5, (n.similarity) * 4);
        ctx.stroke();

        // Edge Similarity Label in 3D
        const midX = (targetProj.x2d + neighborProj.x2d) / 2;
        const midY = (targetProj.y2d + neighborProj.y2d) / 2;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(midX - 24, midY - 9, 48, 18);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`s=${n.similarity.toFixed(2)}`, midX, midY);
        ctx.restore();
      });
    }

    // Sort users by depth for realistic 3D occlusion
    const sortedUsers = [...users].map(u => {
      const p = project(u.latent3D[0], u.latent3D[1], u.latent3D[2]);
      return { user: u, p };
    }).sort((a, b) => a.p.depth - b.p.depth);

    // Draw User Spheres
    sortedUsers.forEach(({ user, p }) => {
      const isTarget = user.id === targetUser.id;
      const isNeighbor = neighbors.some(n => n.user.id === user.id);
      const radius = isTarget ? 14 : isNeighbor ? 11 : 8;

      ctx.save();
      // Drop Shadow / Ground projection
      const groundP = project(user.latent3D[0], 0, user.latent3D[2]);
      ctx.beginPath();
      ctx.ellipse(groundP.x2d, groundP.y2d, radius * 0.7, radius * 0.35, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fill();

      // Stem to ground
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.5)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(p.x2d, p.y2d);
      ctx.lineTo(groundP.x2d, groundP.y2d);
      ctx.stroke();
      ctx.setLineDash([]);

      // Node Sphere Outer Glow
      if (isTarget) {
        ctx.beginPath();
        ctx.arc(p.x2d, p.y2d, radius + 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.25)';
        ctx.fill();
      } else if (isNeighbor) {
        ctx.beginPath();
        ctx.arc(p.x2d, p.y2d, radius + 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
        ctx.fill();
      }

      // Main Node Sphere
      ctx.beginPath();
      ctx.arc(p.x2d, p.y2d, radius, 0, Math.PI * 2);
      if (isTarget) {
        ctx.fillStyle = '#4f46e5'; // Indigo
      } else if (isNeighbor) {
        ctx.fillStyle = '#059669'; // Emerald
      } else {
        ctx.fillStyle = '#94a3b8'; // Slate
      }
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // User Name Label
      ctx.font = isTarget ? 'bold 11px sans-serif' : '10px sans-serif';
      ctx.fillStyle = isTarget ? '#1e1b4b' : isNeighbor ? '#065f46' : '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText(user.name.split(' ')[0], p.x2d, p.y2d - radius - 5);

      ctx.restore();
    });
  }, [users, targetUser, neighbors, rotX, rotY, zoom, animStep]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              模块 2
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              基于用户的协同过滤 (User-CF) 3D 演播
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            支持手势 3D 自由旋转！在三维用户偏好空间中动态寻找 K 个最近邻用户（K-NN 聚类），高亮相似度权重链路，并平滑演播填补目标用户未评分项的过程。
          </p>
        </div>

        {/* 3D Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRotatingAuto(prev => !prev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
              isRotatingAuto
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {isRotatingAuto ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isRotatingAuto ? '暂停旋转' : '自动巡航旋转'}</span>
          </button>
          <button
            onClick={() => {
              setRotX(20);
              setRotY(-35);
              setZoom(1);
            }}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="重置 3D 视角"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main 3D Canvas + Control Slices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 3D Interactive Canvas */}
        <div className="lg:col-span-2 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 rounded-2xl p-4 shadow-md border border-slate-800 flex flex-col justify-between relative overflow-hidden">
          {/* Overlay Tag */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
            <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md text-white text-[11px] font-medium border border-white/10 flex items-center gap-1.5">
              <Rotate3d className="h-3.5 w-3.5 text-indigo-400" />
              按住鼠标拖拽自由旋转 3D 视角
            </span>
          </div>

          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 text-white/70 text-xs">
            <span className="font-mono text-[11px]">Rot: [{rotX.toFixed(0)}°, {rotY.toFixed(0)}°]</span>
          </div>

          {/* Canvas */}
          <div className="w-full h-[400px] flex items-center justify-center cursor-grab active:cursor-grabbing">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full h-full block"
            />
          </div>

          {/* Bottom Zoom & Legend Bar */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-indigo-500 ring-2 ring-indigo-300"></span>
                <span className="text-white font-medium">目标用户 (Target)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-white font-medium">K-NN 近邻用户</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                <span>其他候选用户</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span>缩放:</span>
              <input
                type="range"
                min="0.6"
                max="1.5"
                step="0.05"
                value={zoom}
                onChange={e => setZoom(parseFloat(e.target.value))}
                className="w-20 accent-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Parameters & Fill Animation */}
        <div className="space-y-4">
          {/* Target User & K Slider */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-indigo-600" />
                近邻搜索超参数 (K-NN)
              </h4>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                选择目标预测用户:
              </label>
              <select
                value={targetUserId}
                onChange={e => setTargetUserId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:outline-indigo-500"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            {/* K Value Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">近邻数 K:</span>
                <span className="font-mono font-bold text-indigo-700">{kNeighbors} 位用户</span>
              </div>
              <input
                type="range"
                min="1"
                max={Math.min(5, users.length - 1)}
                value={kNeighbors}
                onChange={e => setKNeighbors(parseInt(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>K=1 (易受噪点影响)</span>
                <span>K=5 (平滑更稳健)</span>
              </div>
            </div>

            {/* Similarity Metric Toggle */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-600">相似度度量:</span>
              <button
                onClick={() => setUsePearson(prev => !prev)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-mono font-semibold transition-colors"
              >
                {usePearson ? '皮尔逊相关系数 (推荐)' : '原始余弦相似度'}
              </button>
            </div>
          </div>

          {/* Top Neighbors List */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>检索到的 Top-{kNeighbors} 相似邻居</span>
              <span className="text-[10px] font-mono text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                K-NN 聚类完成
              </span>
            </h4>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {neighbors.map((n, i) => (
                <div
                  key={n.user.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/80 hover:bg-emerald-50/50 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] flex items-center justify-center">
                      #{i + 1}
                    </span>
                    <img src={n.user.avatar} alt={n.user.name} className="w-6 h-6 rounded-full object-cover" />
                    <div>
                      <div className="font-semibold text-slate-800">{n.user.name.split(' ')[0]}</div>
                      <div className="text-[10px] text-slate-400">共同评分: {n.commonCount} 项</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-emerald-700">
                      sim = {n.similarity.toFixed(3)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      r̄={getUserAverageRating(n.user).toFixed(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Predict Unrated Item Slice & Fill */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              平滑填补未评分项演播
            </h4>

            {unratedItems.length > 0 ? (
              <div className="space-y-2">
                <label className="text-xs text-slate-600 block">选择待填补缺失物品:</label>
                <select
                  value={selectedUnratedItem}
                  onChange={e => setSelectedUnratedItem(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:outline-indigo-500"
                >
                  {unratedItems.map(it => (
                    <option key={it.id} value={it.id}>
                      {it.title} ({it.category})
                    </option>
                  ))}
                </select>

                {selectedUnratedItem && (
                  <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-200/70 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-900 font-semibold">预测评分 (Predicted):</span>
                      <span className="font-mono text-base font-bold text-indigo-800">
                        {predictedRatings[selectedUnratedItem]?.toFixed(2)} 分
                      </span>
                    </div>
                    <div className="text-[11px] text-indigo-950 font-mono break-all bg-white p-2 rounded border border-indigo-100">
                      {itemDetails[selectedUnratedItem]?.formula}
                    </div>
                    <p className="text-[10px] text-indigo-700">
                      基于近邻偏离自身均值的加权修正：r̂ = r̄_u + ∑sim·(r_v - r̄_v) / ∑|sim|
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200">
                当前用户已全部评分，无缺失项！可在案例切换至其他冷启动或稀疏用户。
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
