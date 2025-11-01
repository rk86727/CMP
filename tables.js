// Main Application Module
const App = {
    init() {
        // Check authentication
        if (!Auth.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }

        // Setup UI
        this.setupUI();
        this.setupEventListeners();
        
        // Load initial data
        Tables.renderTable('contract');
        Tables.updateContractFilter();
        
        // Register service worker for PWA
        this.registerServiceWorker();
    },

    setupUI() {
        const user = Auth.getCurrentUser();
        
        // Display user info
        document.getElementById('currentUser').textContent = `${user.name} (${user.role})`;
        
        // Show/hide user management tab for superadmin
        if (user.role === 'superadmin') {
            document.getElementById('usersTab').style.display = 'block';
        }
        
        // Set permissions for add button
        this.updateAddButton('contract');
    },

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tableName = e.target.dataset.table;
                this.switchTable(tableName);
            });
        });

        // Add new button
        document.getElementById('addNewBtn').addEventListener('click', () => {
            const currentTable = Tables.currentTable;
            if (Auth.hasPermission('create', currentTable)) {
                Tables.showForm(currentTable);
            } else {
                alert('You do not have permission to create records in this table');
            }
        });

        // Contract filter
        document.getElementById('contractFilter').addEventListener('change', () => {
            Tables.renderTable(Tables.currentTable);
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                Auth.logout();
            }
        });

        // Modal close button
        document.querySelector('.close').addEventListener('click', () => {
            Tables.closeModal();
        });

        // Modal cancel button
        document.getElementById('cancelBtn').addEventListener('click', () => {
            Tables.closeModal();
        });

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('modal');
            if (e.target === modal) {
                Tables.closeModal();
            }
        });

        // Handle window resize for responsive design
        window.addEventListener('resize', () => {
            this.handleResponsive();
        });
    },

    switchTable(tableName) {
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.table === tableName) {
                btn.classList.add('active');
            }
        });

        // Update current table
        Tables.currentTable = tableName;
        
        // Render new table
        Tables.renderTable(tableName);
        
        // Update add button visibility
        this.updateAddButton(tableName);
    },

    updateAddButton(tableName) {
        const addBtn = document.getElementById('addNewBtn');
        const user = Auth.getCurrentUser();
        
        if (Auth.hasPermission('create', tableName)) {
            addBtn.style.display = 'block';
        } else {
            addBtn.style.display = 'none';
        }
    },

    handleResponsive() {
        const width = window.innerWidth;
        const tableWrapper = document.querySelector('.table-wrapper');
        
        if (width < 768) {
            // Mobile view adjustments
            if (tableWrapper) {
                tableWrapper.style.overflowX = 'auto';
            }
        } else {
            // Desktop view adjustments
            if (tableWrapper) {
                tableWrapper.style.overflowX = 'visible';
            }
        }
    },

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
