import { createRoot } from 'react-dom/client';
import { AIResponseProvider, DesktopRoot } from '../../src';
import { AIOutputDemo } from './AIOutputDemo';
import { ClientDemo } from './ClientDemo';
import '../../src/styles.css';
import './demo.css';
import './usage.css';
createRoot(document.getElementById('root')!).render(<DesktopRoot storageKey="desktop-kit.demo.theme"><AIResponseProvider>{new URLSearchParams(location.search).has('ai-demo') ? <AIOutputDemo /> : <ClientDemo/>}</AIResponseProvider></DesktopRoot>);
