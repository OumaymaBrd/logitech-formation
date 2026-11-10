/** Infos publiques du centre — SEO, footer, contact */
export const SITE = {
  name: "Logitech Formation",
  legalName: "Logitech Formation — Centre de formation",
  url: "https://logitechformation.com",
  phoneDisplay: "+212 778-982965",
  phoneE164: "+212778982965",
  email: "Formationlogitech@gmail.com",
  city: "Tanger",
  country: "MA",
  region: "Tanger-Tétouan-Al Hoceïma",
  addressLabel: "Tanger, Maroc",
  /** Recherche Maps du centre (à remplacer par le lien exact Google Maps Business si disponible) */
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Logitech+Formation+Tanger+Maroc",
  social: {
    instagram: "https://www.instagram.com/logitech_formation/",
    facebook: "https://www.facebook.com/share/1FQHcF2kce/",
    tiktok: "https://www.tiktok.com/@logitechformation",
  },
  description:
    "Logitech Formation — centre de formation professionnelle à Tanger (Maroc). Formations certifiantes théorie + pratique (engins de chantier, logistique). Contact : +212 778-982965 · Formationlogitech@gmail.com",
  keywords: [
    "Logitech Formation",
    "logitechformation",
    "formation Tanger",
    "centre de formation Tanger",
    "formation professionnelle Maroc",
    "formation engins de chantier",
    "formation logistique Tanger",
  ],
} as const;

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE.name,
    alternateName: ["Logitech Formation Tanger", "logitechformation"],
    url: SITE.url,
    logo: `${SITE.url}/logo-mark.png`,
    image: `${SITE.url}/logo-logitech.png`,
    description: SITE.description,
    email: SITE.email,
    telephone: SITE.phoneE164,
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.city,
      addressRegion: SITE.region,
      addressCountry: SITE.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 35.7595,
      longitude: -5.834,
    },
    areaServed: {
      "@type": "City",
      name: "Tanger",
    },
    sameAs: [
      SITE.social.instagram,
      SITE.social.facebook,
      SITE.social.tiktok,
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE.phoneE164,
      email: SITE.email,
      contactType: "customer service",
      areaServed: "MA",
      availableLanguage: ["French", "Arabic"],
    },
  };
}
