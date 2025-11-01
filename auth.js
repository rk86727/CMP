// Authentication Management
class Auth {
    constructor() {
        this.currentUser = null;
        this.checkSession();
    }

    login(email, password) {
        const users = db.getAll('users');
        const user = users.find(u =>
            u.email === email &&
            u.password === password &&
            u.status === 'active'
        );

        if (user) {
            this.currentUser = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            };
            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            return true;
        }
        return false;
    }

    logout() {
        this.currentUser = null;
        sessionStorage.removeItem('currentUser');
    }

    checkSession() {
        const userData = sessionStorage.getItem('currentUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            return true;
        }
        return false;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    hasPermission(action, table) {
        if (!this.currentUser) return false;

        const permissions = {
            superadmin: {
                view: ['contracts', 'bills', 'boq', 'measurements', 'users'],
                add: ['contracts', 'bills', 'boq', 'measurements', 'users'],
                edit: ['contracts', 'bills', 'boq', 'measurements', 'users'],
                delete: ['contracts', 'bills', 'boq', 'measurements', 'users']
            },
            admin: {
                view: ['contracts', 'bills', 'boq', 'measurements'],
                add: ['contracts', 'bills', 'boq', 'measurements'],
                edit: ['contracts', 'bills', 'boq', 'measurements'],
                delete: ['bills', 'boq', 'measurements']
            },
            user: {
                view: ['contracts', 'bills', 'boq', 'measurements'],
                add: ['measurements'],
                edit: ['measurements'],
                delete: []
            }
        };

        const userPermissions = permissions[this.currentUser.role];
        return userPermissions &&
            userPermissions[action] &&
            userPermissions[action].includes(table);
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialize authentication
const auth = new Auth();
