import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Perfume } from '@/types/perfume';
import { OFFERS } from '@/utils/constants';

interface SignatureDuoCardProps {
  products: Perfume[];
}

const SignatureDuoCard: React.FC<SignatureDuoCardProps> = ({ products }) => {
  const navigate = useNavigate();
  const isPreorder = products.some((product: any) => Number(product.stock_quantity) <= 0);

  return (
    <article
      className="group col-span-1 flex cursor-pointer flex-col"
      onClick={() => navigate('/offers/signature-duo')}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src="/images/signature-duo-together.png"
          alt="Senteur 313 and 424 Signature Duo"
          className="h-full w-full object-cover brightness-110 transition duration-700 group-hover:scale-[1.03]"
        />
        <span className="absolute left-1/2 top-3 -translate-x-1/2 whitespace-nowrap rounded-full border border-gold/30 bg-black/80 px-3 py-1 text-[9px] uppercase tracking-[0.18em] text-gold">
          Save AED {OFFERS.SIGNATURE_DUO.SAVINGS}
        </span>
        {isPreorder && (
          <span className="absolute right-2 top-2 bg-gold px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-black">
            Preorder
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col items-center text-center">
        <p className="flex min-h-[2.5rem] items-center justify-center text-xs uppercase tracking-widest text-accent">
          Two fragrances
        </p>
        <h3
          className="mt-1 flex items-center justify-center gap-3 font-serif text-lg font-light tracking-[0.12em] text-white/90 md:text-xl"
          dir="ltr"
          aria-label="313 and 424"
        >
          <span>٣١٣</span>
          <span className="font-sans text-sm font-light text-gold/70">+</span>
          <span>٤٢٤</span>
        </h3>
        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/45">2 × 100 ml</p>
        <div className="mt-1 flex items-center gap-2 text-sm">
          <span className="text-white/35 line-through">AED {OFFERS.SIGNATURE_DUO.REGULAR_PRICE}</span>
          <span className="text-accent">AED {OFFERS.SIGNATURE_DUO.PRICE}</span>
        </div>
        <p className={`mt-1 text-[10px] uppercase tracking-widest text-gold ${isPreorder ? '' : 'invisible'}`}>
          Out of stock
        </p>
        <button
          className="btn-outline mt-3 whitespace-nowrap px-4 py-2 text-[10px]"
          onClick={(event) => {
            event.stopPropagation();
            navigate('/offers/signature-duo');
          }}
        >
          {isPreorder ? 'View preorder' : 'Buy both'}
        </button>
      </div>
    </article>
  );
};

export default SignatureDuoCard;
