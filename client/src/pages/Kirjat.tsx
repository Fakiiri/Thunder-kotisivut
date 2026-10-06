import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { useLang } from "@/contexts/LanguageContext";
import { books, type BookCategory } from "@/lib/books";

function BookDescription({ text, lang }: { text: string; lang: string }) {
  const firstSentenceEnd = text.search(/[.!?](?:\s|$)/);
  const intro = firstSentenceEnd < 0 ? text : text.slice(0, firstSentenceEnd + 1);
  const remainder = firstSentenceEnd < 0 ? "" : text.slice(firstSentenceEnd + 1).trim();

  return (
    <div className="mt-4 text-sm md:text-base leading-relaxed text-foreground/70" lang="fi">
      <p>{intro}</p>
      {remainder && (
        <details className="book-description mt-3">
          <summary className="w-fit cursor-pointer rounded text-sm font-semibold text-foreground underline decoration-orange-400 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500">
            <span className="book-read-more">{lang === "fi" ? "Lue lisää" : "Read more"}</span>
            <span className="book-read-less">{lang === "fi" ? "Näytä vähemmän" : "Show less"}</span>
          </summary>
          <p className="mt-3">{remainder}</p>
        </details>
      )}
    </div>
  );
}

export default function Kirjat() {
  const { lang } = useLang();
  const title = lang === "fi" ? "Kirjat" : "Books";
  const sections: { category: BookCategory; title: string }[] = [
    { category: "publications", title: lang === "fi" ? "Julkaisut" : "Publications" },
    { category: "printed", title: lang === "fi" ? "Painetut teokset" : "Printed works" },
  ];

  useSEO({
    title,
    description: lang === "fi"
      ? "Thunder Kustannuksen painetut teokset ja julkaisut."
      : "Printed works and publications from Thunder Kustannus.",
    canonical: "/kirjat",
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 md:pt-32 pb-20 md:pb-28">
        <div className="container">
          <header className="books-hero mb-12 md:mb-16">
            <span className="books-hero-rule" aria-hidden="true" />
            <h1 className="books-display">{title}<span className="books-title-dot" aria-hidden="true">.</span></h1>
            <span className="books-hero-rule" aria-hidden="true" />
          </header>
          <div className="space-y-16 md:space-y-24">
            {sections.map((section) => (
              <section key={section.category} aria-labelledby={`books-${section.category}`}>
                <div className="border-b border-border pb-5 mb-8">
                  <h2 id={`books-${section.category}`} className="text-2xl md:text-3xl">
                    {section.title}
                  </h2>
                  {section.category === "publications" && (
                    <p className="mt-3 text-sm text-foreground/65">
                      {lang === "fi"
                        ? "Kaikki äänikirjat ovat saatavilla useimmista äänikirjapalveluista."
                        : "All audiobooks are available on most audiobook services."}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {books.filter((book) => book.category === section.category).map((book) => (
                    <figure key={book.image} className="flex flex-col">
                      <h3 className="text-xl md:text-2xl leading-snug mb-4 sm:min-h-16" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 500 }}>
                        {book.title}
                      </h3>
                      <img
                        src={book.image}
                        alt={`${book.title} — ${book.author}`}
                        width={book.width}
                        height={book.height}
                        loading="lazy"
                        decoding="async"
                        className="block w-full h-auto rounded-xl border border-border"
                      />
                      <figcaption className="mt-4">
                        <p className="text-base font-medium text-foreground/75">{book.author}</p>
                        {(book.category === "printed" || book.language || book.formats?.length) ? <ul className="mt-3 flex flex-wrap gap-2" aria-label={lang === "fi" ? "Kirjan formaatit ja kieli" : "Book formats and language"}>
                          {book.category === "printed" && <li className="rounded-full border border-border px-3 py-1 text-xs text-foreground/70">{lang === "fi" ? "Painettu kirja" : "Printed book"}</li>}
                          {book.language === "en" && <li className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs text-foreground/70">{lang === "fi" ? "Englanninkielinen" : "English"}</li>}
                          {(book.formats ?? []).map(format => <li key={format} className="rounded-full border border-border px-3 py-1 text-xs text-foreground/70">{format === "audio" ? (lang === "fi" ? "Äänikirja" : "Audiobook") : (lang === "fi" ? "E-kirja" : "E-book")}</li>)}
                        </ul> : null}
                        {book.description && (
                          <BookDescription text={book.description} lang={lang} />
                        )}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
