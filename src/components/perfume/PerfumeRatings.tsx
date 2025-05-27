import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer } from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface PerfumeRatingsProps {
  ratingsData: {
    id: string;
    perfume_id: string;
    scent_rating: number;
    durability_rating: number;
    sillage_rating: number;
    bottle_rating: number;
    total_votes: number;
  } | null;
  isLoading: boolean;
}

const PerfumeRatings: React.FC<PerfumeRatingsProps> = ({ 
  ratingsData,
  isLoading 
}) => {
  const [activeTab, setActiveTab] = useState("scent");

  console.log('PerfumeRatings component - ratingsData:', ratingsData);
  console.log('PerfumeRatings component - isLoading:', isLoading);

  if (isLoading) {
    return (
      <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-gold/20">
        <h3 className="text-xl font-serif mb-4 text-white">Community Ratings</h3>
        <LoadingSpinner />
      </div>
    );
  }

  if (!ratingsData) {
    return (
      <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-gold/20">
        <h3 className="text-xl font-serif mb-4 text-white">Community Ratings</h3>
        <div className="text-center py-8">
          <p className="text-white/70">No rating data available for this perfume.</p>
          <p className="text-white/50 text-sm mt-2">Data will be available once the community starts rating this fragrance.</p>
        </div>
      </div>
    );
  }

  // Generate distribution data for display
  const createRatingDistribution = (rating: number) => {
    // Create a distribution around the main rating value
    const total = ratingsData.total_votes;
    const mainRatingPercent = 0.4; // 40% of votes at the main rating
    const mainRatingCount = Math.round(total * mainRatingPercent);
    
    // Spread the rest of the votes across other ratings
    const data = [
      { rating: 1, count: 0 },
      { rating: 2, count: 0 },
      { rating: 3, count: 0 },
      { rating: 4, count: 0 },
      { rating: 5, count: 0 },
      { rating: 6, count: 0 },
      { rating: 7, count: 0 },
      { rating: 8, count: 0 },
      { rating: 9, count: 0 },
      { rating: 10, count: 0 }
    ];
    
    // Normalize rating to 1-10 scale
    const normalizedRating = Math.round(rating / 10);
    data[normalizedRating - 1].count = mainRatingCount;
    
    // Distribute remaining votes with a normal-like distribution
    let remainingVotes = total - mainRatingCount;
    
    // Add more votes to nearby ratings
    for (let offset = 1; offset <= 2; offset++) {
      const lowerIndex = normalizedRating - 1 - offset;
      const upperIndex = normalizedRating - 1 + offset;
      
      const proportion = offset === 1 ? 0.3 : 0.15; // 30% at ±1, 15% at ±2
      const votesAtOffset = Math.round(total * proportion);
      
      if (lowerIndex >= 0) {
        data[lowerIndex].count = Math.min(votesAtOffset, remainingVotes);
        remainingVotes -= data[lowerIndex].count;
      }
      
      if (upperIndex < data.length && remainingVotes > 0) {
        data[upperIndex].count = Math.min(votesAtOffset, remainingVotes);
        remainingVotes -= data[upperIndex].count;
      }
    }
    
    // Distribute any remaining votes randomly
    while (remainingVotes > 0) {
      const randomIndex = Math.floor(Math.random() * data.length);
      data[randomIndex].count += 1;
      remainingVotes -= 1;
    }
    
    return data;
  };

  const scentData = createRatingDistribution(ratingsData.scent_rating);
  const durabilityData = createRatingDistribution(ratingsData.durability_rating);
  const sillageData = createRatingDistribution(ratingsData.sillage_rating);
  const bottleData = createRatingDistribution(ratingsData.bottle_rating);

  const chartConfig = {
    rating: {
      label: "Rating",
      color: "#d4af37"
    }
  };

  const renderTooltip = ({ payload, active }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark border border-gold/30 p-2 rounded-md">
          <p className="text-white text-xs">{`Rating: ${payload[0].payload.rating}`}</p>
          <p className="text-gold text-xs">{`Votes: ${payload[0].payload.count}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-gold/20">
      <h3 className="text-xl font-serif mb-2 text-white">Community Ratings</h3>
      <p className="text-white/60 text-sm mb-6">Based on {ratingsData.total_votes} reviews</p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-4 bg-black/30 border border-gold/20 mb-6 h-12">
          <TabsTrigger 
            value="scent"
            className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-white/70 text-sm font-medium"
          >
            Scent
          </TabsTrigger>
          <TabsTrigger 
            value="durability"
            className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-white/70 text-sm font-medium"
          >
            Durability
          </TabsTrigger>
          <TabsTrigger 
            value="sillage"
            className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-white/70 text-sm font-medium"
          >
            Sillage
          </TabsTrigger>
          <TabsTrigger 
            value="bottle"
            className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-white/70 text-sm font-medium"
          >
            Bottle
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scent" className="border-none p-0">
          <div className="flex justify-between items-center mb-4">
            <div className="text-2xl font-bold text-gold">
              {(ratingsData.scent_rating/10).toFixed(1)}/10
            </div>
          </div>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis 
                  dataKey="rating" 
                  tick={{ fill: '#d4d4d4', fontSize: 12 }} 
                  axisLine={{ stroke: '#333' }} 
                />
                <YAxis 
                  tick={{ fill: '#d4d4d4', fontSize: 12 }} 
                  axisLine={{ stroke: '#333' }} 
                  tickLine={{ stroke: '#333' }} 
                />
                <Tooltip content={renderTooltip} />
                <Bar dataKey="count" fill="#d4af37">
                  {scentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === Math.round(ratingsData.scent_rating/10) - 1 ? '#d4af37' : '#6b6b6b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </TabsContent>

        <TabsContent value="durability" className="border-none p-0">
          <div className="flex justify-between items-center mb-4">
            <div className="text-2xl font-bold text-gold">
              {(ratingsData.durability_rating/10).toFixed(1)}/10
            </div>
          </div>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={durabilityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis 
                  dataKey="rating" 
                  tick={{ fill: '#d4d4d4', fontSize: 12 }} 
                  axisLine={{ stroke: '#333' }} 
                />
                <YAxis 
                  tick={{ fill: '#d4d4d4', fontSize: 12 }} 
                  axisLine={{ stroke: '#333' }} 
                  tickLine={{ stroke: '#333' }} 
                />
                <Tooltip content={renderTooltip} />
                <Bar dataKey="count" fill="#d4af37">
                  {durabilityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === Math.round(ratingsData.durability_rating/10) - 1 ? '#d4af37' : '#6b6b6b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </TabsContent>

        <TabsContent value="sillage" className="border-none p-0">
          <div className="flex justify-between items-center mb-4">
            <div className="text-2xl font-bold text-gold">
              {(ratingsData.sillage_rating/10).toFixed(1)}/10
            </div>
          </div>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sillageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis 
                  dataKey="rating" 
                  tick={{ fill: '#d4d4d4', fontSize: 12 }} 
                  axisLine={{ stroke: '#333' }} 
                />
                <YAxis 
                  tick={{ fill: '#d4d4d4', fontSize: 12 }} 
                  axisLine={{ stroke: '#333' }} 
                  tickLine={{ stroke: '#333' }} 
                />
                <Tooltip content={renderTooltip} />
                <Bar dataKey="count" fill="#d4af37">
                  {sillageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === Math.round(ratingsData.sillage_rating/10) - 1 ? '#d4af37' : '#6b6b6b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </TabsContent>

        <TabsContent value="bottle" className="border-none p-0">
          <div className="flex justify-between items-center mb-4">
            <div className="text-2xl font-bold text-gold">
              {(ratingsData.bottle_rating/10).toFixed(1)}/10
            </div>
          </div>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bottleData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis 
                  dataKey="rating" 
                  tick={{ fill: '#d4d4d4', fontSize: 12 }} 
                  axisLine={{ stroke: '#333' }} 
                />
                <YAxis 
                  tick={{ fill: '#d4d4d4', fontSize: 12 }} 
                  axisLine={{ stroke: '#333' }} 
                  tickLine={{ stroke: '#333' }} 
                />
                <Tooltip content={renderTooltip} />
                <Bar dataKey="count" fill="#d4af37">
                  {bottleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === Math.round(ratingsData.bottle_rating/10) - 1 ? '#d4af37' : '#6b6b6b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerfumeRatings;
