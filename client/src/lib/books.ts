export type BookCategory = "printed" | "publications";

export interface Book {
  category: BookCategory;
  image: string;
  title: string;
  author: string;
  description?: string;
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
  { category: "publications", image: "/images/books/Katupaimen_Jani.png", title: "Katupaimen – Matkani Taivaan Isän pojaksi", author: "Jani Liukkonen", width: 896, height: 1120,
    description: "Katupaimen vie Jani Liukkosen elämän läpi ilman kiiltävää pintaa. Tie kulkee lähiöjengeistä huumeisiin, hengelliseen etsintään ja siihen kohtaan, jossa ihminen joutuu katsomaan itseään ilman pakotietä. Kirja kertoo rakkauden, hyväksynnän ja tarkoituksen nälästä, mutta ei juhlapuheena. Se on kertomus siitä, mitä tapahtuu, kun kadonnut ihminen löytää suunnan ja alkaa kulkea takaisin niiden luo, jotka ovat vielä pimeässä." },
  { category: "publications", image: "/images/books/Korsu_Ellimaria.png", title: "Korsu Pispalassa", author: "Ellimaria Juurinen", width: 896, height: 1120,
    description: "Korsu Pispalassa kertoo Tipistä, lappeenrantalaisesta miehestä, joka päätyy tamperelaisen rahtiyhtiön palvelukseen ja keskelle työpaikkaa, jossa kovuus ei ole asenne vaan selviytymiskeino. Kuljetusalan arki näyttää pian nurjan puolensa: petokset, juonittelut, väärät johtajat ja karskit kuskit tekevät työkomennuksesta paljon enemmän kuin uuden työn. Tipi joutuu opettelemaan, keneen voi luottaa, mitä kannattaa niellä ja milloin on aika pitää puolensa." },
  { category: "publications", image: "/images/books/Onnelliset_Jukka.png", title: "Onnelliset", author: "Jukka Vornanen", width: 896, height: 1120,
    description: "Onnelliset on tarinakokoelma maailmasta, jossa järki horjuu ja ihminen paljastuu omaksi oudoksi eläimekseen. Kertomuksissa liikutaan kiekkokaukaloista lähiöihin, Afrikan viidakoihin ja Ruotsin hoviin, eikä mikään kysymys ole liian järjetön: gorillapuku, simpanssimiljonääri, ihmiskaneiksi muuttuva ihmiskunta ja satavuotiaan ylijohtajan vauvahaaveet mahtuvat samaan todellisuuteen. Huumori puree, mutta ei pelkästään naurata. Se näyttää, miten helposti ihminen rakentaa suurista aatteista, peloista ja himoista täyden farssin." },
  { category: "publications", image: "/images/books/Sininarhi_Ellimaria_v2.png", title: "Sininärhi kylpee Aaressa", author: "Ellimaria Juurinen", width: 1122, height: 1402 },
];
