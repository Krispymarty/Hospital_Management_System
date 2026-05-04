// Form Validator
class Validator {
    static validate(data, rules) {
        const errors = {};

        for (const field in rules) {
            const fieldRules = rules[field];
            const value = this.normalizeValue(data[field]);

            for (const rule of fieldRules) {
                const error = this.validateRule(field, value, rule);
                if (error) {
                    errors[field] = error;
                    break;
                }
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors: errors
        };
    }

    static validateRule(field, value, rule) {
        if (rule.type === 'custom' && typeof rule.validate === 'function') {
            return rule.validate(value, field) ? null : (rule.message || `${field} is invalid`);
        }

        if (rule.type === 'required') {
            if (value === undefined || value === null || value === '') {
                return rule.message || `${field} is required`;
            }
        }

        if (rule.type === 'email') {
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                return rule.message || `${field} must be a valid email`;
            }
        }

        if (rule.type === 'phone') {
            if (value && !/^[\d\-\+\(\)\s]+$/.test(value)) {
                return rule.message || `${field} must be a valid phone number`;
            }
        }

        if (rule.type === 'minLength') {
            if (value && value.length < rule.value) {
                return rule.message || `${field} must be at least ${rule.value} characters`;
            }
        }

        if (rule.type === 'maxLength') {
            if (value && value.length > rule.value) {
                return rule.message || `${field} must be at most ${rule.value} characters`;
            }
        }

        if (rule.type === 'numeric') {
            if (value && isNaN(value)) {
                return rule.message || `${field} must be numeric`;
            }
        }

        if (rule.type === 'min') {
            if (value && value < rule.value) {
                return rule.message || `${field} must be at least ${rule.value}`;
            }
        }

        if (rule.type === 'pattern') {
            if (value && !rule.value.test(value)) {
                return rule.message || `${field} format is invalid`;
            }
        }

        return null;
    }

    static normalizeValue(value) {
        return typeof value === 'string' ? value.trim() : value;
    }

    static renderErrors(errors, root = document) {
        for (const field in errors) {
            const errorElement = root.getElementById ? root.getElementById(`${field}Error`) : root.querySelector(`#${field}Error`);
            if (errorElement) {
                errorElement.textContent = errors[field];
                errorElement.classList.add('show');
            }
        }
    }

    static displayErrors(errors) {
        // Remove previous errors
        document.querySelectorAll('.error-message.show').forEach(el => {
            el.classList.remove('show');
        });

        this.renderErrors(errors);
    }

    static clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.classList.remove('show');
        });
    }
}

// Validation Rules Library
const ValidationRules = {
    patient: {
        name: [
            { type: 'required', message: 'Patient name is required' },
            { type: 'minLength', value: 3, message: 'Name must be at least 3 characters' }
        ],
        age: [
            { type: 'required', message: 'Age is required' },
            { type: 'numeric', message: 'Age must be a number' },
            { type: 'min', value: 1, message: 'Age must be at least 1' }
        ],
        phone: [
            { type: 'required', message: 'Phone is required' },
            { type: 'phone', message: 'Phone format is invalid' }
        ],
        email: [
            { type: 'required', message: 'Email is required' },
            { type: 'email', message: 'Email format is invalid' }
        ],
        address: [
            { type: 'required', message: 'Address is required' }
        ]
    },

    doctor: {
        name: [
            { type: 'required', message: 'Doctor name is required' },
            { type: 'minLength', value: 3, message: 'Name must be at least 3 characters' }
        ],
        specialization: [
            { type: 'required', message: 'Specialization is required' }
        ],
        phone: [
            { type: 'required', message: 'Phone is required' },
            { type: 'phone', message: 'Phone format is invalid' }
        ]
    },

    appointment: {
        patientId: [
            { type: 'required', message: 'Patient is required' }
        ],
        doctorId: [
            { type: 'required', message: 'Doctor is required' }
        ],
        date: [
            { type: 'required', message: 'Date is required' }
        ],
        time: [
            { type: 'required', message: 'Time slot is required' }
        ]
    },

    medicine: {
        name: [
            { type: 'required', message: 'Medicine name is required' },
            { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' }
        ],
        price: [
            { type: 'required', message: 'Price is required' },
            { type: 'numeric', message: 'Price must be a number' },
            { type: 'min', value: 0, message: 'Price cannot be negative' }
        ],
        stock: [
            { type: 'required', message: 'Stock is required' },
            { type: 'numeric', message: 'Stock must be a number' },
            { type: 'min', value: 0, message: 'Stock cannot be negative' }
        ]
    }
};

// Make validators available globally
window.Validator = Validator;
window.ValidationRules = ValidationRules;
