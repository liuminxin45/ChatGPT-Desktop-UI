import type { ComposerActionButtonProps } from '../src';

// This file is checked by typecheck. Removing the Omit must fail compilation.
type AssertFalse<T extends false> = T;
export type ComposerHasNoLayout = AssertFalse<
  'layout' extends keyof ComposerActionButtonProps ? true : false
>;
