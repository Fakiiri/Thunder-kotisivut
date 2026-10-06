import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { useLang } from "@/contexts/LanguageContext";
import { books, type BookCategory } from "@/lib/books";

export default function Kirjat() {
  const { lang } = useLang();
  const title = lang === "fi" ? "Kirjat" : "Books";
  const sections: { category: BookCategory; title: string }[] = [
    { category: "printed", title: lang === "fi" ? "Painetut teokset" : "Printed works" },
    { category: "publications", title: lang === "fi" ? "Julkaisut" : "Publications" },
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
      <main className="pt-32 md:pt-44 pb-20 md:pb-28">
        <div className="container">
          <span className="orange-line" aria-hidden="true" />
          <h1 className="thunder-heading text-4xl md:text-6xl mb-14 md:mb-20">{title}</h1>
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
                    <figure key={book.image} className="overflow-hidden rounded-xl border border-border bg-card">
                      <img
                        src={book.image}
                        alt={book.alt}
                        width={book.width}
                        height={book.height}
                        loading="lazy"
                        decoding="async"
                        className="block w-full h-auto"
                      />
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
