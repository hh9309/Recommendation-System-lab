import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  X, 
  Key, 
  Check, 
  Eye, 
  EyeOff, 
  Cpu, 
  Sparkles, 
  ShieldCheck, 
  Github, 
  AlertCircle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { LLMConfig, LLMModelId, saveLLMConfig } from '../utils/llmService';

interface ModelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: LLMConfig;
  onSave: (newConfig: LLMConfig) => void;
}

export const ModelSettingsModal: React.FC<ModelSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [selectedModel, setSelectedModel] = useState<LLMModelId>(config.selectedModel);
  const [geminiApiKey, setGeminiApiKey] = useState(config.geminiApiKey);
  const [deepseekApiKey, setDeepseekApiKey] = useState(config.deepseekApiKey);
  const [showKey, setShowKey] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [customGeminiEndpoint, setCustomGeminiEndpoint] = useState(config.customGeminiEndpoint || '');
  const [customDeepseekEndpoint, setCustomDeepseekEndpoint] = useState(config.customDeepseekEndpoint || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedModel(config.selectedModel);
      setGeminiApiKey(config.geminiApiKey);
      setDeepseekApiKey(config.deepseekApiKey);
      setCustomGeminiEndpoint(config.customGeminiEndpoint || '');
      setCustomDeepseekEndpoint(config.customDeepseekEndpoint || '');
      setSavedNotice(false);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const currentApiKey = selectedModel === 'gemini-3-flash' ? geminiApiKey : deepseekApiKey;
  const setCurrentApiKey = (val: string) => {
    if (selectedModel === 'gemini-3-flash') {
      setGeminiApiKey(val);
    } else {
      setDeepseekApiKey(val);
    }
  };

  const handleConfirm = () => {
    const updated: LLMConfig = {
      selectedModel,
      geminiApiKey: geminiApiKey.trim(),
      deepseekApiKey: deepseekApiKey.trim(),
      customGeminiEndpoint: customGeminiEndpoint.trim(),
      customDeepseekEndpoint: customDeepseekEndpoint.trim(),
    };
    saveLLMConfig(updated);
    onSave(updated);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>大模型参数与 API-Key 设置</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-500/30 text-indigo-300 font-mono">
                  GitHub 客户端直连
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                支持纯前端部署与浏览器直接调用，必须手工配置 API-Key
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* GitHub Pure Client-Side Call Notice */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2.5">
            <Github className="h-4 w-4 text-amber-700 mt-0.5 flex-shrink-0" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-bold">GitHub 纯前端部署说明：</span>
              本项目适合直接构建并托管在 GitHub Pages 等纯静态环境。
              <strong>所有大模型调用必须先在此手工输入 API-Key</strong>，密钥仅保存在您当前浏览器的本地 <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">localStorage</code> 中，绝不上传任何中转服务器。
            </div>
          </div>

          {/* 1. Select Model (2 models: gemini 3 flash / deepseek-v4-pro) */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 block text-xs flex items-center justify-between">
              <span>第一步：选择调用的大模型 (Select Model)</span>
              <span className="text-[10px] text-indigo-600 font-medium">支持二选一切换</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Option 1: gemini 3 flash */}
              <div
                onClick={() => setSelectedModel('gemini-3-flash')}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  selectedModel === 'gemini-3-flash'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">gemini 3 flash</span>
                    {selectedModel === 'gemini-3-flash' && (
                      <Check className="h-4 w-4 text-indigo-600" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                    Google 最新高性能闪电模型，数学推导与高并发分析能力优异。
                  </p>
                </div>
                <div className="mt-2 text-[10px] font-mono text-indigo-700">
                  {geminiApiKey ? '● 已配置 API-Key' : '○ 待填入 API-Key'}
                </div>
              </div>

              {/* Option 2: deepseek-v4-pro */}
              <div
                onClick={() => setSelectedModel('deepseek-v4-pro')}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  selectedModel === 'deepseek-v4-pro'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">deepseek-v4-pro</span>
                    {selectedModel === 'deepseek-v4-pro' && (
                      <Check className="h-4 w-4 text-indigo-600" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                    深度求索开源基座推理引擎，长文本逻辑链深度反思与代码能力强劲。
                  </p>
                </div>
                <div className="mt-2 text-[10px] font-mono text-emerald-700">
                  {deepseekApiKey ? '● 已配置 API-Key' : '○ 待填入 API-Key'}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Manual API Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-indigo-600" />
                <span>第二步：手工输入 {selectedModel === 'gemini-3-flash' ? 'Gemini' : 'DeepSeek'} API-Key</span>
                <span className="text-rose-500">* (必填)</span>
              </label>

              <a
                href={
                  selectedModel === 'gemini-3-flash'
                    ? 'https://aistudio.google.com/app/apikey'
                    : 'https://platform.deepseek.com/api_keys'
                }
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
              >
                <span>获取密钥</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={currentApiKey}
                onChange={e => setCurrentApiKey(e.target.value)}
                placeholder={
                  selectedModel === 'gemini-3-flash'
                    ? '请输入 Google AI Studio 密钥 (如 AIzaSy...)'
                    : '请输入 DeepSeek 密钥 (如 sk-...)'
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pr-20 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-indigo-500 transition-colors"
              />
              <div className="absolute right-2 top-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600"
                  title={showKey ? '隐藏密钥' : '显示明文'}
                >
                  {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                {currentApiKey && (
                  <button
                    type="button"
                    onClick={() => setCurrentApiKey('')}
                    className="p-1 rounded text-slate-400 hover:text-rose-600"
                    title="清空"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-0.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>端到端本地安全存储，未配置 API-Key 时系统将拦截模型请求并提示配置。</span>
            </div>
          </div>

          {/* Advanced Custom Endpoint (Collapsible) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <span>{showAdvanced ? '收起自定义 Base URL' : '自定义 API 代理 / Base URL (可选)'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div>
                  <label className="text-[10px] text-slate-600 block mb-0.5">
                    {selectedModel === 'gemini-3-flash' ? 'Gemini 请求完整代理 URL' : 'DeepSeek 兼容端点 Base URL'}:
                  </label>
                  <input
                    type="text"
                    value={
                      selectedModel === 'gemini-3-flash'
                        ? customGeminiEndpoint
                        : customDeepseekEndpoint
                    }
                    onChange={e => {
                      if (selectedModel === 'gemini-3-flash') {
                        setCustomGeminiEndpoint(e.target.value);
                      } else {
                        setCustomDeepseekEndpoint(e.target.value);
                      }
                    }}
                    placeholder={
                      selectedModel === 'gemini-3-flash'
                        ? '留空使用官方 https://generativelanguage.googleapis.com'
                        : '留空使用官方 https://api.deepseek.com/chat/completions'
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-slate-800"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer: 3. Confirm Model & Key */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            当前选中: <strong className="text-slate-800 font-mono">{selectedModel}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium transition-colors"
            >
              取消
            </button>

            <button
              onClick={handleConfirm}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              {savedNotice ? (
                <>
                  <Check className="h-3.5 w-3.5 text-white" />
                  <span>已确认并保存！</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>确认大模型与密钥</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
