// Liidimagneetit (tehtävä 002). Sama data sivuille, palvelimelle ja testeille.
export type MagnetKey = "kurssi" | "muistelma" | "naytekirja";

export type Magnet = {
  key: MagnetKey;
  path: string;
  lane: "kaista-1" | "kaista-2";
  badge: string;
  title: string;
  subtitle: string;
  bullets: [string, string, string];
  button: string;
};

export const MAGNETS: Record<MagnetKey, Magnet> = {
  kurssi: {
    key: "kurssi",
    path: "/kirjasi-5-paivassa",
    lane: "kaista-2",
    badge: "Ilmainen sähköpostikurssi",
    title: "Kirjasi suunnitelma 5 päivässä",
    subtitle:
      "Ilmainen sähköpostikurssi. Viisi lyhyttä viestiä, joiden jälkeen tiedät, mistä kirjasi alkaa, mitä se maksaa ja milloin se on valmis.",
    bullets: [
      "Päivä 1: aihe ja lukija",
      "Päivä 3: aikataulu, joka pitää",
      "Päivä 4: mitä julkaisu oikeasti maksaa",
    ],
    button: "Aloita kurssi",
  },
  muistelma: {
    key: "muistelma",
    path: "/muistelman-aloitus",
    lane: "kaista-2",
    badge: "Ilmainen kysymyslista",
    title: "Muistelmasi alkaa 52 kysymyksestä",
    subtitle:
      "Ladattava kysymyslista ja yksi kysymys viikossa sähköpostiisi. Vuoden päästä sinulla on käsikirjoitus.",
    bullets: [
      "52 kysymystä lapsuudesta tähän päivään",
      "Vastaa kirjoittamalla tai puhumalla",
      "Ei kirjoituskokemusta tarvita",
    ],
    button: "Lähetä kysymykset",
  },
  naytekirja: {
    key: "naytekirja",
    path: "/naytekirja",
    lane: "kaista-1",
    badge: "Ilmainen näytekirja",
    title: "Katso, miltä valmis kirjasi näyttää",
    subtitle: "10 sivua valmiista Thunder-kirjasta ja minuutin näyte äänikirjasta.",
    bullets: [
      "Kansi, taitto ja sisällys",
      "Äänikirjanäyte 1 min",
      "Äänikirja kuuluu jo 890 €:n pakettiin",
    ],
    button: "Lähetä näytekirja",
  },
};

export const MAGNET_KEYS = Object.keys(MAGNETS) as MagnetKey[];
