import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { GoogleGenAI } from '@google/genai';

function geminiApiPlugin(): Plugin {
  return {
    name: 'gemini-api-server',

    configureServer(server) {
      server.middlewares.use('/api/gemini/chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            error: 'Method Not Allowed'
          }));
          return;
        }

        let body = '';

        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const {
              message,
              systemContext
            } = JSON.parse(body || '{}');

            const apiKey = process.env.GEMINI_API_KEY;

            if (!apiKey) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;

              res.end(JSON.stringify({
                reply: `【系统提示】未检测到 GEMINI_API_KEY 环境变量。已切换至离线智能诊断引擎。

针对当前推荐系统状态诊断建议：

1. 稀疏性：
对于稀疏度超过 85% 的评分矩阵，传统的 Pearson 相似度常因共同评价项过少而退化，推荐采用带收缩项（Shrinkage）的相似度或隐语义模型（FunkSVD / BiasedMF）。

2. 冷启动：
对新物品应采用 Content-based 标签投影结合 Bandit 探索机制（如 LinUCB），对新用户优先展示高信息熵的冷启动问卷项。

3. 混合推荐：
构建以向量召回（Item2Vec/SVD）为粗排、多目标模型为精排、多样性重排（DPP）的推荐架构。`,
                fallback: true
              }));

              return;
            }

            const ai = new GoogleGenAI({
              apiKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build'
                }
              }
            });

            const prompt = `你是一位专注于推荐系统和协同过滤的资深算法科学家与全栈实验室导师。

用户正在交互探索推荐系统实验室，当前系统上下文如下：

${systemContext || '常规实验室环境'}

请用专业、清晰、深入浅出的中文简体回答用户的问题：

${message}`;

            const response = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: prompt
            });

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;

            res.end(JSON.stringify({
              reply: response.text || '暂未生成分析结果。'
            }));

          } catch (err: any) {
            console.error('Gemini API Error:', err);

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;

            res.end(JSON.stringify({
              error: err?.message || 'Gemini API 处理失败',
              reply: '调用 Gemini 模型时出现异常，请检查网络或配置。'
            }));
          }
        });
      });
    }
  };
}

export default defineConfig({
  // GitHub Pages 仓库：
  // https://github.com/hh9309/Recommendation-System-lab
  base: '/Recommendation-System-lab/',

  plugins: [
    react(),
    tailwindcss(),
    geminiApiPlugin()
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.')
    }
  },

  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true'
      ? null
      : {}
  }
});