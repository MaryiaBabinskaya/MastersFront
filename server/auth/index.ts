import express from "express";
import session from "express-session";
import passport from "passport";
import bcrypt from "bcrypt";
import { authStorage } from "./storage";

export async function setupAuth(app: express.Express): Promise<void> {
    app.use(session({
        secret: process.env.SESSION_SECRET || 'dev-session-secret',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
        try {
            let user = await authStorage.getUser(id);
            if (user && id.startsWith("backend-")) {
                const backendUserId = id.replace("backend-", "");
                try {
                    const backendResponse = await fetch(`http://localhost:8080/api/v1/users/${backendUserId}`);
                    if (backendResponse.ok) {
                        const backendUser = await backendResponse.json();
                        const avatarUrl = user.avatarUrl === null ? null : backendUser.avatarUrl;

                        user = await authStorage.upsertUser({
                            id: id,
                            username: user.username,
                            avatarUrl: avatarUrl,
                            createdAt: user.createdAt || undefined,
                            displayName: user.displayName,
                            email: user.email,
                        });
                    }
                } catch (err) {
                    // Continue with stale local data if backend fetch fails
                }
            }
            done(null, user);
        } catch (err) {
            done(err);
        }
    });
}

export function registerAuthRoutes(app: express.Express): void {
    app.post('/api/auth/register', async (req, res) => {
        try {
            const { nickname, email, password } = req.body;

            if (!nickname || !email || !password) {
                return res.status(400).json({ error: 'Nickname, email, and password are required' });
            }

            let registerResponse: Response;
            try {
                registerResponse = await fetch('http://localhost:8080/api/v1/users/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nickname, email, password }),
                });
            } catch (err: any) {
                return res.status(503).json({
                    error: 'Authentication service unavailable.',
                    code: 'BACKEND_UNAVAILABLE'
                });
            }

            const data: any = await registerResponse.json().catch(() => ({}));

            if (registerResponse.status === 409) {
                const msg: string = (data.error || data.message || '').toLowerCase();
                if (msg.includes('nickname')) {
                    return res.status(409).json({ error: 'Nickname already taken.', code: 'NICKNAME_TAKEN' });
                }
                return res.status(409).json({ error: 'Email already registered.', code: 'EMAIL_TAKEN' });
            }

            if (!registerResponse.ok) {
                return res.status(registerResponse.status).json({
                    error: data.error || data.message || 'Registration failed.',
                    code: 'REGISTRATION_FAILED'
                });
            }

            res.status(201).json({ message: 'Registered successfully.' });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    app.post('/api/auth/login', async (req, res) => {
        try {
            const { nickname, email, password } = req.body;

            if (!nickname || !email || !password) {
                return res.status(400).json({ error: 'Nickname, email, and password are required' });
            }
            let backendUser: any = null;
            try {
                const exactResponse = await fetch(`http://localhost:8080/api/v1/users/email/${encodeURIComponent(email)}`);
                if (exactResponse.ok) {
                    backendUser = await exactResponse.json();
                } else if (exactResponse.status === 404) {
                    const allResponse = await fetch('http://localhost:8080/api/v1/users');
                    if (allResponse.ok) {
                        const allUsers: any[] = await allResponse.json();
                        backendUser = allUsers.find((u: any) =>
                            u.email?.toLowerCase() === email.toLowerCase()
                        ) || null;
                    }
                } else {
                    return res.status(500).json({
                        error: 'Authentication failed. Please try again.',
                        code: 'AUTH_ERROR'
                    });
                }

                if (!backendUser) {
                    return res.status(401).json({
                        error: 'User not found. Please register first.',
                        code: 'USER_NOT_FOUND'
                    });
                }
                if (backendUser.nickname?.toLowerCase() !== nickname.toLowerCase()) {
                    return res.status(401).json({
                        error: 'Invalid nickname for this email.',
                        code: 'INVALID_CREDENTIALS'
                    });
                }
            } catch (backendError: any) {
                if (backendError.cause?.code === 'ECONNREFUSED' || backendError.message?.includes('fetch failed')) {
                    return res.status(503).json({
                        error: 'Authentication service unavailable. Please try again later.',
                        code: 'BACKEND_UNAVAILABLE'
                    });
                }
                return res.status(500).json({
                    error: 'Authentication failed. Please try again.',
                    code: 'AUTH_ERROR'
                });
            }
            const userId: string = backendUser.id ? `backend-${backendUser.id}` : `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            const existingLocalUser = await authStorage.getUser(userId);

            let passwordHash;

            if (!existingLocalUser || !existingLocalUser.passwordHash) {
                try {
                    const loginResponse = await fetch('http://localhost:8080/api/v1/users/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ nickname: backendUser.nickname, email: backendUser.email, password }),
                    });

                    if (!loginResponse.ok) {
                        const errorData: any = await loginResponse.json();
                        return res.status(401).json({
                            error: errorData.error || 'Invalid credentials.',
                            code: 'INVALID_CREDENTIALS'
                        });
                    }
                    passwordHash = await bcrypt.hash(password, 10);
                } catch (backendError) {
                    return res.status(500).json({
                        error: 'Authentication failed. Please try again.',
                        code: 'AUTH_ERROR'
                    });
                }
            } else {
                const isPasswordValid = await bcrypt.compare(password, existingLocalUser.passwordHash);
                if (!isPasswordValid) {
                    return res.status(401).json({
                        error: 'Invalid password.',
                        code: 'INVALID_CREDENTIALS'
                    });
                }
                passwordHash = existingLocalUser.passwordHash;
            }
            const avatarUrl: any = (existingLocalUser && existingLocalUser.avatarUrl === null)
                ? null // Preserve local null choice (user chose default avatar)
                : (backendUser.avatarUrl || null); // Otherwise use backend value

            const user: any = await authStorage.upsertUser({
                id: userId,
                username: nickname,
                displayName: nickname,
                email: email,
                passwordHash: passwordHash, // Use the verified password hash
                avatarUrl: avatarUrl,
                createdAt: backendUser.createdAt ? new Date(backendUser.createdAt) : undefined
            });
            req.login(user, (err: any) => {
                if (err) {
                    return res.status(500).json({ error: 'Login failed' });
                }
                res.json({ user });
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.get('/api/auth/user', async (req, res) => {
        res.json({ user: req.user || null });
    });

    app.post('/api/auth/logout', (req, res) => {
        req.logout((err: any) => {
            if (err) {
                return res.status(500).json({ error: 'Logout failed' });
            }
            res.json({ message: 'Logged out successfully' });
        });
    });

    app.get('/api/auth/logout', (req, res) => {
        req.logout((err: any) => {
            if (err) {
                return res.redirect('/');
            }
            res.redirect('/');
        });
    });
}

export function isAuthenticated(req: any, res: any, next: any): void {
    if (req.user) {
        req.user.claims = { sub: req.user.id };
        return next();
    }
    res.status(401).json({message: "Authentication required"});
}