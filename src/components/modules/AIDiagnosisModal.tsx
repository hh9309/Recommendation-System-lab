import React, { useState } from 'react';
import { User, Item, ChatMessage } from '../../types/recsys';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Activity, 
  AlertTriangle, 
  Flame, 
  Compass, 
  RefreshCw,
  X,
  Settings,
  Key,
  AlertCircle
} from 'lucide-react';
import { 
  getLLMConfig, 
  LLMConfig, 
  callLLMDiagnosis, 
  getCurrentApiKey 
} from '../../utils/llmService';
import { ModelSettingsModal } from '../ModelSettingsModal';

interface AIDiagnosisModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  items: Item[];
  sparsityPercent: number;
}

export const AIDiagnosisModal: React.FC<AIDiagnosisModalProps> = ({
  isOpen,
  onClose,
  users,
  items,
  sparsityPercent,
}) => {
  const [llmConfig, setLlmConfig] = useState<LLMConfig>(getLLMConfig());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Cold start users: users with <= 1 rating
  const coldStartUsers = users.filter(u => Object.values(u.ratings).filter(r => r !== null).length <= 1);
  const coldStartItems = items.filter(it => users.filter(u => u.ratings[it.id] !== null).length <= 1);

  const longTailRisk = sparsityPercent > 70 ? '高 (极度偏态分布)' : '中等 (平衡分布)';

  const activeApiKey = getCurrentApiKey(llmConfig);
  const isKeyConfigured = Boolean(activeApiKey);

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `你好！我是推荐系统算法随诊导师。\n\n已完成对当前数据集的实时全量切片扫描：\n• 矩阵稀疏度: ${sparsityPercent}% (${sparsityPercent > 80 ? '极高稀疏' : '中度稀疏'})\n• 冷启动实体: 发现 ${coldStartUsers.length} 位新注册用户与 ${coldStartItems.length} 个冷门物品\n• 长尾效应风险: ${longTailRisk}\n\n建议采用【粗排双塔向量召回 + 精排带偏置矩阵分解 BiasedMF + 多目标重排】的混合推荐架构。\n\n⚠️ 本项目部署于 GitHub 纯前端，所有大模型调用必须点击标题右侧小齿轮 ⚙️ 手工输入 API-Key 后方可调用！`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || loading) return;

    if (!isKeyConfigured) {
      const warningMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'system',
        text: `⚠️ 【必须输入 API-Key】本项目部署于 GitHub 纯前端，所有大模型调用必须输入 API-Key 后才能调用！\n请点击标题最右侧的 ⚙️ 小齿轮图标，手工输入您的 ${
          llmConfig.selectedModel === 'gemini-3-flash' ? 'Google Gemini' : 'DeepSeek'
        } API-Key 并确认保存。`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, warningMsg]);
      setIsSettingsOpen(true);
      return;
    }

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const systemContext = `推荐系统环境：用户数=${users.length}, 物品数=${items.length}, 矩阵稀疏度=${sparsityPercent}%, 冷启动用户数=${coldStartUsers.length}, 冷启动物品数=${coldStartItems.length}. 当前调用模型=${llmConfig.selectedModel}`;
      const reply = await callLLMDiagnosis(userText, systemContext, llmConfig);

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: `调用失败: ${err?.message || '网络连接超时'}。\n如密钥填错或欠费，请点击右上角 ⚙️ 小齿轮重新配置。`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const promptShortcuts = [
    '分析当前数据集的极度稀疏性并提出改进方案',
    '如何通过 Bandit 强化学习解决新用户冷启动？',
    '怎样抑制热门物品马太效应并提升推荐多样性？',
    '请详细对比 User-CF、Item-CF 与 SVD 的核心差异'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-xs">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">AI 推荐系统大模型随诊控制台</h3>
                {/* Gear Icon at the right of the title */}
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer group"
                  title="设置大模型与 API-Key"
                >
                  <Settings className="h-4 w-4 transition-transform group-hover:rotate-45" />
                </button>

                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 font-mono">
                  {llmConfig.selectedModel}
                </span>

                <span
                  onClick={() => setIsSettingsOpen(true)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer border ${
                    isKeyConfigured
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-400/40 animate-pulse'
                  }`}
                  title="点击配置 API-Key"
                >
                  {isKeyConfigured ? '● API-Key已配置' : '○ 点击填入 API-Key'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                支持 GitHub 部署浏览器直连，必须手工配置 API-Key 后方可调用
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="大模型设置"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Health Scorecard Banner */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <Activity className="h-3.5 w-3.5 text-amber-500" />
              <span>数据稀疏度</span>
            </div>
            <div className="font-mono text-base font-bold text-slate-900">{sparsityPercent}%</div>
            <div className="text-[10px] text-amber-600 font-medium">
              {sparsityPercent >= 80 ? '严重稀疏 (需隐语义降维)' : '中等稀疏'}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
              <span>冷启动实体</span>
            </div>
            <div className="font-mono text-base font-bold text-slate-900">
              {coldStartUsers.length} 用户 / {coldStartItems.length} 物品
            </div>
            <div className="text-[10px] text-rose-600 font-medium">推荐启用 Content-based 补偿</div>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span>长尾集中度</span>
            </div>
            <div className="font-mono text-base font-bold text-slate-900">{longTailRisk.split(' ')[0]}</div>
            <div className="text-[10px] text-slate-400 font-medium">马太效应适度</div>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <Compass className="h-3.5 w-3.5 text-indigo-500" />
              <span>建议混合策略</span>
            </div>
            <div className="font-semibold text-indigo-700 truncate">SVD + Bandit + Item-CF</div>
            <div className="text-[10px] text-indigo-600 font-medium">漏斗粗排精排体系</div>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50 max-h-[380px]">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              {msg.sender === 'system' && (
                <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                  <AlertCircle className="h-4 w-4" />
                </div>
              )}
              <div
                className={`p-3.5 rounded-2xl max-w-[85%] whitespace-pre-line shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-xs font-medium'
                    : msg.sender === 'system'
                    ? 'bg-amber-50 text-amber-900 border border-amber-200 rounded-tl-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                }`}
              >
                {msg.text}
                <div
                  className={`text-[9px] mt-1.5 text-right font-mono ${
                    msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 text-xs text-slate-500 items-center">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white flex-shrink-0 animate-pulse">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                <span>
                  {llmConfig.selectedModel === 'gemini-3-flash' ? 'Gemini 3 Flash' : 'DeepSeek V4 Pro'}{' '}
                  算法导师正在结合推荐矩阵进行推理...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Prompt Shortcuts */}
        <div className="px-5 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-slate-400 whitespace-nowrap flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-indigo-500" />
            快速问答:
          </span>
          {promptShortcuts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-[11px] whitespace-nowrap transition-colors border border-slate-200/80 cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage(inputMessage)}
            placeholder={
              isKeyConfigured
                ? `使用 [${llmConfig.selectedModel}] 提问推荐系统问题...`
                : '请先点击标题右侧小齿轮 ⚙️ 设置并输入 API-Key 后方可调用...'
            }
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-indigo-500"
          />
          <button
            onClick={() => handleSendMessage(inputMessage)}
            disabled={!inputMessage.trim() || loading}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <span>发送</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Model Settings Modal */}
      <ModelSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={llmConfig}
        onSave={updated => {
          setLlmConfig(updated);
        }}
      />
    </div>
  );
};
