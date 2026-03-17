// Site configuration - maintenance mode managed via admin toggle
// This provides defaults; the admin panel can override via localStorage

const MAINTENANCE_KEY = 'senteur_maintenance_mode';

export const siteConfig = {
  get maintenanceMode(): boolean {
    const stored = localStorage.getItem(MAINTENANCE_KEY);
    // Default to true (under construction) if never set
    return stored === null ? true : stored === 'true';
  },
  set maintenanceMode(value: boolean) {
    localStorage.setItem(MAINTENANCE_KEY, String(value));
  },
};
