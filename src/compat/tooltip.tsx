import type { ReactElement } from 'react';
import * as Primitive from '@radix-ui/react-tooltip';

export function Tooltip({ label, children }: { label: string; children: ReactElement }) {
  return <Primitive.Provider delayDuration={400} skipDelayDuration={150}><Primitive.Root><Primitive.Trigger asChild>{children}</Primitive.Trigger><Primitive.Portal><Primitive.Content side="right" sideOffset={4} collisionPadding={8} className="phd-tooltip">{label}</Primitive.Content></Primitive.Portal></Primitive.Root></Primitive.Provider>;
}
