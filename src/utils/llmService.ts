export type LLMModelId = 'gemini-3-flash' | 'deepseek-v4-pro';

export interface LLMConfig {
  selectedModel: LLMModelId;
  geminiApiKey: string;
  deepseekApiKey: string;
  customGeminiEndpoint?: string;
  customDeepseekEndpoint?: string;
}

const STORAGE_KEY = 'recsys_lab_llm_config';

export function getLLMConfig(): LLMConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        selectedModel: parsed.selectedModel || 'gemini-3-flash',
        geminiApiKey: parsed.geminiApiKey || '',
        deepseekApiKey: parsed.deepseekApiKey || '',
        customGeminiEndpoint: parsed.customGeminiEndpoint || '',
        customDeepseekEndpoint: parsed.customDeepseekEndpoint || '',
      };
    }
  } catch (e) {
    console.error('Failed to read LLM config from localStorage', e);
  }

  return {
    selectedModel: 'gemini-3-flash',
    geminiApiKey: '',
    deepseekApiKey: '',
    customGeminiEndpoint: '',
    customDeepseekEndpoint: '',
  };
}

export function saveLLMConfig(config: LLMConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save LLM config to localStorage', e);
  }
}

export function getCurrentApiKey(config: LLMConfig): string {
  if (config.selectedModel === 'gemini-3-flash') {
    return config.geminiApiKey.trim();
  }
  return config.deepseekApiKey.trim();
}

export async function callLLMDiagnosis(
  userPrompt: string,
  systemContext: string,
  config: LLMConfig
): Promise<string> {
  const currentKey = getCurrentApiKey(config);

  if (!currentKey) {
    throw new Error(
      `未检测到 ${config.selectedModel === 'gemini-3-flash' ? 'Gemini 3 Flash' : 'DeepSeek V4 Pro'} 的 API-Key！\n本项目支持部署至 GitHub 纯前端，所有大模型调用必须先点击标题右侧小齿轮 ⚙️ 设置并输入 API-Key 后方可调用。`
    );
  }

  const systemInstruction = `你是一位专注于推荐系统 (Recommendation System) 和协同过滤 (Collaborative Filtering) 的资深算法科学家与全栈实验室导师。\n用户正在交互探索协同过滤推荐实验室，当前系统上下文如下：\n${systemContext}\n\n请用专业、清晰、深入浅出且富含数学和工程洞见的中文简体回答用户的提问。`;

  if (config.selectedModel === 'gemini-3-flash') {
    // Direct Browser call to Google Gemini 3 Flash / 2.5 Flash endpoint (Works on GitHub Pages)
    const endpoint = config.customGeminiEndpoint?.trim() || 
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${currentKey}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errMsg = errData.error?.message || `HTTP ${res.status} ${res.statusText}`;
      throw new Error(`Gemini API 调用异常: ${errMsg}。请检查您的 API-Key 是否正确以及配额权限。`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const textPart = candidate?.content?.parts?.[0]?.text;

    if (!textPart) {
      throw new Error('Gemini API 未返回有效文本内容，请稍后重试。');
    }

    return textPart;
  } else {
    // DeepSeek V4 Pro browser call (OpenAI-compatible format)
    const endpoint = config.customDeepseekEndpoint?.trim() || 'https://api.deepseek.com/chat/completions';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2048,
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errMsg = errData.error?.message || `HTTP ${res.status} ${res.statusText}`;
      throw new Error(`DeepSeek API 调用异常: ${errMsg}。请检查您的 DeepSeek API-Key 是否正确且账户余额充足。`);
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error('DeepSeek API 未返回有效内容，请检查请求参数。');
    }

    return reply;
  }
}
