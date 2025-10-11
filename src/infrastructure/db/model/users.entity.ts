export type User = {
 telegramId: number;
 username?: string | null;
 firstName: string;
 lastName: string | null;
 languageCode: string | null;
 phoneNumber?: string | null;
 isBot: boolean;    
 createdAt: Date;
 role: string; 
}