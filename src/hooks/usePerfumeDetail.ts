
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  fetchPerfume, 
  fetchPerfumeImages, 
  checkWishlistStatus 
} from '@/services/perfumeService';
import { 
  fetchClassificationData
} from '@/services/perfumeAnalyticsService';
import { 
  Perfume, 
  PerfumeImage, 
  PerfumeClassificationData
} from '@/types/perfumeDetail';

export const usePerfumeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [perfumeImages, setPerfumeImages] = useState<PerfumeImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [classificationData, setClassificationData] = useState<PerfumeClassificationData | null>(null);
  const [isLoadingClassification, setIsLoadingClassification] = useState(false);

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

  const loadWishlistStatus = async () => {
    if (!user || !id) return;
    const status = await checkWishlistStatus(user.id, id);
    setIsInWishlist(status);
  };

  const refreshAnalytics = () => {
    console.log('Refreshing classification data');
    loadClassificationData();
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
    isLoadingClassification,
    refreshAnalytics
  };
};
