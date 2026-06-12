// Thunder Kustannus — FI/EN translations
// Oppaat (guides) remain Finnish-only

export type Lang = "fi" | "en";

export const translations = {
  fi: {
    // Navbar
    nav: {
      home: "Etusivu",
      pricing: "Hinnat",
      guides: "Oppaat",
      about: "Meistä",
      contact: "Yhteystiedot",
      cta: "Pyydä ilmainen arvio",
      freeGuide: "Ilmainen opas",
    },

    // Home
    home: {
      badge: "Kirjailijoiden julkaisualusta",
      h1: "Sinä kirjoitat. Me julkaisemme. Lukijat löytävät.",
      lead: "Thunder Kustannus on suomalainen alusta, joka yhdistää modernin tavan julkaista kirja ja kirjailijan täyden kontrollin. Sinä omistat kirjasi — me hoidamme kaiken muun.",
      ctaPrimary: "Pyydä ilmainen arvio",
      ctaSecondary: "Katso hinnat",
      servicesTitle: "Kaikki yhdeltä alustalta",
      servicesLead: "Ammattimainen julkaisuprosessi, täysi läpinäkyvyys ja kirjailijan oikeudet pysyvät sinulla. Aina.",
      service1Title: "Painettu kirja",
      service1Desc: "Ammattimainen taitto, kansisuunnittelu ja painatus. Jakelu Suomalaiseen Kirjakauppaan, Adlibrikseen ja kirjastoihin.",
      service2Title: "Äänikirja",
      service2Desc: "Ammattilukija, studioäänitys ja jakelu Storyteliin, BookBeatiin, Nextoryyn ja Spotifyhin.",
      service3Title: "E-kirja",
      service3Desc: "EPUB3-formaatti, jakelu kaikkiin digitaalisiin kanaviin ja suoratoistopalveluihin.",
      pricingTitle: "Läpinäkyvä hinnoittelu",
      pricingLead: "Tiedät tarkalleen mitä maksat ja mitä saat. Ei yllätyksiä, ei sitoumuksia oikeuksistasi.",
      pricingMore: "Katso kaikki paketin sisällöt",
      pricingPopular: "Suosituin",
      pricingMore2: "muuta",
      guidesTitle: "Oppaat kirjailijoille",
      guidesLead: "Kaikki mitä tarvitset kirjan julkaisemiseen.",
      guidesAll: "Kaikki oppaat",
      guideReadTime: "lukuaika",
      downloadTitle: "Ilmainen opas: Kirjan julkaisemisen tarkistuslista",
      downloadLead: "Lataa 10 askeleen tarkistuslista — kaikki mitä tarvitset käsikirjoituksesta valmiiseen kirjaan.",
      downloadCta: "Lataa ilmainen opas",
      downloadNote: "Ei roskapostia. Voit peruuttaa milloin tahansa.",
      ctaTitle: "Valmis julkaisemaan?",
      ctaLead: "Pyydä ilmainen arvio kirjaprojektistasi — vastaamme 24 tunnin sisällä.",
      ctaBtn: "Pyydä ilmainen arvio",
    },

    // Pricing page
    pricing: {
      title: "Hinnat",
      h1: "Selkeät hinnat, ei piilokuluja",
      lead: "Valitse paketti joka sopii kirjaprojektiisi. Kaikki hinnat sisältävät ALV.",
      popular: "Suosituin",
      more: "muuta",
      ctaBtn: "Pyydä ilmainen arvio",
      customTitle: "Tarvitsetko räätälöidyn ratkaisun?",
      customLead: "Ota yhteyttä — räätälöimme paketin juuri sinun kirjaprojektillesi.",
      customBtn: "Pyydä räätälöity arvio",
    },

    // About page
    about: {
      title: "Meistä — Thunder Kustannus",
      h1: "Thunder Kustannus — Suomalainen kirjailijoiden alusta",
      lead: "Uskomme, että jokaisella kirjailijalla on oikeus julkaista ammattilaistasoisesti ilman perinteisten kustantamoiden portinvartijoita.",
      missionTitle: "Missio",
      missionText: "Teemme kirjan julkaisemisesta helppoa, läpinäkyvää ja kannattavaa kirjailijalle.",
      royaltyLabel: "Tekijänpalkkio",
      royaltyValue: "60–70 %",
      royaltyNote: "myyntituloista (kanavan mukaan)",
      ctaTitle: "Haluatko julkaista kirjasi?",
      ctaBtn: "Pyydä ilmainen arvio",
    },

    // Contact page
    contact: {
      title: "Yhteystiedot — Thunder Kustannus",
      h1: "Otetaan yhteyttä",
      lead: "Haluatko tietää lisää kirjaprojektistasi? Lähetä meille viesti tai pyydä ilmainen arvio.",
      ctaBtn: "Pyydä ilmainen arvio",
    },

    // Estimate form
    estimate: {
      title: "Ilmainen arvio kirjaprojektistasi",
      h1: "Ilmainen arvio kirjaprojektistasi",
      lead: "Kerro kirjastasi ja saat henkilökohtaisen arvion 24 tunnin sisällä.",
      submit: "Lähetä arviopyyntö",
      successTitle: "Kiitos! Olemme yhteydessä pian.",
      successText: "Olemme vastaanottaneet arviopyyntösi ja palaamme asiaan 24 tunnin sisällä.",
    },

    // Calculator
    calc: {
      h2: "Laske kirjasi hinta",
      lead: "Pehmeäkantinen kirja. Kannen materiaali: Metsä Board.",
      vatNote: "Hinnat sisältävät ALV 13,5 %.",
      size: "Kirjan koko",
      paper: "Paperin tyyppi",
      pages: "Sivumäärä",
      qty: "Painosmäärä",
      calcBtn: "Laske hinta",
      reset: "Laske uudelleen",
      fillAll: "Täytä kaikki kentät laskeaksesi hinnan.",
      totalPrice: "Kokonaishinta",
      unitPrice: "Kappalehinta",
      spine: "Kirjan selkä",
      binding: "Sidonta",
      glued: "Pehmeäkantinen, liimasidottu",
      stapled: "Niittisidottu vihko",
      cover: "Kannen materiaali",
      noResult: "Tälle yhdistelmälle ei löydy hintaa",
      noResultLead: "Pyydä meiltä räätälöity arvio — löydämme sinulle sopivan ratkaisun.",
      ctaBtn: "Pyydä ilmainen arvio",
      ctaLead: "Haluatko edetä? Pyydä maksuton arvio kirjaprojektistasi.",
      note32: "32-sivuinen teos on saatavilla vain paksulla 120g-paperilla (niittisidottu vihko).",
      asterisk32: "* 32-sivuinen teos on saatavilla vain paksulla 120g-paperilla (niittisidottu vihko).",
      selectSize: "Valitse koko",
      selectSizeFirst: "Valitse ensin koko",
      selectPaper: "Valitse paperi",
      selectPaperFirst: "Valitse ensin paperi",
      selectPages: "Valitse sivumäärä",
      selectPagesFirst: "Valitse ensin sivumäärä",
      selectQty: "Valitse painosmäärä",
    },

    // Footer
    footer: {
      tagline: "Suomalainen kirjailijoiden julkaisualusta.",
      links: "Pikavalinnat",
      contact: "Yhteystiedot",
      legal: "Oikeudelliset",
      terms: "Sopimusehdot",
      privacy: "Tietosuojaseloste",
      rights: "Kaikki oikeudet pidätetään.",
    },
  },

  en: {
    // Navbar
    nav: {
      home: "Home",
      pricing: "Pricing",
      guides: "Guides",
      about: "About",
      contact: "Contact",
      cta: "Get a free estimate",
      freeGuide: "Free guide",
    },

    // Home
    home: {
      badge: "Publishing platform for authors",
      h1: "You write. We publish. Readers find you.",
      lead: "Thunder Kustannus is a Finnish platform that combines modern publishing with full author control. You own your book — we handle everything else.",
      ctaPrimary: "Get a free estimate",
      ctaSecondary: "See pricing",
      servicesTitle: "Everything from one platform",
      servicesLead: "Professional publishing process, full transparency, and your rights stay with you. Always.",
      service1Title: "Printed book",
      service1Desc: "Professional layout, cover design and printing. Distribution to Suomalainen Kirjakauppa, Adlibris and libraries.",
      service2Title: "Audiobook",
      service2Desc: "Professional narrator, studio recording and distribution to Storytel, BookBeat, Nextory and Spotify.",
      service3Title: "E-book",
      service3Desc: "EPUB3 format, distribution to all digital channels and streaming services.",
      pricingTitle: "Transparent pricing",
      pricingLead: "You know exactly what you pay and what you get. No surprises, no rights commitments.",
      pricingMore: "See all package contents",
      pricingPopular: "Most popular",
      pricingMore2: "more",
      guidesTitle: "Guides for authors",
      guidesLead: "Everything you need to publish your book.",
      guidesAll: "All guides",
      guideReadTime: "read time",
      downloadTitle: "Free guide: Book publishing checklist",
      downloadLead: "Download the 10-step checklist — everything you need from manuscript to finished book.",
      downloadCta: "Download free guide",
      downloadNote: "No spam. You can unsubscribe at any time.",
      ctaTitle: "Ready to publish?",
      ctaLead: "Request a free estimate for your book project — we respond within 24 hours.",
      ctaBtn: "Get a free estimate",
    },

    // Pricing page
    pricing: {
      title: "Pricing — Thunder Kustannus",
      h1: "Clear pricing, no hidden fees",
      lead: "Choose the package that fits your book project. All prices include VAT.",
      popular: "Most popular",
      more: "more",
      ctaBtn: "Get a free estimate",
      customTitle: "Need a custom solution?",
      customLead: "Contact us — we'll tailor a package for your specific book project.",
      customBtn: "Request a custom estimate",
      packages: [
        {
          tagline: "Digital publishing",
          description: "The complete digital publishing package for your book — e-book, audiobook and distribution to all Finnish streaming services.",
          features: [
            "Professional typesetting",
            "Cover design",
            "E-book (EPUB3)",
            "Audiobook production",
            "Distribution: Storytel, BookBeat, Nextory",
            "Distribution: Spotify audiobooks",
            "Distribution: Finnish libraries",
            "ISBN number",
            "Sales reports",
          ],
          notIncluded: ["Printed book", "Distribution to physical bookstores", "Marketing package"],
        },
        {
          tagline: "Most popular choice",
          description: "All digital services plus a printed book. Your book available in bookstores across Finland.",
          features: [
            "Everything in Digi package",
            "50 printed copies",
            "Distribution: Finnish Bookstore, Adlibris, Libraries, Storytel, BookBeat, Nextory, Spotify, Amazon, Kobo, Google Play Books",
            "Storia agreement (bookstore distribution)",
            "1 year warehousing",
          ],
          notIncluded: ["Marketing package", "Press release"],
        },
        {
          tagline: "Market leader choice",
          description: "Full-service package for the author who wants maximum visibility and a professional launch.",
          features: [
            "Everything in Printti package",
            "100 printed copies",
            "Marketing package",
            "Press release (media)",
            "Social media launch package",
            "Author media training",
            "Priority support 12 months",
          ],
          notIncluded: [],
        },
      ],
    },

    // About page
    about: {
      title: "About — Thunder Kustannus",
      h1: "Thunder Kustannus — Finnish publishing platform for authors",
      lead: "We believe every author has the right to publish professionally without the gatekeepers of traditional publishing.",
      missionTitle: "Mission",
      missionText: "We make publishing easy, transparent and profitable for the author.",
      royaltyLabel: "Author royalty",
      royaltyValue: "60–70 %",
      royaltyNote: "of sales revenue (depending on channel)",
      ctaTitle: "Want to publish your book?",
      ctaBtn: "Get a free estimate",
    },

    // Contact page
    contact: {
      title: "Contact — Thunder Kustannus",
      h1: "Get in touch",
      lead: "Want to know more about your book project? Send us a message or request a free estimate.",
      ctaBtn: "Get a free estimate",
    },

    // Estimate form
    estimate: {
      title: "Free estimate for your book project",
      h1: "Free estimate for your book project",
      lead: "Tell us about your book and receive a personal estimate within 24 hours.",
      submit: "Send estimate request",
      successTitle: "Thank you! We'll be in touch soon.",
      successText: "We have received your estimate request and will get back to you within 24 hours.",
    },

    // Calculator
    calc: {
      h2: "Calculate your book price",
      lead: "Softcover book. Cover material: Metsä Board.",
      vatNote: "Prices include VAT 13.5%.",
      size: "Book size",
      paper: "Paper type",
      pages: "Page count",
      qty: "Print run",
      calcBtn: "Calculate price",
      reset: "Calculate again",
      fillAll: "Fill in all fields to calculate the price.",
      totalPrice: "Total price",
      unitPrice: "Unit price",
      spine: "Spine width",
      binding: "Binding",
      glued: "Softcover, perfect bound",
      stapled: "Staple-bound booklet",
      cover: "Cover material",
      noResult: "No price found for this combination",
      noResultLead: "Request a custom estimate from us — we'll find the right solution for you.",
      ctaBtn: "Get a free estimate",
      ctaLead: "Ready to proceed? Request a free estimate for your book project.",
      note32: "32-page works are only available on thick 120g paper (staple-bound booklet).",
      asterisk32: "* 32-page works are only available on thick 120g paper (staple-bound booklet).",
      selectSize: "Select size",
      selectSizeFirst: "Select size first",
      selectPaper: "Select paper",
      selectPaperFirst: "Select paper first",
      selectPages: "Select page count",
      selectPagesFirst: "Select page count first",
      selectQty: "Select print run",
    },

    // Footer
    footer: {
      tagline: "Finnish publishing platform for authors.",
      links: "Quick links",
      contact: "Contact",
      legal: "Legal",
      terms: "Terms of service",
      privacy: "Privacy policy",
      rights: "All rights reserved.",
    },
  },
} as const;

// Package translation type
export type PackageTranslation = {
  tagline: string;
  description: string;
  features: readonly string[];
  notIncluded: readonly string[];
};

// Use a structural type so both fi and en are assignable
export type Translations = {
  nav: Record<string, string>;
  home: Record<string, string>;
  pricing: {
    title: string;
    h1: string;
    lead: string;
    popular: string;
    more: string;
    ctaBtn: string;
    customTitle: string;
    customLead: string;
    customBtn: string;
    packages?: readonly PackageTranslation[];
  };
  about: Record<string, string>;
  contact: Record<string, string>;
  estimate: Record<string, string>;
  calc: Record<string, string>;
  footer: Record<string, string>;
};
