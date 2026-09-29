import React, { useState, useMemo } from 'react';
import { DATASET_PRESETS } from './data/datasets';
import { Header } from './components/Header';
import { NavigationTabs, TabId } from './components/NavigationTabs';
import { AlgebraMatrixModule } from './components/modules/AlgebraMatrixModule';
import { UserCF3DModule } from './components/modules/UserCF3DModule';
import { ItemCFSliceModule } from './components/modules/ItemCFSliceModule';
import { SVDLatentModule } from './components/modules/SVDLatentModule';
import { CasesLibraryModule } from './components/modules/CasesLibraryModule';
import { CodeEngineModule } from './components/modules/CodeEngineModule';
import { FullPipelineModule } from './components/modules/FullPipelineModule';
import { DataReportModule } from './components/modules/DataReportModule';
import { KnowledgeGuideModule } from './components/modules/KnowledgeGuideModule';
import { AIChatConsoleModule } from './components/modules/AIChatConsoleModule';
import { AIDiagnosisModal } from './components/modules/AIDiagnosisModal';
import { Bot, Sparkles, BookOpen, Layers } from 'lucide-react';

export default function App() {
  const [currentDatasetKey, setCurrentDatasetKey] = useState<string>('netflix');
  const [activeTab, setActiveTab] = useState<TabId>('pipeline');
  const [isAIDiagnosisOpen, setIsAIDiagnosisOpen] = useState<boolean>(false);

  const currentDataset = DATASET_PRESETS[currentDatasetKey] || DATASET_PRESETS['netflix'];
  const users = currentDataset.users;
  const items = currentDataset.items;

  // Calculate current sparsity
  const sparsityPercent = useMemo(() => {
    let ratedCount = 0;
    users.forEach(u => {
      items.forEach(i => {
        if (u.ratings[i.id] !== null && u.ratings[i.id] !== undefined) {
          ratedCount++;
        }
      });
    });
    const total = users.length * items.length;
    if (total === 0) return 0;
    return Number(((1 - ratedCount / total) * 100).toFixed(1));
  }, [users, items]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* 1. Global Header */}
      <Header
        currentDataset={currentDataset}
        onSelectDataset={setCurrentDatasetKey}
        sparsityPercent={sparsityPercent}
        activeUsersCount={users.length}
        activeItemsCount={items.length}
        onOpenAIDiagnosis={() => setIsAIDiagnosisOpen(true)}
        onOpenKnowledge={() => setActiveTab('knowledge')}
      />

      {/* 2. 10 Core Modules Navigation Bar */}
      <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 3. Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'algebra' && (
          <AlgebraMatrixModule users={users} items={items} />
        )}

        {activeTab === 'user_cf' && (
          <UserCF3DModule users={users} items={items} />
        )}

        {activeTab === 'item_cf' && (
          <ItemCFSliceModule users={users} items={items} />
        )}

        {activeTab === 'svd' && (
          <SVDLatentModule users={users} items={items} />
        )}

        {activeTab === 'cases' && (
          <CasesLibraryModule
            currentDataset={currentDataset}
            onSelectDataset={setCurrentDatasetKey}
          />
        )}

        {activeTab === 'code' && (
          <CodeEngineModule />
        )}

        {activeTab === 'ai_chat' && (
          <AIChatConsoleModule
            users={users}
            items={items}
            sparsityPercent={sparsityPercent}
          />
        )}

        {activeTab === 'pipeline' && (
          <FullPipelineModule users={users} items={items} />
        )}

        {activeTab === 'reports' && (
          <DataReportModule
            currentDataset={currentDataset}
            users={users}
            items={items}
            sparsityPercent={sparsityPercent}
          />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeGuideModule />
        )}
      </main>

      {/* Floating AI Consultant Quick Trigger (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsAIDiagnosisOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 hover:bg-indigo-700 text-white rounded-full shadow-lg border border-slate-700 hover:border-indigo-500 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white">
            <Bot className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-medium tracking-tight">AI 随诊与答疑</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </button>
      </div>

      {/* AI Diagnosis Floating Modal */}
      <AIDiagnosisModal
        isOpen={isAIDiagnosisOpen}
        onClose={() => setIsAIDiagnosisOpen(false)}
        users={users}
        items={items}
        sparsityPercent={sparsityPercent}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
              R
            </div>
            <span className="font-semibold text-slate-800">
              内容个性化协同过滤推荐实验室 (Recommendation System Lab)
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>学术引用: Koren (2009) Matrix Factorization Techniques for RecSys</span>
            <span>•</span>
            <span>Sarwar (2001) Item-Based Collaborative Filtering</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
