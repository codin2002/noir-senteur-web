
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  fetchPerfume, 
  fetchPerfumeImages, 
  checkWishlistStatus 
} from '@/services/perfumeService';
import { 
  fetchClassificationData, 
  fetchRatingsData 
} from '@/services/perfumeAnalyticsService';
import { 
  Perfume, 
  PerfumeImage, 
  PerfumeClassificationData, 
  PerfumeRatingData 
} from '@/types/perfumeDetail';

export const usePerfumeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [perfumeImages, setPerfumeImages] = useState<PerfumeImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [classificationData, setClassificationData] = useState<PerfumeClassificationData | null>(null);
  const [ratingsData, setRatingsData] = useState<PerfumeRatingData | null>(null);
  const [isLoadingClassification, setIsLoadingClassification] = useState(false);
  const [isLoadingRatings, setIsLoadingRatings] = useState(false);

  console.log('usePerfumeDetail - ID from params:', id);
  console.log('usePerfumeDetail - User:', user);

  const loadPerfume = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    const perfumeData = await fetchPerfume(id);
    setPerfume(perfumeData);
    setLoading(false);
  };

  const loadPerfumeImages = async () => {
    if (!id) return;
    const images = await fetchPerfumeImages(id);
    setPerfumeImages(images);
  };

  const loadClassificationData = async () => {
    if (!id) return;
    
    setIsLoadingClassification(true);
    const data = await fetchClassificationData(id);
    setClassificationData(data);
    setIsLoadingClassification(false);
  };

  const loadRatingsData = async () => {
    if (!id) return;
    
    setIsLoadingRatings(true);
    const data = await fetchRatingsData(id);
    setRatingsData(data);
    setIsLoadingRatings(false);
  };

  const loadWishlistStatus = async () => {
    if (!user || !id) return;
    const status = await checkWishlistStatus(user.id, id);
    setIsInWishlist(status);
  };

  const refreshAnalytics = () => {
    console.log('Refreshing analytics data');
    loadClassificationData();
    loadRatingsData();
  };

  useEffect(() => {
    console.log('Effect triggered - ID:', id, 'User:', user?.id);
    
    if (id) {
      loadPerfume();
      loadPerfumeImages();
      if (user) {
        loadWishlistStatus();
      }
    }
  }, [id, user]);

  useEffect(() => {
    if (id) {
      loadClassificationData();
      loadRatingsData();
    }
  }, [id]);

  useEffect(() => {
    document.title = perfume ? `${perfume.name} | Senteur Fragrances` : "Perfume Details | Senteur Fragrances";
  }, [perfume]);

  return {
    id,
    perfume,
    perfumeImages,
    loading,
    isInWishlist,
    setIsInWishlist,
    classificationData,
    ratingsData,
    isLoadingClassification,
    isLoadingRatings,
    refreshAnalytics
  };
};
