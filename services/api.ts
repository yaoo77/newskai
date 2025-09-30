
import { User, UserRole, Profile, UserProgress, Testimonial, EventType } from '../types';

// --- MOCK DATABASE ---
let users: User[] = [
    { id: 'user-1', email: 'member@example.com', name: 'Aoi Member', role: UserRole.MEMBER, createdAt: new Date().toISOString() },
    { id: 'user-2', email: 'admin@example.com', name: 'Kanri Admin', role: UserRole.ADMIN, createdAt: new Date().toISOString() },
];

let profiles: Profile[] = [
    { userId: 'user-1', displayName: 'アオイ', avatarUrl: `https://picsum.photos/seed/user-1/200`, xHandle: 'aoi_dev', finxUsername: 'aoi', finxRefUrl: 'https://finx.example.com/invite/aoi123' },
    { userId: 'user-2', displayName: '管理者', avatarUrl: `https://picsum.photos/seed/user-2/200`, xHandle: 'admin_user', finxUsername: 'admin' },
];

let events: any[] = [
    { id: 'evt-1', userId: 'user-1', type: EventType.NOTE_SUBMIT, payload: { url: 'https://example.com/note1', title: 'My First Note' }, createdAt: new Date().toISOString() },
    { id: 'evt-2', userId: 'user-1', type: EventType.OFFSITE_PARTICIPATE, payload: {}, createdAt: new Date().toISOString() },
    { id: 'evt-3', userId: 'user-1', type: EventType.DAILY_DECLARATION, payload: {}, createdAt: new Date().toISOString() },
];

let testimonials: Testimonial[] = [
    { id: 'test-1', userId: 'user-1', userDisplayName: 'アオイ', userAvatarUrl: `https://picsum.photos/seed/user-1/200`, text: 'もくよう会、最高です！', isApproved: true, createdAt: new Date().toISOString() },
    { id: 'test-2', userId: 'user-2', userDisplayName: '管理者', userAvatarUrl: `https://picsum.photos/seed/user-2/200`, text: '運営からのメッセージです。', isApproved: false, createdAt: new Date().toISOString() },
];

let adjustments: any[] = [
    { id: 'adj-1', targetUserId: 'user-1', metric: 'FINX_POSTS', delta: 10, adminUserId: 'user-2', createdAt: new Date().toISOString() }
];

// --- API FUNCTIONS ---
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const api = {
    async loginWithGoogle(): Promise<User> {
        await delay(500);
        // In a real app, this would be a real auth call.
        // We'll just return the default member user.
        const user = users.find(u => u.role === UserRole.MEMBER);
        if (!user) throw new Error("No member user found");
        return user;
    },

    async logout(): Promise<void> {
        await delay(300);
        return;
    },

    async getProfile(userId: string): Promise<Profile | undefined> {
        await delay(300);
        return profiles.find(p => p.userId === userId);
    },

    async updateProfile(userId: string, data: Partial<Profile>): Promise<Profile> {
        await delay(700);
        const profileIndex = profiles.findIndex(p => p.userId === userId);
        if (profileIndex === -1) throw new Error("Profile not found");
        profiles[profileIndex] = { ...profiles[profileIndex], ...data };
        return profiles[profileIndex];
    },

    async getUserProgress(userId: string): Promise<UserProgress> {
        await delay(500);
        const userEvents = events.filter(e => e.userId === userId);

        const isTodayJST = (dateString: string) => {
            const date = new Date(dateString);
            const today = new Date();
            // Simple check, not perfect for all timezones but good for mock.
            return date.getFullYear() === today.getFullYear() &&
                   date.getMonth() === today.getMonth() &&
                   date.getDate() === today.getDate();
        };

        return {
            userId,
            notesCount: userEvents.filter(e => e.type === EventType.NOTE_SUBMIT).length,
            offsiteCount: userEvents.filter(e => e.type === EventType.OFFSITE_PARTICIPATE).length,
            ltWinCount: userEvents.filter(e => e.type === EventType.LT_WIN).length,
            finxPostsCount: adjustments.filter(a => a.targetUserId === userId && a.metric === 'FINX_POSTS').reduce((sum, a) => sum + a.delta, 0),
            invitesCount: userEvents.filter(e => e.type === EventType.INVITE_SELF_REPORT).length,
            dailyDeclarationCount: userEvents.filter(e => e.type === EventType.DAILY_DECLARATION && isTodayJST(e.createdAt)).length,
            dailyDeclarationStreak: 1, // Mock data
            xShareCount: userEvents.filter(e => e.type === EventType.X_SHARE).length,
            finxProfileEditCount: userEvents.filter(e => e.type === EventType.FINX_PROFILE_EDIT).length,
            finxIntroPostCount: userEvents.filter(e => e.type === EventType.FINX_INTRO_POST).length,
        };
    },

    async submitEvent(userId: string, type: EventType, payload: object = {}): Promise<any> {
        await delay(600);
        const newEvent = {
            id: `evt-${Date.now()}`,
            userId,
            type,
            payload,
            createdAt: new Date().toISOString(),
        };
        events.push(newEvent);
        return newEvent;
    },
    
    async submitTestimonial(userId: string, text: string): Promise<Testimonial> {
        await delay(800);
        const profile = await this.getProfile(userId);
        if(!profile) throw new Error("Profile not found");
        const newTestimonial: Testimonial = {
            id: `test-${Date.now()}`,
            userId,
            text,
            isApproved: false,
            createdAt: new Date().toISOString(),
            userDisplayName: profile.displayName,
            userAvatarUrl: profile.avatarUrl
        };
        testimonials.push(newTestimonial);
        return newTestimonial;
    },

    async getPublicTestimonials(): Promise<Testimonial[]> {
        await delay(400);
        return testimonials.filter(t => t.isApproved);
    }
};
