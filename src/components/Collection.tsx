
import React from 'react';
import PerfumeCard from './PerfumeCard';

const Collection = () => {
  const perfumes = [
    {
      id: "1", // Added ID for each perfume
      name: "Noir Mystique",
      notes: "Oud • Amber • Vanilla",
      description: "An intoxicating blend that opens with warm spices and evolves into a rich heart of amber and oud, finally settling into a velvety base of vanilla and musk.",
      image: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?q=80&w=1976",
      price: "$240"
    },
    {
      id: "2", // Added ID
      name: "Vespera",
      notes: "Bergamot • Rose • Patchouli",
      description: "A sophisticated floral fragrance that captures the essence of dusk with delicate notes of bergamot, rose, and a subtle undertone of patchouli.",
      image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1974",
      price: "$220",
    },
    {
      id: "3", // Added ID
      name: "Bois Nocturne",
      notes: "Cedar • Vetiver • Leather",
      description: "A bold and distinctive scent that combines the freshness of cedar with the earthy depth of vetiver and the warm richness of leather.",
      image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1974",
      price: "$260"
    }
  ];

  return (
    <section id="collection" className="section bg-dark">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-sm uppercase tracking-widest text-gold mb-3">Our Collection</h2>
          <h3 className="text-4xl md:text-5xl font-serif mb-4">Signature Fragrances</h3>
          <div className="w-24 h-0.5 bg-gold mx-auto"></div>
        </div>

        <div className="space-y-24">
          {perfumes.map((perfume, index) => (
            <PerfumeCard
              key={perfume.id}
              id={perfume.id} // Pass the ID
              name={perfume.name}
              notes={perfume.notes}
              description={perfume.description}
              image={perfume.image}
              price={perfume.price}
              invert={index % 2 !== 0}
              delay={index * 200}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Collection;
