// auth.js - Enhanced User Authentication System for Neura
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
    }

    loadUsers() {
        try {
            return JSON.parse(localStorage.getItem('neura_users')) || {};
        } catch (error) {
            console.error('Error loading users:', error);
            return {};
        }
    }

    saveUsers() {
        localStorage.setItem('neura_users', JSON.stringify(this.users));
    }

    async register(email, password, name) {
        await this.delay(1000);
        
        if (this.users[email]) {
            throw new Error('User already exists');
        }

        const userId = 'user_' + Date.now();
        const user = {
            id: userId,
            email: email,
            name: name,
            createdAt: new Date().toISOString(),
            library: []
        };

        this.users[email] = {
            ...user,
            password: btoa(password)
        };

        this.saveUsers();
        this.currentUser = user;
        localStorage.setItem('neura_current_user', JSON.stringify(user));
        
        return user;
    }

    async login(email, password) {
        await this.delay(1000);
        
        const userData = this.users[email];
        if (!userData) {
            throw new Error('User not found');
        }

        if (btoa(password) !== userData.password) {
            throw new Error('Invalid password');
        }

        const user = { ...userData };
        delete user.password;
        
        this.currentUser = user;
        localStorage.setItem('neura_current_user', JSON.stringify(user));
        
        return user;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('neura_current_user');
    }

    getCurrentUser() {
        if (!this.currentUser) {
            try {
                const stored = localStorage.getItem('neura_current_user');
                this.currentUser = stored ? JSON.parse(stored) : null;
            } catch (error) {
                console.error('Error loading current user:', error);
                this.currentUser = null;
            }
        }
        return this.currentUser;
    }

    isAuthenticated() {
        return this.getCurrentUser() !== null;
    }

    getUserLibrary() {
        const user = this.getCurrentUser();
        if (!user) return [];
        
        const userData = this.users[user.email];
        return userData ? userData.library : [];
    }

    saveUserLibrary(library) {
        const user = this.getCurrentUser();
        if (!user) return;

        if (this.users[user.email]) {
            this.users[user.email].library = library;
            this.saveUsers();
        }
    }

    getUserStorageKey(key) {
        const user = this.getCurrentUser();
        if (!user) return key;
        return `${user.id}_${key}`;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

window.auth = new AuthSystem();
