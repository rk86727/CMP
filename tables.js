// Table Management Module
const Tables = {
    currentTable: 'contract',
    currentContract: null,

    // Table configurations
    tableConfigs: {
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
                { key: 'numberOfBills', label: 'Number of Bills upto Date', type: 'number' },
                { key: 'billPaidAmount', label: 'Bill Paid upto Date (with VAT & PS)', type: 'number' },
                { key: 'billDetails', label: 'Bill Details', type: 'textarea' },
                { key: 'remainingAmount', label: 'Remaining Amount', type: 'number', calculated: true },
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
                { key: 'description', label: 'Description of Items', type: 'textarea', required: true },
                { key: 'unit', label: 'Unit', type: 'text', required: true },
                { key: 'quantity', label: 'Quantity', type: 'number', required: true },
                { key: 'contractRate', label: 'Contract Rate', type: 'number', required: true },
                { key: 'amount', label: 'Amount', type: 'number', calculated: true },
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
                { key: 'description', label: 'Description of Items', type: 'textarea' },
                { key: 'unit', label: 'Unit', type: 'text' },
                { key: 'no', label: 'No', type: 'number' },
                { key: 'length', label: 'Length (m)', type: 'number' },
                { key: 'breadth', label: 'Breadth (m)', type: 'number' },
                { key: 'height', label: 'Height (m)', type: 'number' },
                { key: 'quantity', label: 'Quantity', type: 'number', calculated: true },
                { key: 'location', label: 'Location', type: 'location' }
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
    },

    // Render table
    renderTable(tableName) {
        const config = this.tableConfigs[tableName];
        if (!config) return;

        const tableContent = document.getElementById('tableContent');
        const tableTitle = document.getElementById('tableTitle');
        
        tableTitle.textContent = config.title;
        
        let data;
        if (tableName === 'users') {
            data = Auth.getAllUsers();
        } else {
            data = Database.getAll(config.table);
        }

        // Filter by contract if selected
        const contractFilter = document.getElementById('contractFilter').value;
        if (contractFilter && tableName !== 'contract' && tableName !== 'users') {
            data = data.filter(d => d.contractNumber === contractFilter);
        }

        // Create table HTML
        let html = '<table class="data-table"><thead><tr>';
        
        // Add headers
        config.fields.forEach(field => {
            if (!field.calculated) {
                html += `<th>${field.label}</th>`;
            }
        });
        
        // Add calculated fields for display
        if (tableName === 'contract') {
            html += '<th>Days Remaining</th>';
        } else if (tableName === 'boq') {
            html += '<th>Amount</th>';
        } else if (tableName === 'measurement') {
            html += '<th>Quantity</th>';
        } else if (tableName === 'bill') {
            html += '<th>Remaining Amount</th>';
        }
        
        if (Auth.hasPermission('edit', tableName)) {
            html += '<th>Actions</th>';
        }
        
        html += '</tr></thead><tbody>';

        // Add data rows
        data.forEach(record => {
            html += `<tr onclick="Tables.editRecord('${tableName}', ${record.id})">`;
            
            config.fields.forEach(field => {
                if (!field.calculated) {
                    let value = record[field.key] || '-';
                    if (field.type === 'date' && value !== '-') {
                        value = new Date(value).toLocaleDateString();
                    }
                    html += `<td>${value}</td>`;
                }
            });
            
            // Add calculated fields
            if (tableName === 'contract') {
                const days = record.extendedCompletionDate ? 
                    Database.calculateDaysRemaining(record.extendedCompletionDate) : '-';
                html += `<td>${days}</td>`;
            } else if (tableName === 'boq') {
                const amount = (record.quantity * record.contractRate).toFixed(2);
                html += `<td>${amount}</td>`;
            } else if (tableName === 'measurement') {
                const quantity = (record.no * record.length * record.breadth * record.height).toFixed(3);
                html += `<td>${quantity}</td>`;
            } else if (tableName === 'bill') {
                // Get contract amount
                const contract = Database.getAll('contracts').find(c => c.contractNumber === record.contractNumber);
                const remaining = contract ? 
                    Database.calculateRemainingAmount(contract.agreementAmount || 0, record.billPaidAmount || 0) : '-';
                html += `<td>${remaining}</td>`;
            }
            
            if (Auth.hasPermission('edit', tableName)) {
                html += `<td class="action-buttons">
                    <button class="btn-edit" onclick="event.stopPropagation(); Tables.editRecord('${tableName}', ${record.id})">Edit</button>`;
                
                if (Auth.hasPermission('delete', tableName)) {
                    html += `<button class="btn-delete" onclick="event.stopPropagation(); Tables.deleteRecord('${tableName}', ${record.id})">Delete</button>`;
                }
                
                html += '</td>';
            }
            
            html += '</tr>';
        });

        html += '</tbody></table>';
        
        if (data.length === 0) {
            html = '<div class="text-center p-2">No records found</div>';
        }
        
        tableContent.innerHTML = html;
    },

    // Show form in modal
    showForm(tableName, recordId = null) {
        const config = this.tableConfigs[tableName];
        if (!config) return;

        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        let record = null;
        if (recordId) {
            if (tableName === 'users') {
                record = Auth.getAllUsers().find(u => u.id === recordId);
            } else {
                record = Database.getById(config.table, recordId);
            }
        }
        
        modalTitle.textContent = record ? `Edit ${config.title}` : `Add New ${config.title}`;
        
        // Create form HTML
        let html = '<form id="dataForm">';
        
        config.fields.forEach(field => {
            if (field.calculated) return;
            
            const value = record ? (record[field.key] || '') : '';
            const required = field.required ? 'required' : '';
            
            html += `<div class="form-group">
                <label for="${field.key}">${field.label}</label>`;
            
            if (field.type === 'textarea') {
                html += `<textarea id="${field.key}" name="${field.key}" ${required}>${value}</textarea>`;
            } else if (field.type === 'select') {
                html += `<select id="${field.key}" name="${field.key}" ${required}>`;
                
                if (field.key === 'contractNumber') {
                    // Load contract numbers
                    const contracts = Database.getAll('contracts');
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
                    <button type="button" class="btn-location" onclick="Tables.getLocation('${field.key}')">Get GPS Location</button>`;
            } else {
                html += `<input type="${field.type}" id="${field.key}" name="${field.key}" value="${value}" ${required}>`;
            }
            
            html += '</div>';
        });
        
        if (recordId) {
            html += `<input type="hidden" id="recordId" value="${recordId}">`;
        }
        
        html += '</form>';
        
        modalBody.innerHTML = html;
        modal.classList.add('show');
        
        // Add save handler
        document.getElementById('saveBtn').onclick = () => this.saveRecord(tableName);
    },

    // Save record
    saveRecord(tableName) {
        const config = this.tableConfigs[tableName];
        const form = document.getElementById('dataForm');
        const formData = new FormData(form);
        const recordId = document.getElementById('recordId')?.value;
        
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Calculate fields
        if (tableName === 'boq') {
            data.amount = (parseFloat(data.quantity || 0) * parseFloat(data.contractRate || 0)).toFixed(2);
        } else if (tableName === 'measurement') {
            data.quantity = (parseFloat(data.no || 1) * parseFloat(data.length || 0) * 
                           parseFloat(data.breadth || 0) * parseFloat(data.height || 0)).toFixed(3);
        }
        
        if (recordId) {
            if (tableName === 'users') {
                Auth.updateUser(parseInt(recordId), data);
            } else {
                Database.update(config.table, parseInt(recordId), data);
            }
        } else {
            if (tableName === 'users') {
                Auth.createUser(data);
            } else {
                Database.create(config.table, data);
            }
        }
        
        this.closeModal();
        this.renderTable(tableName);
        this.updateContractFilter();
    },

    // Edit record
    editRecord(tableName, recordId) {
        if (!Auth.hasPermission('edit', tableName)) {
            alert('You do not have permission to edit this record');
            return;
        }
        this.showForm(tableName, recordId);
    },

    // Delete record
    deleteRecord(tableName, recordId) {
        if (!Auth.hasPermission('delete', tableName)) {
            alert('You do not have permission to delete this record');
            return;
        }
        
        if (confirm('Are you sure you want to delete this record?')) {
            const config = this.tableConfigs[tableName];
            
            if (tableName === 'users') {
                Auth.deleteUser(recordId);
            } else {
                Database.delete(config.table, recordId);
            }
            
            this.renderTable(tableName);
            this.updateContractFilter();
        }
    },

    // Get GPS location
    getLocation(fieldId) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    document.getElementById(fieldId).value = `${lat}, ${lng}`;
                },
                (error) => {
                    alert('Error getting location: ' + error.message);
                }
            );
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    },

    // Close modal
    closeModal() {
        document.getElementById('modal').classList.remove('show');
    },

    // Update contract filter dropdown
    updateContractFilter() {
        const contracts = Database.getAll('contracts');
        const filterSelect = document.getElementById('contractFilter');
        const currentValue = filterSelect.value;
        
        filterSelect.innerHTML = '<option value="">All Contracts</option>';
        contracts.forEach(contract => {
            const option = document.createElement('option');
            option.value = contract.contractNumber;
            option.textContent = `${contract.contractNumber} - ${contract.contractName}`;
            if (option.value === currentValue) {
                option.selected = true;
            }
            filterSelect.appendChild(option);
        });
    }
};
