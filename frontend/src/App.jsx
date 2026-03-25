import { useState } from 'react';
import Layout from './components/Layout';
import ExtensionsView from './components/ExtensionsView';
import EditorView from './components/EditorView';
import TerminalView from './components/TerminalView';
import Chat from './Chat';

function App() {
  const [activeTab, setActiveTab] = useState('editor');

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'extensions' && <ExtensionsView />}
      {activeTab === 'editor' && <EditorView />}
      {activeTab === 'terminal' && <TerminalView />}
      {activeTab === 'ai-chat' && <Chat />}
    </Layout>
  );
}

export default App;
