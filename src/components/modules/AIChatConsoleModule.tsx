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
  Settings, 
  Key, 
  Github, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { 
  getLLMConfig, 
  saveLLMConfig, 
  LLMConfig, 
  callLLMDiagnosis, 
  getCurrentApiKey 
} from '../../utils/llmService';
import { ModelSettingsModal } from '../ModelSettingsModal';

interface AIChatConsoleModuleProps {
  users: User[];
  items: Item[];
  sparsityPercent: number;
}

export const AIChatConsoleModule: React.FC<AIChatConsoleModuleProps> = ({
  users,
  items,
  sparsityPercent,
}) => {
  const [llmConfig, setLlmConfig] = useState<LLMConfig>(getLLMConfig());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
      text: `你好！我是推荐系统算法随诊导师。\n\n针对当前推荐矩阵状态诊断分析：\n• 矩阵稀疏度: ${sparsityPercent}%\n• 冷启动实体: 发现 ${coldStartUsers.length} 位新用户与 ${coldStartItems.length} 个冷门物品\n• 长尾效应风险: ${longTailRisk}\n\n📌【GitHub 纯前端调用注意】：本项目支持 GitHub 静态部署，所有大模型调用必须在右上角 ⚙️ 小齿轮中配置 API-Key 后方可调用。当前支持「gemini 3 flash」与「deepseek-v4-pro」双模型切换。`,
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

  return (
    <div className="space-y-6">
      {/* 1. Header with title & far right gear icon */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              模块 7
            </span>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                AI 推荐系统大模型随诊控制台
              </h2>
              {/* Gear Settings Button at the right of Title */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 transition-all cursor-pointer shadow-2xs group"
                title="设置大模型与 API-Key"
              >
                <Settings className="h-4 w-4 transition-transform group-hover:rotate-45" />
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            本项目可部署在 GitHub 纯前端，由用户浏览器直连调用大模型。支持在标题右侧小齿轮 ⚙️ 中手工输入 API-Key，并在 <strong className="text-indigo-700 font-mono">gemini 3 flash</strong> 与 <strong className="text-emerald-700 font-mono">deepseek-v4-pro</strong> 之间自由切换。
          </p>
        </div>

        {/* Status badges & Quick Settings Trigger */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 font-mono">
            <span className="text-slate-400">大模型:</span>
            <strong className="text-slate-900">{llmConfig.selectedModel}</strong>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
              isKeyConfigured
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-900 border-amber-300'
            }`}
            onClick={() => setIsSettingsOpen(true)}
            title="点击修改 API-Key"
          >
            <Key className="h-3.5 w-3.5" />
            <span>{isKeyConfigured ? 'API-Key 已就绪' : '未输入 API-Key (点击配置)'}</span>
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-xs transition-colors cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>设置大模型</span>
          </button>
        </div>
      </div>

      {/* 2. Top Stats Scorecard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Activity className="h-3.5 w-3.5 text-amber-500" />
            <span>数据稀疏度</span>
          </div>
          <div className="font-mono text-base font-bold text-slate-900">{sparsityPercent}%</div>
          <div className="text-[10px] text-amber-600 font-medium">高稀疏协同过滤特征</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
            <span>冷启动实体</span>
          </div>
          <div className="font-mono text-base font-bold text-slate-900">
            {coldStartUsers.length} 用户 / {coldStartItems.length} 物品
          </div>
          <div className="text-[10px] text-rose-600 font-medium">推荐启用 Content-based 补偿</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            <span>长尾集中度</span>
          </div>
          <div className="font-mono text-base font-bold text-slate-900">{longTailRisk.split(' ')[0]}</div>
          <div className="text-[10px] text-slate-400 font-medium">马太效应适度</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Compass className="h-3.5 w-3.5 text-indigo-500" />
            <span>部署模式</span>
          </div>
          <div className="font-semibold text-indigo-700 truncate">GitHub 纯前端客户端直连</div>
          <div className="text-[10px] text-indigo-600 font-medium">需输入 API-Key</div>
        </div>
      </div>

      {/* 3. Main Chat Conversation Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-[520px]">
        {/* Chat Messages Log */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-2xs">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              {msg.sender === 'system' && (
                <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-2xs">
                  <AlertCircle className="h-4 w-4" />
                </div>
              )}
              <div
                className={`p-4 rounded-2xl max-w-[85%] whitespace-pre-line shadow-2xs ${
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
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white flex-shrink-0 animate-pulse">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                <span>
                  {llmConfig.selectedModel === 'gemini-3-flash' ? 'Gemini 3 Flash' : 'DeepSeek V4 Pro'}{' '}
                  正在结合推荐矩阵进行深度推理与解答...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Prompt Quick Shortcuts */}
        <div className="px-5 py-2.5 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-slate-400 whitespace-nowrap flex items-center gap-1 font-medium">
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
        <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-2.5">
          <input
            type="text"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage(inputMessage)}
            placeholder={
              isKeyConfigured
                ? `使用 [${llmConfig.selectedModel}] 提问协同过滤推荐算法...`
                : '请先点击右上角小齿轮 ⚙️ 设置并输入 API-Key 后方可调用...'
            }
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-indigo-500"
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
