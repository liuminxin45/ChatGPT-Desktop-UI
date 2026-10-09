import { createContext } from 'react';

/** The Host owns Surface lifetime; shared portals only follow its visibility. */
export const ToolVisibilityContext = createContext(true);
