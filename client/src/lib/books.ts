export type BookCategory = "printed" | "publications";

export interface Book {
  category: BookCategory;
  image: string;
  alt: string;
  width: number;
  height: number;
}

export const books: Book[] = [
  { category: "printed", image: "/images/books/Harakiri_Antti.png", alt: "Harakiri – Kylmälompakko", width: 896, height: 1120 },
  { category: "printed", image: "/images/books/Suvaksen_Antti.png", alt: "Suvaksen syvänne – Rautavaaran lihasoppa", width: 896, height: 1120 },
  { category: "printed", image: "/images/books/Kriminal_Esko.png", alt: "Kriminal Tango", width: 896, height: 1120 },
  { category: "printed", image: "/images/books/Maapallon_Esko.png", alt: "Maapallon uusi elinkaari", width: 896, height: 1120 },
  { category: "printed", image: "/images/books/Uusi_Esko.png", alt: "Uusi maailmanjärjestys", width: 896, height: 1120 },
  { category: "printed", image: "/images/books/Sukellus_Riitta.png", alt: "Sukellus sukuun", width: 896, height: 1120 },
  { category: "printed", image: "/images/books/Kahdestaan_Juhani.png", alt: "Kahdestaan oleminen", width: 896, height: 1120 },
  { category: "publications", image: "/images/books/Harri_Leading.png", alt: "Leading in the Age of AI", width: 1122, height: 1402 },
  { category: "publications", image: "/images/books/Katupaimen_Jani.png", alt: "Katupaimen – Matkani Taivaan Isän pojaksi", width: 896, height: 1120 },
  { category: "publications", image: "/images/books/Korsu_Ellimaria.png", alt: "Korsu Pispalassa", width: 896, height: 1120 },
  { category: "publications", image: "/images/books/Onnelliset_Jukka.png", alt: "Onnelliset", width: 896, height: 1120 },
  { category: "publications", image: "/images/books/Sininarhi_Ellimaria.png", alt: "Sininärhi kylpee Aässä", width: 896, height: 1120 },
];
