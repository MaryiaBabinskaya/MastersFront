import { type User, type InsertUser } from "@shared/models/auth";

export interface IAuthStorage {
    getUser(id: string): Promise<User | undefined>;
    upsertUser(user: InsertUser & { id: string }): Promise<User>;
    getAllUsers(): Promise<User[]>;
}

class AuthStorage implements IAuthStorage {
    private users: Map<string, User> = new Map();

    async getUser(id: string): Promise<User | undefined> {
        return this.users.get(id);
    }

    async upsertUser(userData: InsertUser & { id: string; createdAt?: Date }): Promise<User> {
        const existingUser = this.users.get(userData.id);

        const user: User = {
            id: userData.id,
            username: userData.username,
            displayName: userData.displayName,
            email: userData.email ?? null,
            passwordHash: userData.passwordHash ?? null,
            avatarUrl: userData.avatarUrl ?? null,
            createdAt: existingUser?.createdAt ?? userData.createdAt ?? new Date(),
            lastLoginAt: new Date(),
        };

        this.users.set(userData.id, user);
        return user;
    }

    async getAllUsers(): Promise<User[]> {
        return Array.from(this.users.values());
    }
}

export const authStorage = new AuthStorage();