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
      cta: "Pyydä hinta-arvio",
      freeGuide: "Ilmainen opas",
    },

    // Home
    home: {
      badge: "Kirjailijoiden julkaisualusta",
      h1: "Sinä kirjoitat. Me julkaisemme. Lukijat löytävät.",
      lead: "Thunder Kustannus on suomalainen alusta, joka yhdistää modernin tavan julkaista kirja ja kirjailijan täyden kontrollin. Sinä kirjoitat, me hoidamme kaiken muun.",
      ctaPrimary: "Pyydä hinta-arvio",
      ctaSecondary: "Katso hinnat",
      servicesTitle: "Kaikki yhdeltä alustalta",
      servicesLead: "Ammattimainen julkaisuprosessi, täysi läpinäkyvyys ja kirjan oikeudet pysyvät sinulla. Aina.",
      service1Title: "Painettu kirja",
      service1Desc: "Ammattimainen taitto, kansisuunnittelu ja painatus. Jakelu Suomalainen kirjakauppa, Adlibris ja kirjastot.",
      service2Title: "Äänikirja",
      service2Desc: "Tekoäly- tai studioäänitys ja jakelu Storyteliin, BookBeatiin, Nextoryyn ja Spotifyhin.",
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
      downloadLead: "Lataa 10 askeleen tarkistuslista: Kaikki mitä tarvitset käsikirjoituksesta valmiiseen kirjaan.",
      downloadCta: "Lataa ilmainen opas",
      downloadNote: "Ei roskapostia. Voit peruuttaa milloin tahansa.",
      ctaTitle: "Valmis julkaisemaan?",
      ctaLead: "Pyydä hinta-arvio kirjaprojektistasi. Me vastaamme 24 tunnin sisällä.",
      ctaBtn: "Pyydä hinta-arvio",
    },

    // Pricing page
    pricing: {
      title: "Hinnat",
      h1: "Selkeät hinnat, ei piilokuluja",
      lead: "Valitse paketti joka sopii kirjaprojektiisi. Kaikki hinnat sisältävät ALV.",
      popular: "Suosituin",
      more: "muuta",
      ctaBtn: "Pyydä hinta-arvio",
      customTitle: "Tarvitsetko räätälöidyn ratkaisun?",
      customLead: "Ota yhteyttä ja räätälöimme paketin juuri sinun kirjaprojektillesi.",
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
      ctaBtn: "Pyydä hinta-arvio",
    },

    // Contact page
    contact: {
      title: "Yhteystiedot — Thunder Kustannus",
      h1: "Ota meihin yhteyttä",
      lead: "Haluatko tietää lisää kirjaprojektistasi? Lähetä meille viesti tai Pyydä hinta-arvio.",
      ctaBtn: "Pyydä hinta-arvio",
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
      ctaBtn: "Pyydä hinta-arvio",
      ctaLead: "Haluatko edetä? Pyydä hinta-arvio kirjaprojektistasi.",
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
      services: "Palvelut",
      pricing: "Hinnat",
      estimate: "Pyydä hinta-arvio",
      guides: "Oppaat",
      about: "Meistä",
      distribution: "Jakelu",
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
      services: "Services",
      pricing: "Pricing",
      estimate: "Get a free estimate",
      guides: "Guides",
      about: "About",
      distribution: "Distribution",
    },

    // Guides page
    guides: {
      h1: "Guides for authors",
      lead: "Everything you need to publish your own book — from manuscript to finished book, marketing and distribution.",
      readLabel: "Read",
      ctaTitle: "Ready to publish your book?",
      ctaLead: "Guides give you knowledge — we handle the practical work. Request a free estimate for your book project.",
      ctaBtn: "Get a free estimate",
      guidesOnlyFi: "Guides are currently available in Finnish only.",
    },

    // About page (extended)
    aboutExtended: {
      origin: "Thunder Kustannus was born from one simple observation: authors have stories, but they lack the tools or knowledge to publish them professionally. We built the platform to change that.",
      whyTitle: "Why Thunder Kustannus?",
      why1: "Traditional publishers reject over 99% of manuscripts. The process takes years. The author receives only a fraction of sales revenue.",
      why2: "At the other extreme is fully self-publishing — but that requires expertise from typesetting to negotiating distribution agreements and marketing.",
      why3: "Thunder Kustannus is the third way: a publishing platform for authors that combines professional publishing services with full author control. You own your book and receive the largest share of revenue — we handle typesetting, cover design, ISBN and distribution.",
      statsDistribution: "Distribution",
      statsDistributionValue: "7+ channels",
      statsTime: "Publishing time",
      statsTimeValue: "4–8 weeks",
      statsRoyalty: "Author royalty",
      statsRoyaltyValue: "60–70 %",
      statsRights: "Rights",
      statsRightsValue: "Author's",
      valuesTitle: "Our values",
      value1Title: "Transparency",
      value1Desc: "Clear prices, clear contracts. You always know exactly what you get and what it costs.",
      value2Title: "Author rights",
      value2Desc: "You own your book. Always. We are a service provider, not a rights holder.",
      value3Title: "Quality",
      value3Desc: "Professional typesetting, cover design and audiobook production. Your book deserves the best.",
      distributionTitle: "Our distribution network",
      companyDesc: "Finnish publishing platform",
    },

    // Contact page (extended)
    contactExtended: {
      lead: "We respond to all messages within 24 hours.",
      emailLabel: "Email",
      emailNote: "You can also book a call through this email. We respond within 24 hours.",
      fastestLabel: "Fastest way",
      fastestDesc: "Request a free estimate for your book project — you'll receive a personal response fastest.",
      companyDesc: "Finnish publishing platform",
    },

    // Estimate form (extended)
    estimateForm: {
      lead: "Fill in the form carefully — the more you tell us about your book, the more accurate estimate we can provide. We respond within 24 hours. No commitments.",
      trust1: "We call you",
      trust2: "Response within 24h",
      trust3: "No commitments",
      contactSection: "Contact information",
      nameLabel: "Name",
      namePlaceholder: "First Last",
      emailLabel: "Email",
      emailPlaceholder: "you@example.com",
      phoneLabel: "Phone number",
      phoneNote: "(we will call you)",
      packageLabel: "Package of interest",
      packagePlaceholder: "Select package",
      packageCustom: "Custom package",
      packageUnknown: "Not sure yet",
      bookSection: "Book details",
      bookTitleLabel: "Book (working) title or topic",
      bookTitlePlaceholder: "E.g. Entrepreneur's survival guide or My memoirs",
      genreLabel: "Genre / topic",
      genrePlaceholder: "Select genre",
      genreNonFiction: "Non-fiction",
      genreNovel: "Novel",
      genreMemo: "Autobiography / memoirs",
      genreBusiness: "Business / entrepreneurship",
      genreChildren: "Children's book",
      genrePoetry: "Poetry",
      genreTextbook: "Textbook / guide",
      genreOther: "Other",
      pagesLabel: "Estimated page count",
      pagesPlaceholder: "Select",
      pagesUnder100: "Under 100 pages",
      pages100200: "100–200 pages",
      pages200300: "200–300 pages",
      pagesOver300: "Over 300 pages",
      pagesDontKnow: "Don't know yet",
      manuscriptLabel: "Manuscript status",
      manuscriptPlaceholder: "Select",
      manuscriptReady: "Ready — can start immediately",
      manuscriptAlmost: "Almost ready (1–4 weeks)",
      manuscriptInProgress: "In progress (1–3 months)",
      manuscriptIdea: "Just an idea — I'd like advice",
      audiobookLabel: "Do you want an audiobook?",
      audiobookPlaceholder: "Select",
      audiobookYes: "Yes, definitely",
      audiobookNo: "Not this time",
      audiobookMaybe: "Maybe — I'd like more information",
      timelineLabel: "Desired publishing timeline",
      timelinePlaceholder: "Select",
      timeline1m: "Within 1 month",
      timeline13m: "Within 1–3 months",
      timeline36m: "Within 3–6 months",
      timelineOver6m: "Over 6 months",
      timelineNoRush: "No rush — I want to learn more first",
      additionalSection: "Additional information",
      additionalDesc: "Tell us freely about your book, goals or questions. The more you share, the better we can help.",
      additionalPlaceholder: "E.g. My book is about... My goal is... I have a question...",
      consentText: "I have read the",
      consentTerms: "terms of service",
      consentAnd: "and agree that Thunder Kustannus may process my information for the purpose of the estimate request. I can also be contacted by phone at the number I provided.",
      submitNote: "We respond within 24 hours. No commitments. Your information will not be shared with third parties.",
      errorGeneral: "Form submission failed. Please try again or contact us: info@thunderkustannus.fi",
      errorNetwork: "Network error. Check your connection and try again.",
      successTitle: "Estimate received!",
      successThank: "Thank you for reaching out,",
      successContact: "We will contact you within 24 hours — by phone at",
      successOr: "or by email at",
    },

    // Guide download page
    download: {
      badge: "Free guide",
      h1Part1: "Book publishing",
      h1Highlight: "10-step",
      h1Part2: "checklist",
      lead: "Everything you need from manuscript to a finished, sellable book — step by step. Download the PDF and start the publishing process today.",
      check1: "Applying for an ISBN number and barcode",
      check2: "Choosing the publishing format (print, e-book, audiobook)",
      check3: "Cover design and typesetting",
      check4: "Distribution channels: Storytel, Suomalainen Kirjakauppa and more",
      check5: "Marketing before and after publication",
      pdfNote: "PDF guide · 10 steps · Free",
      formTitle: "Download guide for free",
      formLead: "Enter your email address and we'll send the guide straight to your inbox.",
      nameLabel: "First name",
      namePlaceholder: "John",
      emailLabel: "Email",
      submitBtn: "Download free guide",
      submitting: "Sending...",
      noSpam: "No spam. You can unsubscribe at any time.",
      successTitle: "Thank you!",
      successText: "The guide is available below. We also sent it to your email.",
      downloadBtn: "Download PDF",
      errorDefault: "Something went wrong. Please try again.",
    },

    // Pricing FAQ
    pricingFaq: [
      {
        q: "How long does the publishing process take?",
        a: "Typically 4–8 weeks from receiving the manuscript to a finished book. Audiobook production may add 2–4 weeks.",
      },
      {
        q: "Do I retain the rights to my book?",
        a: "Yes, fully. The author always owns the copyright to their book. We handle the publishing process, but the rights remain with you.",
      },
      {
        q: "How are royalties paid?",
        a: "We pay royalties quarterly. You receive detailed sales reports from all distribution channels.",
      },
      {
        q: "Can I change the book price later?",
        a: "Yes. You can change the retail price of your book at any time — we update the price across all distribution channels.",
      },
      {
        q: "What happens if I want to terminate the contract?",
        a: "The contract can be terminated with 3 months' notice. Your book will be removed from distribution and the rights remain with you.",
      },
    ],
  },
} as const;

// Package translation type
export type PackageTranslation = {
  tagline: string;
  description: string;
  features: readonly string[];
  notIncluded: readonly string[];
};

export type FaqItem = { q: string; a: string };

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
  // Optional extended sections (EN only)
  guides?: Record<string, string>;
  aboutExtended?: Record<string, string>;
  contactExtended?: Record<string, string>;
  estimateForm?: Record<string, string>;
  download?: Record<string, string>;
  pricingFaq?: readonly FaqItem[];
};
