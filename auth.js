// Authentication Module
const Auth = {
    // Initialize default users
    init() {
        if (!localStorage.getItem('users')) {
            const defaultUsers = [
                {
                    id: 1,
                    email: 'admin@roadconstruction.com',
                    password: 'Admin@123',
                    role: 'superadmin',
                    name: 'Super Admin'
                }
            ];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
        }
    },

    // Login function
    login(email, password) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            const sessionData = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                loginTime: new Date().toISOString()
            };
            sessionStorage.setItem('currentUser', JSON.stringify(sessionData));
            return true;
        }
        return false;
    },

    // Logout function
    logout() {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    },

    // Check if user is logged in
    isAuthenticated() {
        return sessionStorage.getItem('currentUser') !== null;
    },

    // Get current user
    getCurrentUser() {
        const userData = sessionStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    },

    // Check user permissions
    hasPermission(action, table) {
        const user = this.getCurrentUser();
        if (!user) return false;

        const permissions = {
            superadmin: {
                view: ['all'],
                edit: ['all'],
                delete: ['all'],
                create: ['all']
            },
            admin: {
                view: ['all'],
                edit: ['contract', 'bill', 'boq', 'measurement'],
                delete: ['contract', 'bill', 'boq', 'measurement'],
                create: ['contract', 'bill', 'boq', 'measurement']
            },
            user: {
                view: ['all'],
                edit: ['measurement'],
                delete: [],
                create: ['measurement']
            }
        };

        const userPermissions = permissions[user.role];
        if (!userPermissions) return false;

        return userPermissions[action].includes('all') || 
               userPermissions[action].includes(table);
    },

    // Create new user (superadmin only)
    createUser(userData) {
        const currentUser = this.getCurrentUser();
        if (currentUser?.role !== 'superadmin') return false;

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const newUser = {
            id: Date.now(),
            ...userData,
            createdAt: new Date().toISOString(),
            createdBy: currentUser.id
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        return true;
    },

    // Get all users
    getAllUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    },

    // Update user
    updateUser(userId, updates) {
        const currentUser = this.getCurrentUser();
        if (currentUser?.role !== 'superadmin') return false;

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const index = users.findIndex(u => u.id === userId);
        
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            localStorage.setItem('users', JSON.stringify(users));
            return true;
        }
        return false;
    },

    // Delete user
    deleteUser(userId) {
        const currentUser = this.getCurrentUser();
        if (currentUser?.role !== 'superadmin') return false;

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const filtered = users.filter(u => u.id !== userId);
        localStorage.setItem('users', JSON.stringify(filtered));
        return true;
    }
};

// Initialize authentication
Auth.init();
