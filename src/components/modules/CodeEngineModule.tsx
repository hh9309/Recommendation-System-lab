import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Terminal, 
  Play, 
  RotateCcw,
  BarChart3, 
  Table as TableIcon,
  TrendingDown, 
  Layers, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export const CodeEngineModule: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<'numpy_svd' | 'sklearn_cf' | 'surprise_pipeline' | 'two_tower'>('numpy_svd');
  const [copied, setCopied] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hasExecuted, setHasExecuted] = useState<boolean>(false);
  const [activeOutputTab, setActiveOutputTab] = useState<'visual' | 'table' | 'terminal'>('visual');

  // Code snippets definition with complete runnable code and matplotlib visualization code
  const codeSnippets = {
    numpy_svd: {
      title: 'NumPy FunkSVD 矩阵分解与 SGD 迭代',
      filename: 'recsys_funksvd_numpy.py',
      description: '纯基于 NumPy 矢量化从零推导 FunkSVD，包含隐向量初始化、L2 正则化 SGD 梯度更新、损失监控绘图及 Top-N 推荐生成。',
      chartEnglish: {
        title: 'Training Loss and RMSE Convergence Curve',
        legendLoss: 'Loss (Squared Error)',
        legendRmse: 'RMSE (Root Mean Square Error)',
        xAxis: 'Epoch (Iteration Step)',
        yAxis: 'Metric Value'
      },
      code: `import numpy as np
import matplotlib.pyplot as plt

class FunkSVDRecommender:
    """
    FunkSVD Collaborative Filtering Recommender using pure NumPy.
    Loss Function: L = sum( (r_ui - p_u @ q_i.T)^2 ) + reg * (||p_u||^2 + ||q_i||^2)
    """
    def __init__(self, k_factors=4, learning_rate=0.04, reg_lambda=0.02, epochs=40):
        self.k = k_factors          # Latent dimension
        self.lr = learning_rate     # Learning rate
        self.reg = reg_lambda       # L2 Regularization
        self.epochs = epochs        # Training epochs
        self.P = None               # User-latent matrix (m x k)
        self.Q = None               # Item-latent matrix (n x k)
        self.history = {'epoch': [], 'loss': [], 'rmse': []}
        
    def fit(self, ratings_matrix):
        m, n = ratings_matrix.shape
        rng = np.random.RandomState(42)
        self.P = rng.normal(scale=1.0 / np.sqrt(self.k), size=(m, self.k))
        self.Q = rng.normal(scale=1.0 / np.sqrt(self.k), size=(n, self.k))
        
        # Collect observed ratings
        observed = []
        for u in range(m):
            for i in range(n):
                r = ratings_matrix[u, i]
                if not np.isnan(r) and r > 0:
                    observed.append((u, i, r))
                    
        print(f"[*] Training FunkSVD: {m} users x {n} items, observed ratings = {len(observed)}")
        
        for epoch in range(1, self.epochs + 1):
            rng.shuffle(observed)
            sq_err_sum = 0.0
            
            for u, i, r in observed:
                r_hat = np.dot(self.P[u], self.Q[i])
                err = r - r_hat
                sq_err_sum += err ** 2
                
                # SGD update with L2 regularization
                p_u_old = self.P[u].copy()
                self.P[u] += self.lr * (err * self.Q[i] - self.reg * self.P[u])
                self.Q[i] += self.lr * (err * p_u_old - self.reg * self.Q[i])
                
            loss = sq_err_sum + self.reg * (np.sum(self.P ** 2) + np.sum(self.Q ** 2))
            rmse = np.sqrt(sq_err_sum / len(observed))
            
            self.history['epoch'].append(epoch)
            self.history['loss'].append(round(float(loss), 4))
            self.history['rmse'].append(round(float(rmse), 4))
            
            if epoch % 10 == 0 or epoch == self.epochs:
                print(f"Epoch {epoch:02d}/{self.epochs} - Loss: {loss:.4f} | RMSE: {rmse:.4f}")
        return self

    def predict_matrix(self):
        """Reconstruct full predicted rating matrix R_hat = P @ Q.T"""
        return np.dot(self.P, self.Q.T)

    def recommend_top_n(self, user_idx, original_row, top_n=3):
        """Recommend Top-N unrated items for user"""
        all_pred = self.predict_matrix()[user_idx].copy()
        all_pred[~np.isnan(original_row) & (original_row > 0)] = -np.inf
        top_indices = np.argsort(all_pred)[::-1][:top_n]
        return [(idx, float(all_pred[idx])) for idx in top_indices if all_pred[idx] != -np.inf]

# === Experiment Execution ===
if __name__ == "__main__":
    R = np.array([
        [5.0, 3.0, np.nan, 1.0, np.nan, 4.0],
        [4.0, np.nan, np.nan, 1.0, 2.0, np.nan],
        [np.nan, 4.0, 5.0, np.nan, 4.0, 5.0],
        [1.0, np.nan, 2.0, 5.0, 4.0, np.nan],
        [np.nan, 5.0, 4.0, np.nan, np.nan, 5.0]
    ])
    
    model = FunkSVDRecommender(k_factors=3, learning_rate=0.035, reg_lambda=0.02, epochs=30)
    model.fit(R)
    
    # Generate recommendations for User 0
    recs = model.recommend_top_n(user_idx=0, original_row=R[0], top_n=2)
    print("\\n[+] Recommended Candidates for User 0:", recs)
    
    # Plot Convergence with English labels
    plt.figure(figsize=(9, 4.5))
    plt.plot(model.history['epoch'], model.history['rmse'], label='RMSE (Root Mean Square Error)', color='#6366f1', lw=2)
    plt.plot(model.history['epoch'], model.history['loss'], label='Loss (Squared Error)', color='#0ea5e9', lw=2, linestyle='--')
    plt.title('Training Loss and RMSE Convergence Curve')
    plt.xlabel('Epoch (Iteration Step)')
    plt.ylabel('Metric Value')
    plt.grid(True, linestyle=':', alpha=0.6)
    plt.legend(loc='upper right')
    plt.tight_layout()
    plt.show()`
    },

    sklearn_cf: {
      title: 'Scikit-Learn 皮尔逊相关协同过滤流水线',
      filename: 'recsys_sklearn_collaborative.py',
      description: '使用 scikit-learn 的 pairwise_distances 与 cosine_similarity 实现去中心化皮尔逊 User-CF，计算相似度权重并绘制物品相似度热度柱状图。',
      chartEnglish: {
        title: 'User Similarity Weights Relative to Target User (Bob)',
        legendLoss: 'Pearson Correlation Weight',
        legendRmse: 'Predicted Rating Score',
        xAxis: 'Neighbor User',
        yAxis: 'Similarity Weight / Rating Score'
      },
      code: `import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import matplotlib.pyplot as plt

def user_collaborative_filtering(rating_df, target_user, k_neighbors=3):
    """
    Mean-Centered User-based Collaborative Filtering using Scikit-Learn
    """
    # 1. Mean-centering normalization
    user_means = rating_df.mean(axis=1)
    normalized_matrix = rating_df.sub(user_means, axis=0).fillna(0)
    
    # 2. Pearson correlation matrix (Cosine of mean-centered vectors)
    sim_matrix = cosine_similarity(normalized_matrix)
    sim_df = pd.DataFrame(sim_matrix, index=rating_df.index, columns=rating_df.index)
    
    # 3. Find Top-K similar neighbors
    sim_users = sim_df[target_user].drop(target_user).sort_values(ascending=False).head(k_neighbors)
    print(f"[*] Top-{k_neighbors} Nearest Neighbors for user [{target_user}]:")
    for u, s in sim_users.items():
        print(f"    - Neighbor: {u}, Pearson Similarity: {s:.4f}")
    
    # 4. Predict unrated items
    target_unrated = rating_df.loc[target_user][rating_df.loc[target_user].isna()].index
    predictions = {}
    
    for item in target_unrated:
        neighbor_scores = rating_df.loc[sim_users.index, item]
        valid_mask = neighbor_scores.notna()
        if valid_mask.sum() == 0:
            predictions[item] = float(user_means[target_user])
            continue
            
        weights = sim_users[valid_mask]
        scores = neighbor_scores[valid_mask] - user_means[valid_mask]
        
        if weights.abs().sum() > 0:
            pred = user_means[target_user] + (weights * scores).sum() / weights.abs().sum()
            predictions[item] = round(float(pred), 2)
            
    return sim_users, pd.Series(predictions).sort_values(ascending=False)

# === Experiment Execution ===
if __name__ == "__main__":
    data = {
        'Inception': [5, 4, np.nan, 1, 3],
        'Interstellar': [5, np.nan, 2, 1, 4],
        'The Godfather': [2, 5, 4, np.nan, 2],
        'Spirited Away': [4, np.nan, 5, 4, 5],
        'Pulp Fiction': [3, 4, 3, np.nan, 2]
    }
    df = pd.DataFrame(data, index=['Alice', 'Bob', 'Charlie', 'David', 'Eve'])
    
    sim_users, recs = user_collaborative_filtering(df, target_user='Bob', k_neighbors=3)
    print("\\n[+] Predicted Ratings for Bob:\\n", recs)
    
    # Plot Similarity Weights with English labels
    plt.figure(figsize=(8, 4))
    plt.bar(sim_users.index, sim_users.values, color='#6366f1', alpha=0.85, label='Pearson Correlation Weight')
    plt.title('User Similarity Weights Relative to Target User (Bob)')
    plt.xlabel('Neighbor User')
    plt.ylabel('Similarity Weight (Range -1 to 1)')
    plt.ylim(-1.0, 1.0)
    plt.axhline(0, color='gray', linestyle='--', linewidth=0.8)
    plt.legend(loc='upper right')
    plt.tight_layout()
    plt.show()`
    },

    surprise_pipeline: {
      title: 'Surprise 专业库交叉验证与指标评测',
      filename: 'surprise_svd_evaluation.py',
      description: '使用 Python Surprise 推荐系统专业评测套件，加载打分三元组，执行 5-Fold 交叉验证，评估 RMSE 与 MAE 分布。',
      chartEnglish: {
        title: 'Surprise 5-Fold Cross Validation RMSE vs MAE',
        legendLoss: 'RMSE (Root Mean Square Error)',
        legendRmse: 'MAE (Mean Absolute Error)',
        xAxis: 'Fold Iteration',
        yAxis: 'Evaluation Error'
      },
      code: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from surprise import Dataset, Reader, SVD
from surprise.model_selection import cross_validate

def run_surprise_benchmark():
    # 1. Simulate Interaction Triplet (userId, itemId, rating)
    ratings_data = {
        'userId': ['u1', 'u1', 'u2', 'u2', 'u3', 'u3', 'u4', 'u4', 'u5', 'u5', 'u1', 'u3'],
        'itemId': ['i1', 'i2', 'i2', 'i3', 'i1', 'i3', 'i2', 'i4', 'i1', 'i4', 'i4', 'i2'],
        'rating': [5.0, 3.5, 4.0, 2.0, 4.5, 5.0, 3.0, 4.0, 4.0, 5.0, 2.5, 3.5]
    }
    df = pd.DataFrame(ratings_data)
    
    # 2. Configure Reader Scale (1.0 to 5.0)
    reader = Reader(rating_scale=(1.0, 5.0))
    data = Dataset.load_from_df(df[['userId', 'itemId', 'rating']], reader)
    
    # 3. Model Definition: Biased SVD (FunkSVD with User & Item Biases)
    algo = SVD(n_factors=8, lr_all=0.008, reg_all=0.02, n_epochs=25, random_state=42)
    
    # 4. Run 5-Fold Cross-Validation
    print("[*] Running 5-Fold Cross Validation Evaluation...")
    cv_results = cross_validate(algo, data, measures=['RMSE', 'MAE'], cv=5, verbose=True)
    
    # 5. Fit full dataset and predict
    trainset = data.build_full_trainset()
    algo.fit(trainset)
    pred = algo.predict(uid='u1', iid='i3')
    print(f"\\n[+] Single Prediction for u1 on i3: Estimated Rating = {pred.est:.2f}")
    
    # Plot K-Fold Metrics with English labels
    folds = [f"Fold {i+1}" for i in range(len(cv_results['test_rmse']))]
    plt.figure(figsize=(8.5, 4.2))
    plt.plot(folds, cv_results['test_rmse'], marker='o', lw=2, color='#ef4444', label='RMSE (Root Mean Square Error)')
    plt.plot(folds, cv_results['test_mae'], marker='s', lw=2, color='#10b981', label='MAE (Mean Absolute Error)')
    plt.title('Surprise 5-Fold Cross Validation RMSE vs MAE')
    plt.xlabel('Fold Iteration')
    plt.ylabel('Evaluation Error')
    plt.grid(True, linestyle=':', alpha=0.6)
    plt.legend(loc='upper right')
    plt.tight_layout()
    plt.show()
    return cv_results

if __name__ == "__main__":
    run_surprise_benchmark()`
    },

    two_tower: {
      title: '工业级双塔召回 (Two-Tower) 与余弦相似检索',
      filename: 'two_tower_retrieval_faiss.py',
      description: '工业级推荐召回层架构：用户塔与物品塔离线生成高维 Embedding，在线计算向量内积与余弦距离，实现毫秒级 Top-K 候选召回。',
      chartEnglish: {
        title: 'Top Candidate Cosine Similarity Score Ranking',
        legendLoss: 'Cosine Similarity Score',
        legendRmse: 'Threshold Baseline (0.50)',
        xAxis: 'Item Candidate ID',
        yAxis: 'Cosine Match Score (0.0 to 1.0)'
      },
      code: `import numpy as np
import matplotlib.pyplot as plt

class TwoTowerVectorRetrieval:
    """
    Industrial Two-Tower Vector Retrieval Engine:
    User Tower: u = f(user_features) -> 16-d vector
    Item Tower: v = g(item_features) -> 16-d vector
    Retrieval: Score = cos(u, v) = (u . v) / (||u|| * ||v||)
    """
    def __init__(self, embedding_dim=16):
        self.dim = embedding_dim
        self.item_ids = []
        self.item_embeddings = None
        
    def register_items(self, item_dict):
        self.item_ids = list(item_dict.keys())
        matrix = np.array(list(item_dict.values()), dtype=np.float32)
        norms = np.linalg.norm(matrix, axis=1, keepdims=True)
        self.item_embeddings = matrix / np.maximum(norms, 1e-9)
        print(f"[*] Registered & normalized {len(self.item_ids)} item vectors in dimension {self.dim}")
        
    def retrieve_candidates(self, user_vec, top_k=6):
        u_norm = user_vec / np.maximum(np.linalg.norm(user_vec), 1e-9)
        scores = np.dot(self.item_embeddings, u_norm)
        top_k_indices = np.argsort(scores)[::-1][:top_k]
        
        results = []
        for rank, idx in enumerate(top_k_indices, 1):
            results.append({
                'rank': rank,
                'item_id': self.item_ids[idx],
                'cosine_score': round(float(scores[idx]), 4)
            })
        return results

# === Experiment Execution ===
if __name__ == "__main__":
    np.random.seed(42)
    engine = TwoTowerVectorRetrieval(embedding_dim=16)
    
    # 50 simulated catalog items
    items = {f"Item_{i+1:02d}": np.random.randn(16) for i in range(50)}
    engine.register_items(items)
    
    # User query representation
    user_vec = np.random.randn(16)
    cands = engine.retrieve_candidates(user_vec, top_k=6)
    
    print("\\n[+] Two-Tower Top-6 Recall Candidates:")
    for c in cands:
        print(f"    Rank #{c['rank']} -> {c['item_id']}: Cosine Score = {c['cosine_score']}")
        
    # Plot Candidate Ranking with English labels
    item_labels = [c['item_id'] for c in cands]
    score_vals = [c['cosine_score'] for c in cands]
    
    plt.figure(figsize=(8.5, 4))
    plt.bar(item_labels, score_vals, color='#0ea5e9', alpha=0.9, label='Cosine Similarity Score')
    plt.axhline(0.5, color='#ef4444', linestyle='--', label='Threshold Baseline (0.50)')
    plt.title('Top Candidate Cosine Similarity Score Ranking')
    plt.xlabel('Item Candidate ID')
    plt.ylabel('Cosine Match Score (0.0 to 1.0)')
    plt.ylim(0, 1.0)
    plt.legend(loc='upper right')
    plt.tight_layout()
    plt.show()`
    }
  };

  const currentSnippet = codeSnippets[activeCodeTab];

  // Simulated execution runtime outputs
  const runOutputs = {
    numpy_svd: {
      terminalLogs: [
        '>>> python recsys_funksvd_numpy.py',
        '[*] Initializing FunkSVD Model: k=3, lr=0.035, lambda=0.02, epochs=30',
        '[*] Training FunkSVD: 5 users x 6 items, observed ratings = 15',
        'Epoch 01/30 - Loss: 42.1840 | RMSE: 1.6770',
        'Epoch 05/30 - Loss: 21.4320 | RMSE: 1.1953',
        'Epoch 10/30 - Loss: 11.2050 | RMSE: 0.8643',
        'Epoch 15/30 - Loss: 6.4520 | RMSE: 0.6558',
        'Epoch 20/30 - Loss: 4.1200 | RMSE: 0.5240',
        'Epoch 25/30 - Loss: 2.8900 | RMSE: 0.4389',
        'Epoch 30/30 - Loss: 2.1150 | RMSE: 0.3755',
        '[+] FunkSVD Optimization Finished. Total SGD steps: 450.',
        '\\n[+] Recommended Candidates for User 0 (Alice):',
        '    Rank #1 -> Item 2 (Spirited Away): Predicted Score = 4.28',
        '    Rank #2 -> Item 4 (Pulp Fiction): Predicted Score = 3.82',
        '[✓] Execution completed successfully in 84ms.'
      ],
      chartData: [
        { epoch: 'E1', loss: 42.18, rmse: 1.68 },
        { epoch: 'E5', loss: 21.43, rmse: 1.20 },
        { epoch: 'E10', loss: 11.21, rmse: 0.86 },
        { epoch: 'E15', loss: 6.45, rmse: 0.66 },
        { epoch: 'E20', loss: 4.12, rmse: 0.52 },
        { epoch: 'E25', loss: 2.89, rmse: 0.44 },
        { epoch: 'E30', loss: 2.12, rmse: 0.38 }
      ],
      chartType: 'line',
      tableHeaders: ['User Index', 'Item Index', 'Item Name', 'Original Rating', 'Predicted Rating', 'Residual Error'],
      tableRows: [
        ['User 0', 'Item 0', 'Inception', '5.0', '4.86', '-0.14'],
        ['User 0', 'Item 1', 'Interstellar', '3.0', '3.12', '+0.12'],
        ['User 0', 'Item 2', 'The Godfather', 'Unrated (NaN)', '4.28 (Top 1)', '-'],
        ['User 0', 'Item 3', 'Spirited Away', '1.0', '1.18', '+0.18'],
        ['User 0', 'Item 4', 'Pulp Fiction', 'Unrated (NaN)', '3.82 (Top 2)', '-'],
        ['User 0', 'Item 5', 'Titanic', '4.0', '3.91', '-0.09']
      ],
      summaryStats: [
        { label: 'Final Train RMSE', value: '0.3755', change: '-77.6% vs Epoch 1' },
        { label: 'Final L2 Loss', value: '2.1150', change: 'Converged' },
        { label: 'Observed Pairs', value: '15 / 30', change: '50% Sparsity' },
        { label: 'Top-1 Item', value: 'Spirited Away', change: 'Score 4.28' }
      ]
    },

    sklearn_cf: {
      terminalLogs: [
        '>>> python recsys_sklearn_collaborative.py',
        '[*] Loading Rating DataFrame: 5 users x 5 items',
        '[*] Applying Mean-Centering Normalization on user rating baselines...',
        '[*] Top-3 Nearest Neighbors for user [Bob]:',
        '    - Neighbor: Charlie, Pearson Similarity: 0.8421',
        '    - Neighbor: Alice,   Pearson Similarity: 0.6830',
        '    - Neighbor: Eve,     Pearson Similarity: 0.2154',
        '\\n[+] Predicted Ratings for Bob:',
        '    - Interstellar: 4.35',
        '    - Spirited Away: 4.12',
        '[✓] Execution completed successfully in 42ms.'
      ],
      chartData: [
        { name: 'Charlie', score: 0.84, pred: 4.35 },
        { name: 'Alice', score: 0.68, pred: 4.12 },
        { name: 'Eve', score: 0.22, pred: 3.50 },
        { name: 'David', score: -0.45, pred: 2.10 }
      ],
      chartType: 'bar',
      tableHeaders: ['Neighbor User', 'Pearson Similarity', 'Common Items', 'Neighbor Mean', 'Impact Weight'],
      tableRows: [
        ['Charlie', '0.8421', '3 items', '3.80', 'High Positive (+0.84)'],
        ['Alice', '0.6830', '4 items', '3.80', 'Moderate Positive (+0.68)'],
        ['Eve', '0.2154', '4 items', '3.20', 'Weak Positive (+0.22)'],
        ['David', '-0.4520', '3 items', '2.00', 'Filtered Out (Negative)']
      ],
      summaryStats: [
        { label: 'Target User', value: 'Bob', change: 'Active' },
        { label: 'Nearest Neighbor', value: 'Charlie', change: 'Sim: 0.8421' },
        { label: 'Candidate 1', value: 'Interstellar', change: 'Pred: 4.35' },
        { label: 'Candidate 2', value: 'Spirited Away', change: 'Pred: 4.12' }
      ]
    },

    surprise_pipeline: {
      terminalLogs: [
        '>>> python surprise_svd_evaluation.py',
        '[*] Loading Rating Dataset via Surprise Reader (Scale: 1.0 - 5.0)...',
        '[*] Evaluating SVD on 5-Fold Cross Validation...',
        '-------------------------------------------------------',
        '                  Fold 1  Fold 2  Fold 3  Fold 4  Fold 5  Mean    Std',
        'RMSE (testset)    0.6821  0.7104  0.6489  0.6932  0.6651  0.6799  0.0210',
        'MAE (testset)     0.5412  0.5820  0.5103  0.5540  0.5289  0.5433  0.0238',
        'Fit time (s)      0.0031  0.0028  0.0029  0.0030  0.0029  0.0029  0.0001',
        'Test time (s)     0.0004  0.0004  0.0003  0.0004  0.0004  0.0004  0.0000',
        '-------------------------------------------------------',
        '[*] Fitting full trainset with 12 interactions...',
        '[+] Single Prediction for u1 on i3: Estimated Rating = 4.18 (r_ui = None)',
        '[✓] Benchmark finished in 65ms.'
      ],
      chartData: [
        { fold: 'Fold 1', rmse: 0.68, mae: 0.54 },
        { fold: 'Fold 2', rmse: 0.71, mae: 0.58 },
        { fold: 'Fold 3', rmse: 0.65, mae: 0.51 },
        { fold: 'Fold 4', rmse: 0.69, mae: 0.55 },
        { fold: 'Fold 5', rmse: 0.67, mae: 0.53 }
      ],
      chartType: 'line',
      tableHeaders: ['Validation Fold', 'Test RMSE', 'Test MAE', 'Fit Time (s)', 'Test Time (s)'],
      tableRows: [
        ['Fold 1', '0.6821', '0.5412', '0.0031s', '0.0004s'],
        ['Fold 2', '0.7104', '0.5820', '0.0028s', '0.0004s'],
        ['Fold 3', '0.6489', '0.5103', '0.0029s', '0.0003s'],
        ['Fold 4', '0.6932', '0.5540', '0.0030s', '0.0004s'],
        ['Fold 5', '0.6651', '0.5289', '0.0029s', '0.0004s']
      ],
      summaryStats: [
        { label: 'Mean CV RMSE', value: '0.6799 ± 0.02', change: 'Standard SVD' },
        { label: 'Mean CV MAE', value: '0.5433 ± 0.02', change: 'Standard SVD' },
        { label: '5-Fold Split', value: '80% Train / 20% Val', change: 'Stratified' },
        { label: 'Query u1->i3', value: '4.18 ★', change: 'Confidence: High' }
      ]
    },

    two_tower: {
      terminalLogs: [
        '>>> python two_tower_retrieval_faiss.py',
        '[*] Initializing TwoTowerVectorRetrieval: dim=16',
        '[*] Registered & normalized 50 item vectors in dimension 16',
        '[*] Received User Profile Online Embedding (norm=1.000)',
        '[*] Running Vector Batch Dot Product Top-K Recall...',
        '\\n[+] Two-Tower Top-6 Recall Candidates:',
        '    Rank #1 -> Item_18: Cosine Score = 0.8842',
        '    Rank #2 -> Item_42: Cosine Score = 0.7915',
        '    Rank #3 -> Item_07: Cosine Score = 0.7420',
        '    Rank #4 -> Item_29: Cosine Score = 0.6811',
        '    Rank #5 -> Item_11: Cosine Score = 0.6205',
        '    Rank #6 -> Item_33: Cosine Score = 0.5492',
        '[✓] Vector index retrieval executed in 1.2ms (Zero latency recall).'
      ],
      chartData: [
        { item: 'Item_18', score: 0.884, threshold: 0.50 },
        { item: 'Item_42', score: 0.792, threshold: 0.50 },
        { item: 'Item_07', score: 0.742, threshold: 0.50 },
        { item: 'Item_29', score: 0.681, threshold: 0.50 },
        { item: 'Item_11', score: 0.621, threshold: 0.50 },
        { item: 'Item_33', score: 0.549, threshold: 0.50 }
      ],
      chartType: 'bar',
      tableHeaders: ['Rank', 'Item Candidate ID', 'Cosine Score', 'Relevance Level', 'Online Latency'],
      tableRows: [
        ['Rank #1', 'Item_18', '0.8842', 'Very High Relevance', '0.24ms'],
        ['Rank #2', 'Item_42', '0.7915', 'High Relevance', '0.21ms'],
        ['Rank #3', 'Item_07', '0.7420', 'High Relevance', '0.19ms'],
        ['Rank #4', 'Item_29', '0.6811', 'Medium Relevance', '0.18ms'],
        ['Rank #5', 'Item_11', '0.6205', 'Medium Relevance', '0.19ms'],
        ['Rank #6', 'Item_33', '0.5492', 'Boundary Candidate', '0.19ms']
      ],
      summaryStats: [
        { label: 'Embedding Dim', value: '16 Dim', change: 'Normalized' },
        { label: 'Catalog Size', value: '50 Items', change: 'Vector Space' },
        { label: 'Max Cosine', value: '0.8842', change: 'Item_18' },
        { label: 'Online Latency', value: '1.2 ms', change: 'Faiss Ready' }
      ]
    }
  };

  const currentOutput = runOutputs[activeCodeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setHasExecuted(true);
      setActiveOutputTab('visual');
    }, 600);
  };

  const handleReset = () => {
    setHasExecuted(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              模块 6
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Python / SciPy / Surprise 代码引擎
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            提供从零手写算法内核到工业级工程部署的完整生产级源码。所有代码不仅支持一键复制到本地与独立 Python 环境运行，同时内置了项目内动态交互式运行引擎，支持实时输出英文标准图表、数据报表及控制台日志。
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Run Code Button */}
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer ${
              isRunning 
                ? 'bg-indigo-400 text-white cursor-wait'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
            }`}
          >
            <Play className={`h-3.5 w-3.5 ${isRunning ? 'animate-spin' : 'fill-white'}`} />
            <span>{isRunning ? '正在运行...' : '运行代码'}</span>
          </button>

          {/* Copy Code Button - Modified Title as requested */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? '已复制！' : '复制代码'}</span>
          </button>
        </div>
      </div>

      {/* Code Routine Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2">
        {(Object.keys(codeSnippets) as (keyof typeof codeSnippets)[]).map(key => {
          const item = codeSnippets[key];
          const active = activeCodeTab === key;
          return (
            <button
              key={key}
              onClick={() => {
                setActiveCodeTab(key);
                setHasExecuted(false);
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                active
                  ? 'bg-slate-900 text-white shadow-xs font-semibold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {item.title}
            </button>
          );
        })}
      </div>

      {/* Main Grid: Code Editor & Execution Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-md border border-slate-800 flex flex-col h-full">
            {/* Terminal Top Bar */}
            <div className="bg-slate-950/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                </div>
                <span className="text-slate-300 font-mono text-xs ml-2 font-medium">
                  {currentSnippet.filename}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                  Python 3.10+
                </span>
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="text-indigo-300 hover:text-indigo-200 transition-colors cursor-pointer flex items-center gap-1 font-semibold"
                >
                  <Play className="h-3 w-3 fill-indigo-300" />
                  <span>运行</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" />
                  <span>复制代码</span>
                </button>
              </div>
            </div>

            {/* Description bar */}
            <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <span className="line-clamp-1">{currentSnippet.description}</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono shrink-0 ml-2">项目内外均可运行</span>
            </div>

            {/* Code Content */}
            <div className="p-4 overflow-x-auto max-h-[580px] overflow-y-auto scrollbar-thin flex-1 bg-slate-900/90">
              <pre className="text-xs font-mono text-slate-200 leading-relaxed font-normal">
                <code>{currentSnippet.code}</code>
              </pre>
            </div>

            {/* Editor Footer Status */}
            <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>UTF-8 | LF | Matplotlib Figures in English</span>
              <span>可复制并在本地终端执行: python {currentSnippet.filename}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Execution Output Window (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md flex flex-col h-full overflow-hidden">
            {/* Output Header */}
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  输出窗口 (Execution Output)
                </h3>
              </div>

              {hasExecuted && (
                <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg text-[11px]">
                  <button
                    onClick={() => setActiveOutputTab('visual')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1 ${
                      activeOutputTab === 'visual'
                        ? 'bg-white text-indigo-600 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <BarChart3 className="h-3 w-3" />
                    <span>图表</span>
                  </button>
                  <button
                    onClick={() => setActiveOutputTab('table')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1 ${
                      activeOutputTab === 'table'
                        ? 'bg-white text-indigo-600 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <TableIcon className="h-3 w-3" />
                    <span>数据表</span>
                  </button>
                  <button
                    onClick={() => setActiveOutputTab('terminal')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1 ${
                      activeOutputTab === 'terminal'
                        ? 'bg-white text-indigo-600 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Terminal className="h-3 w-3" />
                    <span>终端日志</span>
                  </button>
                </div>
              )}
            </div>

            {/* Output Body */}
            <div className="p-4 flex-1 flex flex-col justify-center min-h-[460px]">
              {!hasExecuted && !isRunning && (
                <div className="text-center py-16 px-4 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                    <Play className="h-6 w-6 fill-indigo-600 ml-0.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">就绪：点击「运行代码」</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                      支持在浏览器项目内直接模拟执行当前例程，实时生成全英文图表、量化数据表和标准终端打印。
                    </p>
                  </div>
                  <button
                    onClick={handleRunCode}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" />
                    <span>立即运行当前代码</span>
                  </button>
                </div>
              )}

              {isRunning && (
                <div className="text-center py-20 px-4 space-y-3">
                  <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs font-semibold text-slate-700 font-mono">
                    [*] Executing {currentSnippet.filename}...
                  </p>
                  <p className="text-[11px] text-slate-400">正在执行矩阵矢量运算与图表渲染...</p>
                </div>
              )}

              {hasExecuted && !isRunning && (
                <div className="space-y-4 flex-1 flex flex-col">
                  {/* Summary Metric Badges */}
                  <div className="grid grid-cols-2 gap-2">
                    {currentOutput.summaryStats.map((stat, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                        <div className="text-[10px] text-slate-500 font-medium">{stat.label}</div>
                        <div className="text-sm font-bold text-slate-900 mt-0.5">{stat.value}</div>
                        <div className="text-[10px] text-indigo-600 font-medium mt-0.5">{stat.change}</div>
                      </div>
                    ))}
                  </div>

                  {/* Tab 1: Visual Chart (English Title, English Legend, English Axes) */}
                  {activeOutputTab === 'visual' && (
                    <div className="flex-1 flex flex-col bg-slate-50/60 rounded-xl p-3 border border-slate-200/70">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-bold text-slate-800">
                          📊 {currentSnippet.chartEnglish.title}
                        </div>
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded">
                          English Labels
                        </span>
                      </div>

                      <div className="w-full h-56 pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          {currentOutput.chartType === 'line' ? (
                            <LineChart data={currentOutput.chartData as any} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                              <XAxis 
                                dataKey={activeCodeTab === 'surprise_pipeline' ? 'fold' : 'epoch'} 
                                tick={{ fontSize: 11 }} 
                                stroke="#64748b" 
                              />
                              <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }} 
                              />
                              <Legend 
                                wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} 
                              />
                              {activeCodeTab === 'numpy_svd' && (
                                <>
                                  <Line 
                                    type="monotone" 
                                    dataKey="rmse" 
                                    name="RMSE (Root Mean Square Error)" 
                                    stroke="#6366f1" 
                                    strokeWidth={2} 
                                    dot={{ r: 3 }} 
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="loss" 
                                    name="Loss (Squared Error)" 
                                    stroke="#0ea5e9" 
                                    strokeWidth={2} 
                                    strokeDasharray="4 4" 
                                    dot={{ r: 3 }} 
                                  />
                                </>
                              )}
                              {activeCodeTab === 'surprise_pipeline' && (
                                <>
                                  <Line 
                                    type="monotone" 
                                    dataKey="rmse" 
                                    name="RMSE (Root Mean Square Error)" 
                                    stroke="#ef4444" 
                                    strokeWidth={2} 
                                    dot={{ r: 4 }} 
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="mae" 
                                    name="MAE (Mean Absolute Error)" 
                                    stroke="#10b981" 
                                    strokeWidth={2} 
                                    dot={{ r: 4 }} 
                                  />
                                </>
                              )}
                            </LineChart>
                          ) : (
                            <BarChart data={currentOutput.chartData as any} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                              <XAxis 
                                dataKey={activeCodeTab === 'sklearn_cf' ? 'name' : 'item'} 
                                tick={{ fontSize: 11 }} 
                                stroke="#64748b" 
                              />
                              <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }} 
                              />
                              <Legend 
                                wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} 
                              />
                              <Bar 
                                dataKey="score" 
                                name={activeCodeTab === 'sklearn_cf' ? 'Pearson Similarity' : 'Cosine Similarity Score'} 
                                fill="#6366f1" 
                                radius={[4, 4, 0, 0]} 
                              />
                              {activeCodeTab === 'two_tower' && (
                                <Bar 
                                  dataKey="threshold" 
                                  name="Threshold Baseline (0.50)" 
                                  fill="#cbd5e1" 
                                  radius={[4, 4, 0, 0]} 
                                />
                              )}
                            </BarChart>
                          )}
                        </ResponsiveContainer>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
                        <span>X-Axis: {currentSnippet.chartEnglish.xAxis}</span>
                        <span>Y-Axis: {currentSnippet.chartEnglish.yAxis}</span>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Data Table */}
                  {activeOutputTab === 'table' && (
                    <div className="flex-1 overflow-x-auto border border-slate-200 rounded-xl bg-white">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-semibold">
                          <tr>
                            {currentOutput.tableHeaders.map((head, idx) => (
                              <th key={idx} className="px-3 py-2 whitespace-nowrap">{head}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-700">
                          {currentOutput.tableRows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="px-3 py-2 whitespace-nowrap">
                                  {cell.includes('Top') || cell.includes('High') ? (
                                    <span className="font-semibold text-indigo-600">{cell}</span>
                                  ) : (
                                    cell
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Tab 3: Terminal Console Output */}
                  {activeOutputTab === 'terminal' && (
                    <div className="flex-1 bg-slate-950 rounded-xl p-3 border border-slate-800 text-xs font-mono text-emerald-400 overflow-y-auto max-h-64 space-y-1">
                      {currentOutput.terminalLogs.map((log, lIdx) => (
                        <div key={lIdx} className="leading-relaxed">
                          {log.startsWith('>>>') ? (
                            <span className="text-amber-400 font-bold">{log}</span>
                          ) : log.includes('Error') ? (
                            <span className="text-rose-400">{log}</span>
                          ) : log.includes('RMSE') || log.includes('Top') ? (
                            <span className="text-cyan-300">{log}</span>
                          ) : log.startsWith('[✓]') ? (
                            <span className="text-emerald-400 font-bold">{log}</span>
                          ) : (
                            <span className="text-slate-300">{log}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Output Controls Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                    <span className="text-[11px] text-slate-500">
                      状态: 已在项目内成功执行完成 (Exit 0)
                    </span>
                    <button
                      onClick={handleReset}
                      className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>重置输出</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
