import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API endpoint for Gemini chat / diagnostics
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, systemContext } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      res.json({
        reply: `【系统提示】未检测到 GEMINI_API_KEY 环境变量。已切换至离线智能诊断引擎。\n\n针对当前推荐系统状态诊断建议：\n1. 稀疏性：对于稀疏度超过 85% 的评分矩阵，传统的 Pearson 相似度常因共同评价项过少而退化，推荐采用带收缩项（Shrinkage）的相似度或隐语义模型（FunkSVD / BiasedMF）。\n2. 冷启动：对新物品应采用 Content-based 标签投影结合 Bandit 探索机制（如 LinUCB），对新用户优先展示高信息熵（多样性高、方差大）的冷启动问卷项。\n3. 混合推荐（Hybrid）：构建以向量召回（Item2Vec/SVD）为粗排、多目标神经网络（MMoE/DLRM）为精排、多样性重排（DPP行列式点过程）的工业级漏斗架构。`,
        fallback: true
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `你是一位专注于推荐系统 (Recommendation System) 和协同过滤 (Collaborative Filtering) 的资深算法科学家与全栈实验室导师。\n用户正在交互探索协同过滤推荐实验室，当前系统上下文如下：\n${systemContext || '常规实验室环境'}\n\n请用专业、清晰、深入浅出且富含数学和工程洞见的中文简体回答用户的提问：\n${message}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ reply: response.text || '暂未生成分析结果。' });
  } catch (err: any) {
    console.error('Gemini API Error in Express:', err);
    res.status(500).json({
      error: err?.message || 'Server error',
      reply: '在处理诊断请求时发生异常，请检查配置。'
    });
  }
});

// Serve static assets in production
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
