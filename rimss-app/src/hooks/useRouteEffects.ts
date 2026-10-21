import { useEffect, useRef, type RefObject } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import { trackEvent } from '../services/telemetry';
import type { ModulePlugin } from '../plugins/PluginRegistry';

/** Per-navigation side effects: page_view telemetry, document title, and focus on the content. */
export function useRouteEffects(
  modules: readonly Pick<ModulePlugin, 'route' | 'navLabel'>[],
  mainRef: RefObject<HTMLElement | null>,
) {
  const { pathname } = useLocation();

  useEffect(() => trackEvent('page_view', { path: pathname }), [pathname]);

  // Unique, descriptive title per route (WCAG 2.4.2, SEO).
  useEffect(() => {
    const current = modules.find((m) => matchPath({ path: m.route, end: true }, pathname));
    document.title = current ? `${current.navLabel} - RIMSS` : 'RIMSS - YCompany';
  }, [pathname, modules]);

  // Move focus to the content after navigation so keyboard and screen-reader users land on it.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname, mainRef]);
}
