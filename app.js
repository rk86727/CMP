// Check authentication on page load
if (!sessionStorage.getItem('currentUser')) {
    window.location.href = 'login.html';
}

// Global variables
let currentTable = 'contract';
let editingRecord = null;

// Table configurations
const tableConfigs = {
    contract: {
        title: 'Contract Data',
        table: 'contracts',
        fields: [
            { key: 'sn', label: 'SN', type: 'number', required: true },
            { key: 'contractNumber', label: 'Contract Number', type: 'text', required: true },
            { key: 'contractName', label: 'Contract Name', type: 'text', required: true },
            { key: 'contractor', label: 'Contractor', type: 'text', required: true },
            { key: 'district', label: 'District', type: 'text', required: true },
            { key: 'component', label: 'Component', type: 'text' },
            { key: 'budgetHead', label: 'Budget Head', type: 'text' },
            { key: 'budgetAmount', label: 'Budget Amount', type: 'number' },
            { key: 'estimatedAmount', label: 'Estimated Amount (with VAT & PS)', type: 'number' },
            { key: 'agreementAmount', label: 'Agreement Amount (with VAT & PS)', type: 'number' },
            { key: 'contractAmountVO', label: 'Contract Amount with VO', type: 'number' },
            { key: 'agreementDate', label: 'Agreement Date', type: 'date' },
            { key: 'originalCompletionDate', label: 'Original Completion Date', type: 'date' },
            { key: 'extendedCompletionDate', label: 'Extended Completion Date', type: 'date' },
            { key: 'pbDate', label: 'PB Date', type: 'date' },
            { key: 'insuranceDate', label: 'Insurance Date', type: 'date' }
        ]
    },
    bill: {
        title: 'Bill Data',
        table: 'bills',
        fields: [
            { key: 'sn', label: 'SN', type: 'number', required: true },
            { key: 'contractNumber', label: 'Contract Number', type: 'select', required: true },
            { key: 'numberOfBills', label: 'Number of Bills', type: 'number' },
            { key: 'billPaidAmount', label: 'Bill Paid Amount (with VAT & PS)', type: 'number' },
            { key: 'billDetails', label: 'Bill Details', type: 'textarea' },
            { key: 'siteEngineer', label: 'Site Engineer', type: 'text' },
            { key: 'siteSubEngineer1', label: 'Site Sub-engineer 1', type: 'text' },
            { key: 'siteSubEngineer2', label: 'Site Sub-engineer 2', type: 'text' },
            { key: 'siteSubEngineer3', label: 'Site Sub-engineer 3', type: 'text' },
            { key: 'siteSubEngineer4', label: 'Site Sub-engineer 4', type: 'text' }
        ]
    },
    boq: {
        title: 'Bill of Quantities',
        table: 'boqs',
        fields: [
            { key: 'sn', label: 'SN', type: 'number', required: true },
            { key: 'contractNumber', label: 'Contract Number', type: 'select', required: true },
            { key: 'description', label: 'Description', type: 'textarea', required: true },
            { key: 'unit', label: 'Unit', type: 'text', required: true },
            { key: 'quantity', label: 'Quantity', type: 'number', required: true },
            { key: 'contractRate', label: 'Contract Rate', type: 'number', required: true },
            { key: 'remarks', label: 'Remarks', type: 'textarea' }
        ]
    },
    measurement: {
        title: 'Field Measurement',
        table: 'measurements',
        fields: [
            { key: 'sn', label: 'SN', type: 'number', required: true },
            { key: 'contractNumber', label: 'Contract Number', type: 'select', required: true },
            { key: 'structure', label: 'Structure', type: 'text', required: true },
            { key: 'chainage', label: 'Chainage', type: 'text' },
            { key: 'description', label: 'Description', type: 'textarea' },
            { key: 'unit', label: 'Unit', type: 'text' },
            { key: 'no', label: 'No', type: 'number' },
            { key: 'length', label: 'Length (m)', type: 'number' },
            { key: 'breadth', label: 'Breadth (m)', type: 'number' },
            { key: 'height', label: 'Height (m)', type: 'number' },
            { key: 'location', label: 'GPS Location', type: 'location' }
        ]
    },
    users: {
        title: 'User Management',
        table: 'users',
        fields: [
            { key: 'name', label: 'Name', type: 'text', required: true },
            { key: 'email', label: 'Email', type: 'email', required: true },
            { key: 'password', label: 'Password', type: 'password', required: true },
            { key: 'role', label: 'Role', type: 'select', options: ['admin', 'user'], required: true }
        ]
    }
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    setupUI();
    setupEventListeners();
    loadTable('contract');
    updateContractFilter();
});

// Setup UI
function setupUI() {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    document.getElementById('currentUser').textContent = `${user.name} (${user.role})`;
    
    // Show user management tab for superadmin
    if (user.role === 'superadmin') {
        document.getElementById('usersTab').style.display = 'block';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const table = this.dataset.table;
            switchTable(table);
        });
    });
    
    // Add new button
    document.getElementById('addNewBtn').addEventListener('click', function() {
        showForm(currentTable);
    });
    
    // Contract filter
    document.getElementById('contractFilter').addEventListener('change', function() {
        loadTable(currentTable);
    });
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.clear();
            window.location.href = 'login.html';
        }
    });
    
    // Modal close
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    
    // Save button
    document.getElementById('saveBtn').addEventListener('click', saveRecord);
}

// Switch table
function switchTable(tableName) {
    currentTable = tableName;
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.table === tableName) {
            btn.classList.add('active');
        }
    });
    
    loadTable(tableName);
}

// Load table data
function loadTable(tableName) {
    const config = tableConfigs[tableName];
    const tableTitle = document.getElementById('tableTitle');
    const tableContent = document.getElementById('tableContent');
    
    tableTitle.textContent = config.title;
    
    let data;
    if (tableName === 'users') {
        data = JSON.parse(localStorage.getItem('users') || '[]');
    } else {
        data = JSON.parse(localStorage.getItem(config.table) || '[]');
    }
    
    // Filter by contract if selected
    const contractFilter = document.getElementById('contractFilter').value;
    if (contractFilter && tableName !== 'contract' && tableName !== 'users') {
        data = data.filter(d => d.contractNumber === contractFilter);
    }
    
    // Build table HTML
    let html = '<table class="data-table"><thead><tr>';
    
    // Headers
    config.fields.forEach(field => {
        html += `<th>${field.label}</th>`;
    });
    
    // Add calculated columns
    if (tableName === 'contract') {
        html += '<th>Days Remaining</th>';
    } else if (tableName === 'boq') {
        html += '<th>Amount</th>';
    } else if (tableName === 'measurement') {
        html += '<th>Quantity</th>';
    } else if (tableName === 'bill') {
        html += '<th>Remaining Amount</th>';
    }
    
    html += '<th>Actions</th></tr></thead><tbody>';
    
    // Data rows
    if (data.length === 0) {
        html += `<tr><td colspan="100%" class="empty-state">No records found</td></tr>`;
    } else {
        data.forEach(record => {
            html += '<tr>';
            
            config.fields.forEach(field => {
                let value = record[field.key] || '-';
                if (field.type === 'date' && value !== '-') {
                    value = new Date(value).toLocaleDateString();
                }
                html += `<td>${value}</td>`;
            });
            
            // Calculated columns
            if (tableName === 'contract') {
                const days = record.extendedCompletionDate ? 
                    calculateDaysRemaining(record.extendedCompletionDate) : '-';
                html += `<td>${days}</td>`;
            } else if (tableName === 'boq') {
                const amount = (parseFloat(record.quantity || 0) * parseFloat(record.contractRate || 0)).toFixed(2);
                html += `<td>${amount}</td>`;
            } else if (tableName === 'measurement') {
                const quantity = (parseFloat(record.no || 1) * parseFloat(record.length || 0) * 
                               parseFloat(record.breadth || 0) * parseFloat(record.height || 0)).toFixed(3);
                html += `<td>${quantity}</td>`;
            } else if (tableName === 'bill') {
                const contract = JSON.parse(localStorage.getItem('contracts') || '[]')
                    .find(c => c.contractNumber === record.contractNumber);
                const remaining = contract ? 
                    (parseFloat(contract.agreementAmount || 0) - parseFloat(record.billPaidAmount || 0)).toFixed(2) : '-';
                html += `<td>${remaining}</td>`;
            }
            
            // Action buttons
            html += `<td class="action-buttons">
                <button class="btn-edit" onclick="editRecord(${record.id})">Edit</button>
                <button class="btn-delete" onclick="deleteRecord(${record.id})">Delete</button>
            </td></tr>`;
        });
    }
    
    html += '</tbody></table>';
    tableContent.innerHTML = html;
}

// Show form modal
function showForm(tableName, recordId = null) {
    const config = tableConfigs[tableName];
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    editingRecord = recordId;
    
    let record = null;
    if (recordId) {
        if (tableName === 'users') {
            record = JSON.parse(localStorage.getItem('users') || '[]').find(r => r.id === recordId);
        } else {
            record = JSON.parse(localStorage.getItem(config.table) || '[]').find(r => r.id === recordId);
        }
    }
    
    modalTitle.textContent = record ? `Edit ${config.title}` : `Add New ${config.title}`;
    
    // Build form
    let html = '<form id="dataForm">';
    
    config.fields.forEach(field => {
        const value = record ? (record[field.key] || '') : '';
        const required = field.required ? 'required' : '';
        
        html += `<div class="form-group">
            <label for="${field.key}">${field.label}</label>`;
        
        if (field.type === 'textarea') {
            html += `<textarea id="${field.key}" name="${field.key}" ${required}>${value}</textarea>`;
        } else if (field.type === 'select') {
            html += `<select id="${field.key}" name="${field.key}" ${required}>`;
            
            if (field.key === 'contractNumber') {
                const contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
                html += '<option value="">Select Contract</option>';
                contracts.forEach(c => {
                    const selected = value === c.contractNumber ? 'selected' : '';
                    html += `<option value="${c.contractNumber}" ${selected}>${c.contractNumber} - ${c.contractName}</option>`;
                });
            } else if (field.options) {
                field.options.forEach(opt => {
                    const selected = value === opt ? 'selected' : '';
                    html += `<option value="${opt}" ${selected}>${opt}</option>`;
                });
            }
            
            html += '</select>';
        } else if (field.type === 'location') {
            html += `<input type="text" id="${field.key}" name="${field.key}" value="${value}" readonly>
                <button type="button" class="btn-location" onclick="getGPSLocation()">Get GPS Location</button>`;
        } else {
            html += `<input type="${field.type}" id="${field.key}" name="${field.key}" value="${value}" ${required}>`;
        }
        
        html += '</div>';
    });
    
    html += '</form>';
    
    modalBody.innerHTML = html;
    modal.classList.add('show');
}

// Edit record
function editRecord(recordId) {
    showForm(currentTable, recordId);
}

// Delete record
function deleteRecord(recordId) {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    const config = tableConfigs[currentTable];
    
    if (currentTable === 'users') {
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        users = users.filter(u => u.id !== recordId);
        localStorage.setItem('users', JSON.stringify(users));
    } else {
        let data = JSON.parse(localStorage.getItem(config.table) || '[]');
        data = data.filter(r => r.id !== recordId);
        localStorage.setItem(config.table, JSON.stringify(data));
    }
    
    loadTable(currentTable);
    updateContractFilter();
}

// Save record
function saveRecord() {
    const config = tableConfigs[currentTable];
    const form = document.getElementById('dataForm');
    const formData = new FormData(form);
    
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    if (currentTable === 'users') {
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        
        if (editingRecord) {
            const index = users.findIndex(u => u.id === editingRecord);
            users[index] = { ...users[index], ...data };
        } else {
            data.id = Date.now();
            users.push(data);
        }
        
        localStorage.setItem('users', JSON.stringify(users));
    } else {
        let records = JSON.parse(localStorage.getItem(config.table) || '[]');
        
        if (editingRecord) {
            const index = records.findIndex(r => r.id === editingRecord);
            records[index] = { ...records[index], ...data };
        } else {
            data.id = Date.now();
            records.push(data);
        }
        
        localStorage.setItem(config.table, JSON.stringify(records));
    }
    
    closeModal();
    loadTable(currentTable);
    updateContractFilter();
}

// Close modal
function closeModal() {
    document.getElementById('modal').classList.remove('show');
    editingRecord = null;
}

// Update contract filter
function updateContractFilter() {
    const contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
    const filter = document.getElementById('contractFilter');
    const currentValue = filter.value;
    
    filter.innerHTML = '<option value="">All Contracts</option>';
    contracts.forEach(contract => {
        const option = document.createElement('option');
        option.value = contract.contractNumber;
        option.textContent = `${contract.contractNumber} - ${contract.contractName}`;
        filter.appendChild(option);
    });
    
    filter.value = currentValue;
}

// Calculate days remaining
function calculateDaysRemaining(completionDate) {
    const today = new Date();
    const completion = new Date(completionDate);
    const diffTime = completion - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Get GPS location
function getGPSLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                document.getElementById('location').value = `${lat}, ${lng}`;
            },
            (error) => {
                alert('Error getting location: ' + error.message);
            }
        );
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

// Register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(reg => console.log('Service Worker registered'))
        .catch(err => console.log('Service Worker registration failed'));
}
