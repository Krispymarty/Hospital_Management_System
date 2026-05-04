// Table Component
class TableComponent {
    static create(config = {}) {
        const {
            headers = [],
            data = [],
            actions = [],
            searchable = true,
            sortable = true,
            striped = true,
            onRowClick = null,
            onAction = null,
            rowClass = null,
            searchPlaceholder = 'Search...',
            emptyMessage = 'No data available',
            card = true
        } = config;

        const normalizedHeaders = headers.map(header => (
            typeof header === 'string'
                ? { label: header, key: this.keyFromLabel(header) }
                : { label: header.label, key: header.key || this.keyFromLabel(header.label), render: header.render }
        ));

        const state = {
            rows: [...data],
            sortKey: null,
            sortDirection: 1,
            searchTerm: ''
        };

        const container = document.createElement('div');
        container.className = `${card ? 'card ' : ''}table-component`;

        if (searchable) {
            const searchBar = document.createElement('div');
            searchBar.className = 'search-bar';

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'search-input';
            input.placeholder = searchPlaceholder;
            input.dataset.role = 'table-search';

            searchBar.appendChild(input);
            container.appendChild(searchBar);
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'table-wrapper';

        const table = document.createElement('table');
        table.className = `table${striped ? ' table-striped' : ''}`;

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        normalizedHeaders.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header.label;
            th.dataset.key = header.key;
            if (sortable) {
                th.classList.add('sortable');
                th.tabIndex = 0;
            }
            headerRow.appendChild(th);
        });

        if (actions.length > 0) {
            const th = document.createElement('th');
            th.textContent = 'Actions';
            headerRow.appendChild(th);
        }

        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        table.appendChild(tbody);
        wrapper.appendChild(table);
        container.appendChild(wrapper);

        const getVisibleRows = () => {
            const term = state.searchTerm.toLowerCase();
            let rows = state.rows.filter(row => {
                if (!term) return true;
                return normalizedHeaders.some(header => (
                    String(this.getCellValue(row, header) ?? '').toLowerCase().includes(term)
                ));
            });

            if (state.sortKey) {
                const header = normalizedHeaders.find(item => item.key === state.sortKey);
                rows = [...rows].sort((a, b) => (
                    this.compareValues(
                        this.getCellValue(a, header),
                        this.getCellValue(b, header)
                    ) * state.sortDirection
                ));
            }

            return rows;
        };

        const renderRows = () => {
            tbody.innerHTML = '';
            const visibleRows = getVisibleRows();

            if (visibleRows.length === 0) {
                const tr = document.createElement('tr');
                tr.className = 'empty-row';
                const td = document.createElement('td');
                td.colSpan = normalizedHeaders.length + (actions.length > 0 ? 1 : 0);
                td.textContent = emptyMessage;
                td.className = 'empty-cell';
                tr.appendChild(td);
                tbody.appendChild(tr);
                return;
            }

            visibleRows.forEach(row => {
                const tr = document.createElement('tr');
                tr.dataset.id = row.id ?? '';
                if (rowClass) tr.className = rowClass(row) || '';

                normalizedHeaders.forEach(header => {
                    const td = document.createElement('td');
                    const rendered = header.render
                        ? header.render(this.getCellValue(row, header), row)
                        : this.formatValue(this.getCellValue(row, header));

                    if (rendered instanceof Node) {
                        td.appendChild(rendered);
                    } else {
                        td.innerHTML = rendered;
                    }
                    tr.appendChild(td);
                });

                if (actions.length > 0) {
                    const td = document.createElement('td');
                    td.className = 'table-actions';
                    actions.forEach(action => {
                        const button = document.createElement('button');
                        button.type = 'button';
                        button.className = `btn btn-sm btn-${action.type || 'primary'}`;
                        button.dataset.action = action.key;
                        button.title = action.label;
                        button.innerHTML = `<i class="fas fa-${action.icon}"></i>`;
                        td.appendChild(button);
                    });
                    tr.appendChild(td);
                }

                tbody.appendChild(tr);
            });
        };

        const debouncedSearch = this.debounce((value) => {
            state.searchTerm = value || '';
            renderRows();
        }, 250);

        container.addEventListener('input', (event) => {
            if (event.target.matches('[data-role="table-search"]')) {
                debouncedSearch(event.target.value);
            }
        });

        container.addEventListener('click', (event) => {
            const actionButton = event.target.closest('button[data-action]');
            if (actionButton) {
                const rowElement = actionButton.closest('tr');
                const row = state.rows.find(item => String(item.id ?? '') === rowElement.dataset.id);
                if (onAction && row) onAction(actionButton.dataset.action, row);
                return;
            }

            const header = event.target.closest('th.sortable');
            if (header && sortable) {
                const key = header.dataset.key;
                state.sortDirection = state.sortKey === key ? state.sortDirection * -1 : 1;
                state.sortKey = key;
                renderRows();
                return;
            }

            const rowElement = event.target.closest('tbody tr[data-id]');
            if (rowElement && !rowElement.classList.contains('empty-row')) {
                tbody.querySelectorAll('tr.selected').forEach(row => row.classList.remove('selected'));
                rowElement.classList.add('selected');
                const row = state.rows.find(item => String(item.id ?? '') === rowElement.dataset.id);
                if (onRowClick && row) onRowClick(row);
            }
        });

        renderRows();
        container.updateData = (nextData = []) => {
            state.rows = [...nextData];
            renderRows();
        };

        return container;
    }

    static keyFromLabel(label = '') {
        return label.toLowerCase().replace(/\s+/g, '');
    }

    static getCellValue(row, header) {
        return row?.[header.key] ?? row?.[header.label] ?? '';
    }

    static formatValue(value) {
        if (Array.isArray(value)) return value.join(', ');
        if (value && typeof value === 'object') return JSON.stringify(value);
        return value ?? '';
    }

    static compareValues(a, b) {
        const aNumber = Number(a);
        const bNumber = Number(b);
        if (a !== '' && b !== '' && !Number.isNaN(aNumber) && !Number.isNaN(bNumber)) {
            return aNumber - bNumber;
        }
        return String(a ?? '').localeCompare(String(b ?? ''), undefined, { sensitivity: 'base' });
    }

    static debounce(callback, delay = 250) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => callback(...args), delay);
        };
    }
}

window.TableComponent = TableComponent;
