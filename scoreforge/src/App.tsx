/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useAppStore } from './store';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Editor } from './components/editor/Editor';
import { CommunityFeed } from './components/community/CommunityFeed';
import { LibraryView } from './components/library/LibraryView';
import { SettingsView } from './components/settings/SettingsView';

const MainLayout: React.FC = () => {
  const { viewMode } = useAppStore();

  return (
    <div className="flex h-screen w-full bg-[#0A0B10] text-[#E0E0E0] overflow-hidden font-sans selection:bg-cyan-500/30">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        {viewMode === 'editor' && <Editor />}
        {viewMode === 'community' && <CommunityFeed />}
        {viewMode === 'library' && <LibraryView />}
        {viewMode === 'settings' && <SettingsView />}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

