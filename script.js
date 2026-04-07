/* ===== GERADOR DE ORCAMENTO LRTech ===== */

let itemCounter = 0;

/* ---- utilidades ---- */
function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function parseLocaleNumber(str) {
    if (!str) return 0;
    return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
}

function getTotalFromRow(row) {
    const qty = parseLocaleNumber(row.querySelector('.input-num.qty')?.value);
    const unit = parseLocaleNumber(row.querySelector('.input-num.unit')?.value);
    return qty * unit;
}

/* ---- recalcular totais ---- */
function recalcAll() {
    const tbody = document.getElementById('items-body');
    const rows = tbody.querySelectorAll('tr');
    let subtotal = 0;

    rows.forEach((row, idx) => {
        // atualiza numero da linha
        const numCell = row.querySelector('.row-number');
        if (numCell) numCell.textContent = idx + 1;

        // recalcula total da linha
        const qtyEl = row.querySelector('.input-num.qty');
        const unitEl = row.querySelector('.input-num.unit');
        const totalEl = row.querySelector('.row-total');

        if (qtyEl && unitEl && totalEl) {
            const total = getTotalFromRow(row);
            subtotal += total;
            totalEl.textContent = formatCurrency(total);
        }
    });

    // aplica desconto
    const discountEl = document.getElementById('input-discount');
    const subtotalEl = document.getElementById('subtotal-value');
    const totalElDisplay = document.getElementById('total-value');

    subtotalEl.textContent = formatCurrency(subtotal);

    const discount = parseLocaleNumber(discountEl?.value);
    const finalTotal = Math.max(0, subtotal - discount);
    totalElDisplay.textContent = formatCurrency(finalTotal);
}

/* ---- adicionar linha ---- */
function addRow() {
    itemCounter++;
    const tbody = document.getElementById('items-body');
    const tr = document.createElement('tr');

    tr.setAttribute('data-id', itemCounter);
    tr.innerHTML = `
        <td class="row-number text-center"></td>
        <td>
            <input type="text" class="input-desc" placeholder="Descrição do serviço / produto">
            <input type="text" class="input-desc-detail" placeholder="Detalhe adicional (opcional)">
        </td>
        <td>
            <select class="input-categoria">
                <option value="">Categoria...</option>
                <option value="CFTV/Câmeras">CFTV/Câmeras</option>
                <option value="Motor">Motor</option>
                <option value="Alarme">Alarme</option>
                <option value="Controle de Acesso">Controle de Acesso</option>
                <option value="Cerca Elétrica">Cerca Elétrica</option>
                <option value="Interfonia">Interfonia</option>
                <option value="Instalação / M.O.">Instalação / M.O.</option>
                <option value="Material Extra">Material Extra</option>
                <option value="Outros">Outros</option>
            </select>
        </td>
        <td>
            <input type="number" class="input-num qty" placeholder="0" min="0" value="">
        </td>
        <td>
            <input type="number" class="input-num unit" placeholder="0,00" min="0" step="0.01" value="">
        </td>
        <td class="text-right row-total">${formatCurrency(0)}</td>
        <td class="text-center no-print">
            <button class="btn-action" title="Remover item" onclick="removeRow(this)">&times;</button>
        </td>
    `;

    tbody.appendChild(tr);

    // listeners nos novos inputs
    tr.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', recalcAll);
    });
    tr.querySelectorAll('select').forEach(sel => {
        sel.addEventListener('change', recalcAll);
    });

    recalcAll();

    // foca no primeiro campo da nova linha
    tr.querySelector('.input-desc').focus();
}

/* ---- remover linha ---- */
function removeRow(btn) {
    const tr = btn.closest('tr');
    const tbody = document.getElementById('items-body');

    if (tbody.querySelectorAll('tr').length <= 1) {
        alert('O orcamento deve ter pelo menos um item.');
        return;
    }

    tr.style.opacity = '0';
    tr.style.transform = 'translateX(-20px)';
    tr.style.transition = 'all 0.25s';
    setTimeout(() => {
        tr.remove();
        recalcAll();
    }, 250);
}

/* ---- imprimir ---- */
function printBudget() {
    window.print();
}

/* ---- atualizar data e validade ---- */
function setTodayDate() {
    const today = new Date();
    const formatted = today.toLocaleDateString('pt-BR');
    const dateEl = document.getElementById('doc-date');
    if (dateEl) dateEl.value = formatted;
    updateValidityText();
}

function updateValidityText() {
    const validaEl = document.getElementById('doc-validade');
    const txtValidade = document.getElementById('txt-validade');
    const dateEl = document.getElementById('doc-date');
    if (validaEl && txtValidade && dateEl.value) {
        txtValidade.value = validaEl.value + ' dias a partir de ' + dateEl.value;
    }
}

/* ---- inicializacao ---- */
document.addEventListener('DOMContentLoaded', () => {
    // data atual
    setTodayDate();

    // listeners nos campos do cliente
    document.querySelectorAll('.client-item input').forEach(input => {
        input.addEventListener('input', () => {
            if (input.value.trim()) {
                input.style.borderColor = '#2c6e9e';
            } else {
                input.style.borderColor = '#dce5ef';
            }
        });
    });

    // listeners nos inputs da tabela inicial
    document.querySelectorAll('.items-table input, .items-table select').forEach(el => {
        el.addEventListener('input', recalcAll);
        el.addEventListener('change', recalcAll);
    });

    // listener no campo de desconto
    const discountEl = document.getElementById('input-discount');
    if (discountEl) {
        discountEl.addEventListener('input', recalcAll);
    }

    // listener no campo de validade
    const validaEl = document.getElementById('doc-validade');
    if (validaEl) {
        validaEl.addEventListener('input', updateValidityText);
    }

    // listener no campo numero do documento
    const docNumEl = document.getElementById('doc-number');
    if (docNumEl) {
        docNumEl.addEventListener('blur', () => {
            const v = parseInt(docNumEl.value) || 0;
            if (v > 0 && v < 10000) {
                docNumEl.value = String(v).padStart(3, '0');
            }
        });
    }

    // listener no campo de data — ao alterar, atualiza validade
    const docDateEl = document.getElementById('doc-date');
    if (docDateEl) {
        docDateEl.addEventListener('input', updateValidityText);
    }

    // botao adicionar
    document.getElementById('btn-add-item').addEventListener('click', addRow);

    // botao imprimir
    document.getElementById('btn-print').addEventListener('click', printBudget);

    // calculo inicial
    recalcAll();
});

/* ---- atalho Ctrl+P para imprimir ---- */
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        printBudget();
    }
});
