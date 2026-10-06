import type { Metadata } from "next";
import {
  SITE_NAME,
  SITE_URL,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
} from "./config";

export type CreateMetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
};

export function absoluteUrl(path: string = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return SITE_URL + (path.startsWith("/") ? path : "/" + path);
}

export function createMetadata(input: CreateMetadataInput = {}): Metadata {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    path = "/",
    image = DEFAULT_OG_IMAGE,
    noIndex = false,
  } = input;

  // The root layout title template already appends "| Kora".
  const cleanTitle = title ? title.replace(/\s*\|\s*Kora\s*$/i, "").trim() : "";
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);
  const socialTitle = cleanTitle ? cleanTitle + " | " + SITE_NAME : DEFAULT_TITLE;

  return {
    title: cleanTitle ? cleanTitle : { absolute: DEFAULT_TITLE },
    description,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      locale: "en_NG",
      title: socialTitle,
      description,
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [imageUrl],
    },
  };
}