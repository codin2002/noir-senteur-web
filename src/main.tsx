import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { trackSiteVisit } from './utils/visitorAnalytics'

createRoot(document.getElementById("root")!).render(<App />);
void trackSiteVisit();
