import React from "react";
import { Plus } from "lucide-react";

interface SellerPromoBannerProps {
  onStartSelling: () => void;
  buttonLabel?: string;
  id?: string;
}

export const SellerPromoBanner: React.FC<SellerPromoBannerProps> = ({
  onStartSelling,
  buttonLabel = "Start selling",
  id = "seller-promo-banner",
}) => {
  return (
    <section id={id} className="w-full">
      <div className="w-full rounded-2xl bg-[#2F5D50] dark:bg-[#1E3B33] border border-[#244A3F] dark:border-[#2A4E43] px-6 sm:px-10 lg:px-12 py-9 sm:py-11 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-xl text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#DFC29B]">
            HAVE SOMETHING TO PASS ON?
          </p>
          <h2 className="text-2xl sm:text-[32px] font-normal tracking-tight text-white leading-[1.2]">
            Your unused stuff could be someone&apos;s next favourite.
          </h2>
        </div>

        <div className="shrink-0">
          <button
            id={`${id}-cta-btn`}
            type="button"
            onClick={onStartSelling}
            className="h-11 px-6 rounded-xl bg-[#F4EFE6] hover:bg-white text-[#18201C] text-sm font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[2.25]" />
            <span>{buttonLabel}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
