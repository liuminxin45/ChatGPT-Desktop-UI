import { createRoot } from 'react-dom/client';
import { DesktopRoot } from '../../src';
import { ClientDemo } from './ClientDemo';
import '../../src/styles.css';
import './demo.css';
import './usage.css';
createRoot(document.getElementById('root')!).render(<DesktopRoot storageKey="desktop-kit.demo.theme"><ClientDemo/></DesktopRoot>);
