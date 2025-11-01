// Database Management using LocalStorage
class Database {
    constructor() {
        this.initializeDatabase();
    }

    initializeDatabase() {
        // Initialize default superadmin if not exists
        if (!localStorage.getItem('users')) {
            const defaultUsers = [{
                id: 1,
                email: 'admin@rcm.com',
                password: 'admin123', // In production, use proper hashing
                name: 'Super Admin',
                role: 'superadmin',
                status: 'active'
            }];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
        }

        // Initialize other tables if not exist
        if (!localStorage.getItem('contracts')) {
            localStorage.setItem('contracts', JSON.stringify([]));
        }
        if (!localStorage.getItem('bills')) {
            localStorage.setItem('bills', JSON.stringify([]));
        }
        if (!localStorage.getItem('boq')) {
            localStorage.setItem('boq', JSON.stringify([]));
        }
        if (!localStorage.getItem('measurements')) {
            localStorage.setItem('measurements', JSON.stringify([]));
        }
    }

    // Generic CRUD operations
    getAll(table) {
        const data = localStorage.getItem(table);
        return data ? JSON.parse(data) : [];
    }

    getById(table, id) {
        const data = this.getAll(table);
        return data.find(item => item.id === id);
    }

    getByField(table, field, value) {
        const data = this.getAll(table);
        return data.filter(item => item[field] === value);
    }

    add(table, item) {
        const data = this.getAll(table);
        const newItem = {
            ...item,
            id: this.generateId(table),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        data.push(newItem);
        localStorage.setItem(table, JSON.stringify(data));
        return newItem;
    }

    update(table, id, updates) {
        const data = this.getAll(table);
        const index = data.findIndex(item => item.id === id);
        if (index !== -1) {
            data[index] = {
                ...data[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem(table, JSON.stringify(data));
            return data[index];
        }
        return null;
    }

    delete(table, id) {
        const data = this.getAll(table);
        const filtered = data.filter(item => item.id !== id);
        localStorage.setItem(table, JSON.stringify(filtered));
        return filtered.length < data.length;
    }

    generateId(table) {
        const data = this.getAll(table);
        if (data.length === 0) return 1;
        const maxId = Math.max(...data.map(item => item.id || 0));
        return maxId + 1;
    }

    // Contract specific methods
    getContractNumbers() {
        const contracts = this.getAll('contracts');
        return contracts.map(c => ({
            number: c.contractNumber,
            name: c.contractName
        }));
    }

    calculateDaysRemaining(completionDate) {
        if (!completionDate) return 'N/A';
        const today = new Date();
        const completion = new Date(completionDate);
        const diffTime = completion - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }

    // Bill specific methods
    calculateRemainingAmount(contractNumber) {
        const contracts = this.getAll('contracts');
        const bills = this.getAll('bills');

        const contract = contracts.find(c => c.contractNumber === contractNumber);
        const contractBills = bills.filter(b => b.contractNumber === contractNumber);

        if (!contract) return 0;

        const contractAmount = parseFloat(contract.agreementAmount || 0);
        const totalPaid = contractBills.reduce((sum, bill) =>
            sum + parseFloat(bill.billAmount || 0), 0);

        return contractAmount - totalPaid;
    }

    // BoQ specific methods
    calculateBoqAmount(quantity, rate) {
        return (parseFloat(quantity) || 0) * (parseFloat(rate) || 0);
    }

    // Measurement specific methods
    calculateMeasurementQuantity(no, length, breadth, height) {
        return (parseFloat(no) || 1) *
            (parseFloat(length) || 0) *
            (parseFloat(breadth) || 1) *
            (parseFloat(height) || 1);
    }

    // Export data
    exportData() {
        const data = {
            users: this.getAll('users'),
            contracts: this.getAll('contracts'),
            bills: this.getAll('bills'),
            boq: this.getAll('boq'),
            measurements: this.getAll('measurements'),
            exportDate: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    }

    // Import data
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.users) localStorage.setItem('users', JSON.stringify(data.users));
            if (data.contracts) localStorage.setItem('contracts', JSON.stringify(data.contracts));
            if (data.bills) localStorage.setItem('bills', JSON.stringify(data.bills));
            if (data.boq) localStorage.setItem('boq', JSON.stringify(data.boq));
            if (data.measurements) localStorage.setItem('measurements', JSON.stringify(data.measurements));
            return true;
        } catch (error) {
            console.error('Import failed:', error);
            return false;
        }
    }
}

// Initialize database
const db = new Database();
