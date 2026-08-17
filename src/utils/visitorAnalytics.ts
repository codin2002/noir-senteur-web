import { supabase } from '@/integrations/supabase/client';

const VISITOR_KEY = 'senteur_visitor_id';

export const trackSiteVisit = async () => {
  try {
    let visitorId = localStorage.getItem(VISITOR_KEY);
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, visitorId);
    }

    await supabase.functions.invoke('track-visit', { body: { visitorId } });
  } catch {
    // Visitor measurement must never affect the shopping experience.
  }
};
