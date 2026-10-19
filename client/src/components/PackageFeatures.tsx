import { CheckCircle2 } from "lucide-react";
export default function PackageFeatures({
  features,
  emphasizeAudio = false,
}: {
  features: readonly string[];
  emphasizeAudio?: boolean;
}) {
  return (
    <ul className="space-y-3">
      {features.map((feature, index) => (
        <li
          key={feature}
          className="flex gap-3 items-start text-sm leading-relaxed text-foreground/80"
        >
          <CheckCircle2
            aria-hidden="true"
            className="w-4 h-4 thunder-orange mt-1 shrink-0"
          />
          {emphasizeAudio && index === 0 ? (
            <strong className="text-foreground">{feature}</strong>
          ) : (
            <span>{feature}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
