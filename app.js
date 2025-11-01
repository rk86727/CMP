// Main Application Controller
class App {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.registerServiceWorker();

        // Check authentication
        if (auth.isAuthenticated()) {
            this.showMainApp();
        } else {
            this.showLoginScreen();
        }
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTable(e.target.dataset.table);
            });
        });

        // Contract filter
        document.getElementById('contractFilter').addEventListener('change', (e) => {
            this.filterContracts(e.target.value);
        });

        // Add buttons
        document.getElementById('addContractBtn').addEventListener('click', () => {
            tableManager.addContract();
        });

        // Modal events
        document.querySelector('.close').addEventListener('click', () => {
            tableManager.hideModal();
        });

        document.querySelector('.cancel-btn').addEventListener('click', () => {
            tableManager.hideModal();
        });

        document.getElementById('modalForm').addEventListener('submit', (e) => {
            e.preventDefault();
            if (tableManager.currentModalSave) {
                tableManager.currentModalSave();
            }
        });

        // BoQ contract select
        document.getElementById('boqContractSelect').addEventListener('change', (e) => {
            tableManager.renderBoqTable(e.target.value);
        });

        // Measurement contract select
        document.getElementById('measurementContractSelect').addEventListener('change', (e) => {
            tableManager.renderMeasurementTable(e.target.value);
        });

        // Window click for modal
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('modal');
            if (e.target === modal) {
                tableManager.hideModal();
            }
        });
    }

    handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (auth.login(email, password)) {
            this.showMainApp();
        } else {
            alert('Invalid email or password');
        }
    }

    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            auth.logout();
            this.showLoginScreen();
        }
    }

    showLoginScreen() {
        document.getElementById('loginScreen').classList.add('active');
        document.getElementById('mainApp').classList.remove('active');
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
    }

    showMainApp() {
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('mainApp').classList.add('active');

        // Update user info
        const user = auth.getCurrentUser();
        document.getElementById('currentUser').textContent = `${user.name} (${user.role})`;

        // Show/hide users button based on role
        const usersBtn = document.getElementById('usersBtn');
        if (user.role === 'superadmin') {
            usersBtn.style.display = 'inline-block';
        } else {
            usersBtn.style.display = 'none';
        }

        // Load initial data
        this.loadInitialData();
    }

    loadInitialData() {
        tableManager.renderContractTable();
        tableManager.updateContractFilters();
        this.switchTable('contract');
    }

    switchTable(tableName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.table === tableName) {
                btn.classList.add('active');
            }
        });

        // Hide all tables
        document.querySelectorAll('.table-container').forEach(container => {
            container.classList.remove('active');
        });

        // Show selected table
        switch (tableName) {
            case 'contract':
                document.getElementById('contractTable').classList.add('active');
                tableManager.renderContractTable();
                break;
            case 'bill':
                document.getElementById('billTable').classList.add('active');
                tableManager.renderBillTable();
                break;
            case 'boq':
                document.getElementById('boqTable').classList.add('active');
                const boqContract = document.getElementById('boqContractSelect').value;
                tableManager.renderBoqTable(boqContract);
                break;
            case 'measurement':
                document.getElementById('measurementTable').classList.add('active');
                const measurementContract = document.getElementById('measurementContractSelect').value;
                tableManager.renderMeasurementTable(measurementContract);
                break;
            case 'users':
                if (auth.getCurrentUser().role === 'superadmin') {
                    document.getElementById('usersTable').classList.add('active');
                    tableManager.renderUsersTable();
                }
                break;
        }
    }

    filterContracts(contractNumber) {
        const currentTable = document.querySelector('.nav-btn.active').dataset.table;

        switch (currentTable) {
            case 'contract':
                tableManager.renderContractTable(contractNumber);
                break;
            case 'bill':
                tableManager.renderBillTable(contractNumber);
                break;
        }
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('service-worker.js')
                    .then(registration => {
                        console.log('ServiceWorker registered:', registration);
                    })
                    .catch(err => {
                        console.log('ServiceWorker registration failed:', err);
                    });
            });
        }
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
