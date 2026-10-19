import { AUTHOR_FEEDBACK } from "@/lib/sales-content";
import { useLang } from "@/contexts/LanguageContext";

export default function AuthorFeedback() {
  const { lang } = useLang();
  const preview = import.meta.env.VITE_EDITORIAL_PREVIEW === "true";
  const feedback = AUTHOR_FEEDBACK.filter(item => item.approved || preview);
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
            ESIKATSELU: nämä ovat palautetekstien ehdotuksia, eivät
            varmennettuja lainauksia. Hyväksy teksti, palautteen antaja, teos ja
            julkaisulupa ennen näkyviin ottamista.
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
              {item.image && (
                <img
                  src={item.image}
                  alt={item.book}
                  className="h-36 object-contain mb-4"
                  loading="lazy"
                />
              )}
              <p className="text-lg leading-relaxed mb-6">
                {lang === "en" ? item.en : item.quote}
              </p>
              <p className="text-sm font-bold">{item.author}</p>
              <p className="text-sm text-muted-foreground">{item.book}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
