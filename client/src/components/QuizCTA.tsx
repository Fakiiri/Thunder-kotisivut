import { Link } from "wouter";
import { ArrowRight, Sparkles } from "lucide-react";
import { trackQuiz } from "@/lib/quiz-analytics";
export default function QuizCTA({ source = "content" }: { source?: string }) {
  return (
    <aside className="my-10 rounded-2xl border border-orange-200 bg-[#fff7ed] p-7 md:p-10">
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-700">
        <Sparkles size={16} aria-hidden="true" /> Maksuton · noin 2 minuuttia
      </div>
      <h2 className="thunder-heading text-2xl md:text-3xl mt-4 mb-3">
        Mikä on kirjasi seuraava askel?
      </h2>
      <p className="text-muted-foreground max-w-2xl mb-6">
        Vastaa kahdeksaan kysymykseen. Saat omaan tilanteeseesi sopivan
        julkaisusuunnan ja kolme käytännön ohjetta, joilla pääset eteenpäin.
      </p>
      <Link
        href={`/julkaisutesti?source=${source}`}
        onClick={() => trackQuiz("quiz_cta_click", { cta_location: source })}
        className="thunder-btn-primary inline-flex items-center gap-2 rounded-lg px-6 py-3 font-bold"
      >
        Tee 2 minuutin testi <ArrowRight size={18} />
      </Link>
    </aside>
  );
}
