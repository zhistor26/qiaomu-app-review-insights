const DEFAULT = 'http://localhost:3000';

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT).replace(/\/$/, '');
}

export function getMetadataBase(): URL {
  return new URL(getSiteUrl());
}
