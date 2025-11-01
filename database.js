// Database Module - LocalStorage based
const Database = {
    // Initialize database
    init() {
        // Initialize tables if not exist
        const tables = ['contracts', 'bills', 'boqs', 'measurements'];
        tables.forEach(table => {
            if (!localStorage.getItem(table)) {
                localStorage.setItem(table, JSON.stringify([]));
            }
        });
    },

    // Generic CRUD operations
    create(table, data) {
        const records = this.getAll(table);
        const newRecord = {
            id: Date.now(),
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: Auth.getCurrentUser()?.id
        };
        records.push(newRecord);
        localStorage.setItem(table, JSON.stringify(records));
        return newRecord;
    },

    getAll(table) {
        return JSON.parse(localStorage.getItem(table) || '[]');
    },

    getById(table, id) {
        const records = this.getAll(table);
        return records.find(r => r.id === id);
    },

    update(table, id, updates) {
        const records = this.getAll(table);
        const index = records.findIndex(r => r.id === id);
        
        if (index !== -1) {
            records[index] = {
                ...records[index],
                ...updates,
                updatedAt: new Date().toISOString(),
                updatedBy: Auth.getCurrentUser()?.id
            };
            localStorage.setItem(table, JSON.stringify(records));
            return records[index];
        }
        return null;
    },

    delete(table, id) {
        const records = this.getAll(table);
        const filtered = records.filter(r => r.id !== id);
        localStorage.setItem(table, JSON.stringify(filtered));
        return true;
    },

    // Get records by contract number
    getByContract(table, contractNumber) {
        const records = this.getAll(table);
        return records.filter(r => r.contractNumber === contractNumber);
    },

    // Calculate days remaining
    calculateDaysRemaining(completionDate) {
        const today = new Date();
        const completion = new Date(completionDate);
        const diffTime = completion - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    },

    // Calculate remaining amount
    calculateRemainingAmount(contractAmount, billPaidAmount) {
        return parseFloat(contractAmount) - parseFloat(billPaidAmount);
    }
};

// Initialize database
Database.init();
