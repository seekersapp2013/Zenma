import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useAppSettings() {
  const appSettings = useQuery(api.settings?.getAppSettings);

  useEffect(() => {
    if (appSettings) {
      // Update document title
      if (appSettings.title) {
        document.title = appSettings.title;
      }

      // Update favicon
      if (appSettings.favicon) {
        let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = appSettings.favicon;
      }

      // Apply color scheme (basic implementation)
      if (appSettings.colorScheme && appSettings.colorScheme !== 'default') {
        document.documentElement.setAttribute('data-theme', appSettings.colorScheme);
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }
  }, [appSettings]);

  return appSettings;
}