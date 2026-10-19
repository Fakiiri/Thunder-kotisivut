const escapeHTML = (text: string) =>
  text.replace(
    /[&<>"']/g,
    character =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]!
  );

export function guideInlineHTML(
  text: string,
  publishedSlugs: ReadonlySet<string>
): string {
  return escapeHTML(text)
    .replace(/\[(.*?)\]\((.*?)\)/g, (_match, label, href) => {
      if (!/^(\/(?!\/)|https:\/\/)/.test(href)) return label;
      const guide = href.match(/^\/oppaat\/([^?#/]+)/);
      if (guide && !publishedSlugs.has(guide[1])) return label;
      return `<a href="${href}" class="thunder-orange underline underline-offset-4 hover:opacity-80">${label}</a>`;
    })
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>");
}

export function renderGuideMarkdown(
  content: string,
  publishedSlugs: ReadonlySet<string>
) {
  const inline = (text: string) => ({
    __html: guideInlineHTML(text, publishedSlugs),
  });
  return content
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((block, index) => {
      const heading = block.match(/^(#{2,3}) (.+)$/);
      if (heading) {
        const id = heading[2].toLowerCase().replace(/[^a-zäöå0-9]+/gi, "-");
        return heading[1] === "##" ? (
          <h2
            key={index}
            id={id}
            className="thunder-heading text-2xl md:text-3xl mt-12 mb-4 scroll-mt-24"
            dangerouslySetInnerHTML={inline(heading[2])}
          />
        ) : (
          <h3
            key={index}
            className="text-xl font-bold mt-8 mb-3"
            dangerouslySetInnerHTML={inline(heading[2])}
          />
        );
      }
      if (block === "---")
        return <hr key={index} className="my-8 border-border" />;
      if (block.includes("|") && block.includes("---")) {
        const lines = block.split("\n").filter(Boolean);
        const cells = (line: string) =>
          line
            .split("|")
            .slice(1, -1)
            .map(cell => cell.trim());
        return (
          <div key={index} className="overflow-x-auto my-6">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-orange-50 border-b-2 border-orange-200">
                  {cells(lines[0]).map((cell, position) => (
                    <th
                      key={position}
                      className="text-left px-4 py-3 font-semibold"
                      dangerouslySetInnerHTML={inline(cell)}
                    />
                  ))}
                </tr>
              </thead>
              <tbody>
                {lines.slice(2).map((line, position) => (
                  <tr
                    key={position}
                    className={position % 2 ? "bg-gray-50" : "bg-white"}
                  >
                    {cells(line).map((cell, column) => (
                      <td
                        key={column}
                        className="px-4 py-3 border-b border-gray-100 text-foreground/70"
                        dangerouslySetInnerHTML={inline(cell)}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      if (/^[-*] /.test(block) || /^\d+\. /.test(block)) {
        const ordered = /^\d+\. /.test(block);
        const items = block
          .split("\n")
          .filter(line => /^(?:[-*]|\d+\.) /.test(line))
          .map((line, position) => (
            <li
              key={position}
              className="pl-1 text-foreground/75 leading-relaxed"
              dangerouslySetInnerHTML={inline(
                line.replace(/^(?:[-*]|\d+\.) /, "")
              )}
            />
          ));
        return ordered ? (
          <ol key={index} className="list-decimal space-y-3 my-5 ml-6">
            {items}
          </ol>
        ) : (
          <ul
            key={index}
            className="list-disc space-y-2 my-5 ml-6 marker:text-orange-500"
          >
            {items}
          </ul>
        );
      }
      return (
        <p
          key={index}
          className="text-foreground/75 text-base leading-relaxed mb-4"
          dangerouslySetInnerHTML={inline(block)}
        />
      );
    });
}

export const GUIDE_CTA_TITLES: Record<string, string> = {
  "aanikirjan-tekeminen": "Haluatko kirjastasi äänikirjan?",
  "miten-julkaisen-oman-kirjan": "Mikä olisi kirjasi seuraava julkaisuaskel?",
  "omakustanne-vai-perinteinen-kustantamo":
    "Mikä julkaisutapa sopii sinun kirjallesi?",
  "kirjan-markkinointi": "Tarvitseeko kirjasi tukea lanseeraukseen?",
  "isbn-tunnus": "Haluatko apua kirjasi julkaisuun ja jakeluun?",
  "kirjan-taitto-ja-kansisuunnittelu": "Tehdäänkö tekstistäsi valmis kirja?",
  "kirjan-kustannukset": "Mitä juuri sinun kirjasi julkaiseminen maksaisi?",
  "kirjailijan-tulot": "Suunnitellaanko kirjallesi sopiva julkaisutapa?",
  "e-kirjan-julkaiseminen": "Haluatko julkaista kirjasi myös e-kirjana?",
  "kirjan-kirjoittaminen-aloittelijalle":
    "Mietitkö, miten käsikirjoituksesi etenisi julkaisuun?",
  "kirjan-myynti-rohkeus":
    "Haluatko tukea kirjasi julkaisuun ja lanseeraukseen?",
};
