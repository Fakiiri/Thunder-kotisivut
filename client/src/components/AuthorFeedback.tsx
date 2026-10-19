import { AUTHOR_FEEDBACK } from "@/lib/sales-content";
import { useLang } from "@/contexts/LanguageContext";

export default function AuthorFeedback() {
  const { lang } = useLang();
  const preview = import.meta.env.VITE_EDITORIAL_PREVIEW === "true";
  const feedback = AUTHOR_FEEDBACK.filter(
    item => (item.approved && item.genre.trim()) || preview
  );
  if (!feedback.length) return null;
  return (
    <section
      className="thunder-section bg-background"
      aria-labelledby="author-feedback"
    >
      <div className="container">
        <span className="orange-line" />
        <h2
          id="author-feedback"
          className="thunder-heading text-3xl md:text-4xl mb-8"
        >
          {lang === "en"
            ? "Authors in their own words"
            : "Kirjailijamme kertovat"}
        </h2>
        {preview && (
          <p className="p-4 mb-6 border-2 border-amber-500 rounded-xl bg-amber-50 text-amber-950 font-semibold">
            ESIKATSELU: vain hyväksytyt palautteet, joiden kirjallisuuslaji on
            vahvistettu, näkyvät julkisessa versiossa. Kirjailijoiden nimiä tai
            teoksia ei julkaista.
          </p>
        )}
        <div className="grid md:grid-cols-3 gap-6">
          {feedback.map(item => (
            <article key={item.id} className="thunder-card p-7">
              {!item.approved && (
                <p className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-4">
                  Tekstiehdotus · ei julkaistavaksi
                </p>
              )}
              <p className="text-lg leading-relaxed mb-6">
                {lang === "en" ? item.en : item.quote}
              </p>
              <p className="text-sm font-bold">
                {(lang === "en" ? item.genreEn || item.genre : item.genre) ||
                  "[TÄYTÄ: kirjallisuuslaji]"}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
