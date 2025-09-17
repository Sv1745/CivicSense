/**
 * Offline Mode Service - Handles app functionality when Supabase is unavailable
 */

interface OfflineModeConfig {
  enabled: boolean;
  showBanner: boolean;
  fallbackMessage: string;
}

class OfflineModeService {
  private config: OfflineModeConfig = {
    enabled: false,
    showBanner: true,
    fallbackMessage: 'CivicSense is currently in offline mode. Some features may be limited.'
  };

  private isOnline = true;

  setOnlineStatus(status: boolean) {
    this.isOnline = status;
    this.config.enabled = !status;
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  getConfig(): OfflineModeConfig {
    return { ...this.config };
  }

  // Fallback data when Supabase is unavailable
  getFallbackStats() {
    return {
      totalIssues: 0,
      pendingIssues: 0,
      resolvedIssues: 0,
      totalUsers: 0,
      resolutionRate: 0,
      avgResolutionTime: 0,
      departmentStats: [],
      stateStats: [],
      categoryStats: [],
      recentIssues: []
    };
  }

  getFallbackDepartments() {
    return [
      {
        id: 'offline-1',
        name: 'Service Unavailable',
        description: 'Database connection required',
        contact_email: '',
        contact_phone: '',
        jurisdiction: '',
        state: '',
        city: ''
      }
    ];
  }

  getFallbackCategories() {
    return [
      {
        id: 'offline-1',
        name: 'Service Unavailable',
        description: 'Database connection required',
        color: '#6B7280',
        icon: 'alert-triangle'
      }
    ];
  }

  showOfflineBanner(): boolean {
    return this.config.enabled && this.config.showBanner;
  }

  getOfflineMessage(): string {
    return this.config.fallbackMessage;
  }
}

export const offlineModeService = new OfflineModeService();