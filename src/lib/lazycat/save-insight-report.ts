import { saveMarkdownReportToDisk, type SaveMarkdownDeps } from './save-to-disk';

export async function saveCachedInsightReportToDisk(
  country: string,
  appId: string,
  appName: string,
  deps: SaveMarkdownDeps = {},
) {
  const normalizedCountry = country.toLowerCase();
  return saveMarkdownReportToDisk(appId, appName, {
    ...deps,
    fetchReport:
      deps.fetchReport ??
      ((_id: string) =>
        fetch(
          `/api/appstore/${encodeURIComponent(normalizedCountry)}/${encodeURIComponent(appId)}/export-report?format=markdown`,
        )),
  });
}
