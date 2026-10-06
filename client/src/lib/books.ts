export type BookCategory = "printed" | "publications";

export interface Book {
  category: BookCategory;
  image: string;
  title: string;
  author: string;
  width: number;
  height: number;
}

export const books: Book[] = [
  { category: "printed", image: "/images/books/Harakiri_Antti.png", title: "Harakiri – Kylmälompakko", author: "Antti Eskelinen", width: 896, height: 1120 },
  { category: "printed", image: "/images/books/Suvaksen_Antti.png", title: "Suvaksen syvänne – Rautavaaran lihasoppa", author: "Antti Eskelinen", width: 896, height: 1120 },
  { category: "printed", image: "/images/books/Kriminal_Esko.png", title: "Kriminal Tango", author: "Esko Juntunen", width: 896, height: 1120 },
  { category: "printed", image: "/images/books/Maapallon_Esko.png", title: "Maapallon uusi elinkaari", author: "Esko Juntunen", width: 896, height: 1120 },
  { category: "printed", image: "/images/books/Uusi_Esko.png", title: "Uusi maailmanjärjestys", author: "Esko Juntunen", width: 896, height: 1120 },
  { category: "printed", image: "/images/books/Sukellus_Riitta.png", title: "Sukellus sukuun", author: "Riitta Tengman", width: 896, height: 1120 },
  { category: "printed", image: "/images/books/Kahdestaan_Juhani.png", title: "Kahdestaan oleminen", author: "Juhani Heiska", width: 896, height: 1120 },
  { category: "publications", image: "/images/books/Harri_Leading.png", title: "Leading in the Age of AI", author: "Harri Lauslahti", width: 1122, height: 1402 },
  { category: "publications", image: "/images/books/Katupaimen_Jani.png", title: "Katupaimen – Matkani Taivaan Isän pojaksi", author: "Jani Liukkonen", width: 896, height: 1120 },
  { category: "publications", image: "/images/books/Korsu_Ellimaria.png", title: "Korsu Pispalassa", author: "Ellimaria Juurinen", width: 896, height: 1120 },
  { category: "publications", image: "/images/books/Onnelliset_Jukka.png", title: "Onnelliset", author: "Jukka Vornanen", width: 896, height: 1120 },
];
