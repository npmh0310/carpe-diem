import { SOCIAL_LINKS } from "@/data/socials";
import { MaskText } from "@/components/common/MaskText";
import { ArrowUpRight } from "lucide-react";

export const SocialLinks = () => {
  return (
    <div className="flex flex-col items-end gap-1 text-xs uppercase font-anton tracking-widest">
      {SOCIAL_LINKS.map((link, index) => (
        <a
          key={link.label}
          href={link.href}
          target={link.external ? "_blank" : undefined}
          rel={link.external ? "noopener noreferrer" : undefined}
          className="group flex items-center gap-1"
        >
          <div className="overflow-hidden w-0 transition-[width] duration-300 group-hover:w-3">
            <ArrowUpRight className="w-3 h-3 transition-transform duration-300 translate-y-2 -translate-x-2 opacity-0 group-hover:translate-y-0 group-hover:translate-x-0 group-hover:opacity-100" />
          </div>
          <MaskText delay={index * 0.1}>{link.label}</MaskText>
        </a>
      ))}
    </div>
  );
};
