// Table Management
class TableManager {
    constructor() {
        this.currentTable = 'contract';
        this.currentContract = null;
        this.editingItem = null;
    }

    // Render Contract Table
    renderContractTable(filter = '') {
        const tbody = document.querySelector('#contractDataTable tbody');
        tbody.innerHTML = '';

        let contracts = db.getAll('contracts');
        if (filter) {
            contracts = contracts.filter(c => c.contractNumber === filter);
        }

        contracts.forEach((contract, index) => {
            const daysRemaining = db.calculateDaysRemaining(contract.extendedCompletionDate || contract.originalCompletionDate);
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${contract.contractNumber || ''}</td>
                <td>${contract.contractName || ''}</td>
                <td>${contract.contractor || ''}</td>
                <td>${contract.district || ''}</td>
                <td>${contract.component || ''}</td>
                <td>${contract.budgetHead || ''}</td>
                <td>${contract.budgetAmount || ''}</td>
                <td>${contract.estimatedAmount || ''}</td>
                <td>${contract.agreementAmount || ''}</td>
                <td>${contract.contractAmountVO || ''}</td>
                <td>${contract.agreementDate || ''}</td>
                <td>${contract.originalCompletionDate || ''}</td>
                <td>${contract.extendedCompletionDate || ''}</td>
                <td>${daysRemaining}</td>
                <td>${contract.pbDate || ''}</td>
                <td>${contract.insuranceDate || ''}</td>
                <td>
                    <div class="action-buttons">
                        ${auth.hasPermission('edit', 'contracts') ?
                    `<button class="edit-btn" onclick="tableManager.editContract(${contract.id})">Edit</button>` : ''}
                        ${auth.hasPermission('delete', 'contracts') ?
                    `<button class="delete-btn" onclick="tableManager.deleteContract(${contract.id})">Delete</button>` : ''}
                    </div>
                </td>
            `;

            // Add double-click event
            row.addEventListener('dblclick', () => this.editContract(contract.id));
        });
    }

    // Render Bill Table
    renderBillTable(filter = '') {
        const tbody = document.querySelector('#billDataTable tbody');
        tbody.innerHTML = '';

        let bills = db.getAll('bills');
        if (filter) {
            bills = bills.filter(b => b.contractNumber === filter);
        }

        bills.forEach((bill, index) => {
            const remainingAmount = db.calculateRemainingAmount(bill.contractNumber);
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${bill.contractNumber || ''}</td>
                <td>${bill.numberOfBills || ''}</td>
                <td>${bill.billPaidToDate || ''}</td>
                <td>${remainingAmount.toFixed(2)}</td>
                <td>${bill.siteEngineer || ''}</td>
                <td>${bill.subEngineer1 || ''}</td>
                <td>${bill.subEngineer2 || ''}</td>
                <td>${bill.subEngineer3 || ''}</td>
                <td>${bill.subEngineer4 || ''}</td>
                <td>
                    <div class="action-buttons">
                        ${auth.hasPermission('edit', 'bills') ?
                    `<button class="edit-btn" onclick="tableManager.editBill(${bill.id})">Edit</button>` : ''}
                        ${auth.hasPermission('delete', 'bills') ?
                    `<button class="delete-btn" onclick="tableManager.deleteBill(${bill.id})">Delete</button>` : ''}
                    </div>
                </td>
            `;

            row.addEventListener('dblclick', () => this.editBill(bill.id));
        });
    }

    // Render BoQ Table
    renderBoqTable(contractNumber = '') {
        const tbody = document.querySelector('#boqDataTable tbody');
        tbody.innerHTML = '';

        if (!contractNumber) return;

        const boqItems = db.getByField('boq', 'contractNumber', contractNumber);

        boqItems.forEach((item, index) => {
            const amount = db.calculateBoqAmount(item.quantity, item.contractRate);
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.description || ''}</td>
                <td>${item.unit || ''}</td>
                <td>${item.quantity || ''}</td>
                <td>${item.contractRate || ''}</td>
                <td>${amount.toFixed(2)}</td>
                <td>${item.remarks || ''}</td>
                <td>
                    <div class="action-buttons">
                        ${auth.hasPermission('edit', 'boq') ?
                    `<button class="edit-btn" onclick="tableManager.editBoq(${item.id})">Edit</button>` : ''}
                        ${auth.hasPermission('delete', 'boq') ?
                    `<button class="delete-btn" onclick="tableManager.deleteBoq(${item.id})">Delete</button>` : ''}
                    </div>
                </td>
            `;

            row.addEventListener('dblclick', () => this.editBoq(item.id));
        });
    }

    // Render Measurement Table
    renderMeasurementTable(contractNumber = '') {
        const tbody = document.querySelector('#measurementDataTable tbody');
        tbody.innerHTML = '';

        if (!contractNumber) return;

        const measurements = db.getByField('measurements', 'contractNumber', contractNumber);

        measurements.forEach((item, index) => {
            const quantity = db.calculateMeasurementQuantity(
                item.no, item.length, item.breadth, item.height
            );
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.structure || ''}</td>
                <td>${item.chainage || ''}</td>
                <td>${item.description || ''}</td>
                <td>${item.unit || ''}</td>
                <td>${item.no || ''}</td>
                <td>${item.length || ''}</td>
                <td>${item.breadth || ''}</td>
                <td>${item.height || ''}</td>
                <td>${quantity.toFixed(3)}</td>
                <td>${item.location ? `📍 ${item.location.lat}, ${item.location.lng}` : ''}</td>
                <td>
                    <div class="action-buttons">
                        ${auth.hasPermission('edit', 'measurements') ?
                    `<button class="edit-btn" onclick="tableManager.editMeasurement(${item.id})">Edit</button>` : ''}
                        ${auth.hasPermission('delete', 'measurements') ?
                    `<button class="delete-btn" onclick="tableManager.deleteMeasurement(${item.id})">Delete</button>` : ''}
                    </div>
                </td>
            `;

            row.addEventListener('dblclick', () => this.editMeasurement(item.id));
        });
    }

    // Render Users Table
    renderUsersTable() {
        const tbody = document.querySelector('#usersDataTable tbody');
        tbody.innerHTML = '';

        const users = db.getAll('users');

        users.forEach((user, index) => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${user.email || ''}</td>
                <td>${user.name || ''}</td>
                <td>${user.role || ''}</td>
                <td><span class="badge badge-${user.status}">${user.status || ''}</span></td>
                <td>
                    <div class="action-buttons">
                        ${auth.hasPermission('edit', 'users') ?
                    `<button class="edit-btn" onclick="tableManager.editUser(${user.id})">Edit</button>` : ''}
                        ${auth.hasPermission('delete', 'users') && user.role !== 'superadmin' ?
                    `<button class="delete-btn" onclick="tableManager.deleteUser(${user.id})">Delete</button>` : ''}
                    </div>
                </td>
            `;

            row.addEventListener('dblclick', () => this.editUser(user.id));
        });
    }

    // Edit Contract
    editContract(id) {
        if (!auth.hasPermission('edit', 'contracts')) {
            alert('You do not have permission to edit contracts');
            return;
        }

        this.editingItem = db.getById('contracts', id);
        this.showModal('Edit Contract', this.getContractForm(), () => {
            this.saveContract();
        });
    }

    // Add Contract
    addContract() {
        if (!auth.hasPermission('add', 'contracts')) {
            alert('You do not have permission to add contracts');
            return;
        }

        this.editingItem = null;
        this.showModal('Add Contract', this.getContractForm(), () => {
            this.saveContract();
        });
    }

    // Save Contract
    saveContract() {
        const formData = this.getFormData();

        if (this.editingItem) {
            db.update('contracts', this.editingItem.id, formData);
        } else {
            db.add('contracts', formData);
        }

        this.renderContractTable();
        this.updateContractFilters();
        this.hideModal();
    }

    // Delete Contract
    deleteContract(id) {
        if (!auth.hasPermission('delete', 'contracts')) {
            alert('You do not have permission to delete contracts');
            return;
        }

        if (confirm('Are you sure you want to delete this contract?')) {
            db.delete('contracts', id);
            this.renderContractTable();
            this.updateContractFilters();
        }
    }

    // Similar methods for Bills, BoQ, Measurements, and Users...
    // (Implementation follows same pattern)

    // Get Contract Form HTML
    getContractForm() {
        const contract = this.editingItem || {};
        return `
            <div class="form-group">
                <label>Contract Number *</label>
                <input type="text" name="contractNumber" value="${contract.contractNumber || ''}" required>
            </div>
            <div class="form-group">
                <label>Contract Name *</label>
                <input type="text" name="contractName" value="${contract.contractName || ''}" required>
            </div>
            <div class="form-group">
                <label>Contractor</label>
                <input type="text" name="contractor" value="${contract.contractor || ''}">
            </div>
            <div class="form-group">
                <label>District</label>
                <input type="text" name="district" value="${contract.district || ''}">
            </div>
            <div class="form-group">
                <label>Component</label>
                <input type="text" name="component" value="${contract.component || ''}">
            </div>
            <div class="form-group">
                <label>Budget Head</label>
                <input type="text" name="budgetHead" value="${contract.budgetHead || ''}">
            </div>
            <div class="form-group">
                <label>Budget Amount</label>
                <input type="number" step="0.01" name="budgetAmount" value="${contract.budgetAmount || ''}">
            </div>
            <div class="form-group">
                <label>Estimated Amount (with VAT and PS)</label>
                <input type="number" step="0.01" name="estimatedAmount" value="${contract.estimatedAmount || ''}">
            </div>
            <div class="form-group">
                <label>Agreement Amount (with VAT and PS)</label>
                <input type="number" step="0.01" name="agreementAmount" value="${contract.agreementAmount || ''}">
            </div>
            <div class="form-group">
                <label>Contract Amount with VO</label>
                <input type="number" step="0.01" name="contractAmountVO" value="${contract.contractAmountVO || ''}">
            </div>
            <div class="form-group">
                <label>Agreement Date</label>
                <input type="date" name="agreementDate" value="${contract.agreementDate || ''}">
            </div>
            <div class="form-group">
                <label>Original Completion Date</label>
                <input type="date" name="originalCompletionDate" value="${contract.originalCompletionDate || ''}">
            </div>
            <div class="form-group">
                <label>Extended Completion Date</label>
                <input type="date" name="extendedCompletionDate" value="${contract.extendedCompletionDate || ''}">
            </div>
            <div class="form-group">
                <label>PB Date</label>
                <input type="date" name="pbDate" value="${contract.pbDate || ''}">
            </div>
            <div class="form-group">
                <label>Insurance Date</label>
                <input type="date" name="insuranceDate" value="${contract.insuranceDate || ''}">
            </div>
        `;
    }

    // Show Modal
    showModal(title, content, onSave) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalFormContent');

        modalTitle.textContent = title;
        modalContent.innerHTML = content;

        this.currentModalSave = onSave;
        modal.classList.add('active');
    }

    // Hide Modal
    hideModal() {
        const modal = document.getElementById('modal');
        modal.classList.remove('active');
        this.currentModalSave = null;
    }

    // Get Form Data
    getFormData() {
        const form = document.getElementById('modalForm');
        const formData = {};

        form.querySelectorAll('input, select, textarea').forEach(field => {
            if (field.name) {
                formData[field.name] = field.value;
            }
        });

        return formData;
    }

    // Update Contract Filters
    updateContractFilters() {
        const contracts = db.getContractNumbers();
        const filter = document.getElementById('contractFilter');
        const boqSelect = document.getElementById('boqContractSelect');
        const measurementSelect = document.getElementById('measurementContractSelect');

        // Update main filter
        filter.innerHTML = '<option value="">All Contracts</option>';
        contracts.forEach(c => {
            filter.innerHTML += `<option value="${c.number}">${c.number} - ${c.name}</option>`;
        });

        // Update BoQ filter
        if (boqSelect) {
            boqSelect.innerHTML = '<option value="">Select Contract</option>';
            contracts.forEach(c => {
                boqSelect.innerHTML += `<option value="${c.number}">${c.number} - ${c.name}</option>`;
            });
        }

        // Update Measurement filter
        if (measurementSelect) {
            measurementSelect.innerHTML = '<option value="">Select Contract</option>';
            contracts.forEach(c => {
                measurementSelect.innerHTML += `<option value="${c.number}">${c.number} - ${c.name}</option>`;
            });
        }
    }
}

// Initialize table manager
const tableManager = new TableManager();
