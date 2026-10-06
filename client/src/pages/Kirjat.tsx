import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { useLang } from "@/contexts/LanguageContext";
import { books, type BookCategory } from "@/lib/books";

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
                        {book.description && (
                          <p className="mt-4 text-sm md:text-base leading-relaxed text-foreground/70">{book.description}</p>
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
