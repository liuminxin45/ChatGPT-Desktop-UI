import {
  forwardRef,
  createContext,
  useContext,
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import {
  House,
  Compass,
  PlusCircle,
  ImageSquare,
  Article,
  NotePencil,
  Books,
  SlidersHorizontal,
  UserFocus,
  CheckSquare,
  ClockCounterClockwise,
  PaperPlaneTilt,
  ArrowRight,
  ArrowLeft,
  Palette,
  LockSimple,
  Quotes,
  Stack,
  Check,
  X,
  DotsThree,
  BookmarkSimple,
} from '@phosphor-icons/react';
import { AppProfileContext } from '../../scoped-surface';
import { useDesktopThemeContext } from '../../theme-context';
import { classes } from '../classes';
import { ControlButton } from '../actions/control-button';

const AppAppearanceContext = createContext<'editorial' | 'workspace'>('editorial');

export interface AppSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  /** Editorial keeps the existing warm app. Workspace is a compact jade productivity profile. */
  profile?: 'editorial' | 'workspace';
}

/** Opt-in touch-first profile. Host retains navigation, content and persistence. */
export const AppSurface = forwardRef<HTMLDivElement, AppSurfaceProps>(function AppSurface(
  { className, children, profile = 'editorial', ...props },
  ref,
) {
  const { theme } = useDesktopThemeContext();
  const [systemDark, setSystemDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystemDark(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return (
    <AppProfileContext.Provider value={true}>
      <AppAppearanceContext.Provider value={profile}>
        <div
          {...props}
          ref={ref}
          className={classes('desktop-app', className)}
          data-app-profile={profile}
          data-theme={theme === 'system' ? (systemDark ? 'dark' : 'light') : theme}
        >
          {children}
        </div>
      </AppAppearanceContext.Provider>
    </AppProfileContext.Provider>
  );
});

const appIcons = {
  home: House,
  discover: Compass,
  create: PlusCircle,
  poster: ImageSquare,
  article: Article,
  capture: NotePencil,
  library: Books,
  tune: SlidersHorizontal,
  reader: UserFocus,
  review: CheckSquare,
  history: ClockCounterClockwise,
  send: PaperPlaneTilt,
  arrow: ArrowRight,
  back: ArrowLeft,
  style: Palette,
  lock: LockSimple,
  annotation: Quotes,
  layers: Stack,
  check: Check,
  close: X,
  more: DotsThree,
  bookmark: BookmarkSimple,
};

export interface AppIconProps {
  name: keyof typeof appIcons;
  selected?: boolean;
  size?: number | string;
  className?: string;
  'aria-label'?: string;
}

/** Semantic app glyphs. Decorative by default; label an independent icon action. */
export function AppIcon({ name, selected = false, size = 22, ...props }: AppIconProps) {
  const Glyph = appIcons[name];
  const profile = useContext(AppAppearanceContext);
  return (
    <Glyph
      size={size}
      weight={selected ? 'fill' : profile === 'workspace' ? 'regular' : 'bold'}
      aria-hidden={props['aria-label'] ? undefined : true}
      role={props['aria-label'] ? 'img' : undefined}
      {...props}
    />
  );
}

export interface AppHeadingProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  size?: 'hero' | 'section';
  as?: 'h1' | 'h2' | 'h3';
}

/** App editorial hierarchy without product-specific words or layout ownership. */
export function AppHeading({
  eyebrow,
  title,
  description,
  size = 'section',
  as: Heading = size === 'hero' ? 'h1' : 'h2',
  className,
  ...props
}: AppHeadingProps) {
  return (
    <div {...props} className={classes('desktop-app-heading', className)} data-size={size}>
      {eyebrow ? <p className="desktop-app-heading__eyebrow">{eyebrow}</p> : null}
      <Heading className="desktop-app-heading__title">{title}</Heading>
      {description ? <p className="desktop-app-heading__description">{description}</p> : null}
    </div>
  );
}

/** Shared readable boundary for task actions; the host owns sticky/fixed placement. */
export const AppActionBar = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function AppActionBar(
  { className, role = 'group', ...props },
  ref,
) {
  return <div {...props} ref={ref} role={role} className={classes('desktop-app-action-bar', className)} />;
});

export interface AppTileProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'title'> {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
  selected?: boolean;
  tone?: 'neutral' | 'accent';
  layout?: 'row' | 'tile';
  actionId?: string;
}

/** One named navigation/selection target; never place independent controls inside. */
export const AppTile = forwardRef<HTMLButtonElement, AppTileProps>(function AppTile(
  {
    icon,
    title,
    description,
    trailing = <AppIcon name="arrow" size={18} />,
    selected,
    tone = 'neutral',
    layout = 'row',
    className,
    ...props
  },
  ref,
) {
  return (
    <ControlButton
      {...props}
      ref={ref}
      directTooltip
      className={classes('desktop-app-tile', className)}
      data-tone={tone}
      data-layout={layout}
      aria-pressed={selected}
    >
      {icon ? <span className="desktop-app-tile__icon">{icon}</span> : null}
      <span className="desktop-app-tile__copy">
        <span className="desktop-app-tile__title">{title}</span>
        {description ? <span className="desktop-app-tile__description">{description}</span> : null}
      </span>
      {trailing ? <span className="desktop-app-tile__trailing">{trailing}</span> : null}
    </ControlButton>
  );
});
