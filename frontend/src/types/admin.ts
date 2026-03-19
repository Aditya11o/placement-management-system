export interface AdminSettingsType {
    allowStudentRegistration: boolean;
    allowRecruiterRegistration: boolean;
    requireApprovalForStudents: boolean;
    requireApprovalForRecruiters: boolean;
    emailNotifications: boolean;
    maintenanceMode: boolean;
    primaryColor: string;
    logoUrl: string;
    sessionExpirationHours: number;
    maxFailedLoginAttempts: number;
    enforcePasswordComplexity: boolean;
    systemWebhookUrl: string;
    tier1SalaryThreshold: number;
    adminIpWhitelist: string[];
    googleCalendarApiKey: string;
    googleCalendarClientId: string;
    microsoftCalendarApiKey: string;
    calendarSyncEnabled: boolean;
    autoScheduleInterviews: boolean;
    faviconUrl: string;
    meshGradientColors: string[];
}
