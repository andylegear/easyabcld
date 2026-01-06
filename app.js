/**
 * ABC LD - Arena Blended Connected Learning Design Tool
 * Main JavaScript Application
 * 
 * Based on Professor Diana Laurillard's Conversational Framework
 */

// =====================================================
// Data Store
// =====================================================

let boardData = {
    title: 'My Learning Design',
    weeks: [],
    cards: [],
    lastModified: new Date().toISOString()
};

let draggedCard = null;
let confirmCallback = null;

// =====================================================
// Initialization
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeBoard();
    setupEventListeners();
    createToastContainer();
});

function initializeBoard() {
    // Check for saved data in localStorage
    const savedData = localStorage.getItem('abcld_board');
    if (savedData) {
        try {
            boardData = JSON.parse(savedData);
            document.getElementById('boardTitle').value = boardData.title || 'My Learning Design';
        } catch (e) {
            console.error('Error loading saved data:', e);
            createDefaultBoard();
        }
    } else {
        createDefaultBoard();
    }
    renderBoard();
}

function createDefaultBoard() {
    boardData = {
        title: 'My Learning Design',
        weeks: [],
        cards: [],
        lastModified: new Date().toISOString()
    };
    
    // Create 8 default weeks
    for (let i = 1; i <= 8; i++) {
        boardData.weeks.push({
            id: generateId(),
            title: `Week ${i}`,
            startDate: '',
            order: i
        });
    }
}

function setupEventListeners() {
    // Board title change
    document.getElementById('boardTitle').addEventListener('change', (e) => {
        boardData.title = e.target.value;
        saveToLocalStorage();
    });

    // File input for loading JSON
    document.getElementById('fileInput').addEventListener('change', handleFileLoad);

    // Close modals on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeWeekModal();
            closeConfirmModal();
        }
    });

    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
                closeWeekModal();
                closeConfirmModal();
            }
        });
    });
}

// =====================================================
// Board Rendering
// =====================================================

function renderBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';

    // Sort weeks by order
    const sortedWeeks = [...boardData.weeks].sort((a, b) => a.order - b.order);

    sortedWeeks.forEach(week => {
        const weekElement = createWeekElement(week);
        board.appendChild(weekElement);
    });

    saveToLocalStorage();
}

function createWeekElement(week) {
    const weekDiv = document.createElement('div');
    weekDiv.className = 'week-column';
    weekDiv.dataset.weekId = week.id;

    const formattedDate = week.startDate ? formatDate(week.startDate) : '';

    weekDiv.innerHTML = `
        <div class="week-header" onclick="openWeekModal('${week.id}')">
            <div>
                <div class="week-title">${escapeHtml(week.title)}</div>
                ${formattedDate ? `<div class="week-date">${formattedDate}</div>` : ''}
            </div>
            <div class="week-header-actions">
                <button class="week-header-btn" onclick="event.stopPropagation(); moveWeek('${week.id}', -1)" title="Move Left">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="week-header-btn" onclick="event.stopPropagation(); moveWeek('${week.id}', 1)" title="Move Right">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
        <div class="week-content" data-week-id="${week.id}">
            ${renderWeekCards(week.id)}
            <button class="add-card-btn" onclick="openAddCardModal('${week.id}')">
                <i class="fas fa-plus"></i> Add Activity
            </button>
        </div>
    `;

    // Setup drag and drop for week content
    const weekContent = weekDiv.querySelector('.week-content');
    setupDropZone(weekContent);

    return weekDiv;
}

function renderWeekCards(weekId) {
    const weekCards = boardData.cards
        .filter(card => card.weekId === weekId)
        .sort((a, b) => a.order - b.order);

    return weekCards.map(card => createCardHTML(card)).join('');
}

function createCardHTML(card) {
    const learningTypeChips = (card.learningTypes || [])
        .map(type => `<span class="chip chip-${type} chip-small">${capitalizeFirst(type)}</span>`)
        .join('');

    const deliveryBadge = card.deliveryStyle 
        ? `<span class="delivery-badge delivery-${card.deliveryStyle}">${capitalizeFirst(card.deliveryStyle)}</span>`
        : '';

    const assessmentBadge = card.assessmentType
        ? `<span class="assessment-badge assessment-${card.assessmentType}">${card.assessmentType === 'formative' ? 'Formative' : 'Summative'}</span>`
        : '';

    const dateDisplay = card.deliveryDate ? formatDate(card.deliveryDate) : '';
    const durationDisplay = card.duration || '';
    const instructorDisplay = card.deliveredBy || '';

    return `
        <div class="card" data-card-id="${card.id}" draggable="true" onclick="openEditCardModal('${card.id}')">
            <div class="card-header">
                <div class="card-title">${escapeHtml(card.title)}</div>
                ${deliveryBadge ? `<div class="card-delivery">${deliveryBadge}</div>` : ''}
            </div>
            <div class="card-meta">
                ${dateDisplay ? `<span class="card-date"><i class="fas fa-calendar"></i> ${dateDisplay}</span>` : ''}
                ${durationDisplay ? `<span class="card-duration"><i class="fas fa-clock"></i> ${escapeHtml(durationDisplay)}</span>` : ''}
                ${instructorDisplay ? `<span class="card-instructor"><i class="fas fa-user"></i> ${escapeHtml(instructorDisplay)}</span>` : ''}
            </div>
            ${card.description ? `<div class="card-description">${escapeHtml(card.description)}</div>` : ''}
            ${learningTypeChips ? `<div class="card-chips">${learningTypeChips}</div>` : ''}
            ${assessmentBadge ? `<div class="card-assessment">${assessmentBadge}</div>` : ''}
            ${card.notes ? `<div class="card-notes"><i class="fas fa-sticky-note"></i> ${escapeHtml(card.notes)}</div>` : ''}
        </div>
    `;
}

// =====================================================
// Week Management
// =====================================================

function addWeek() {
    const newOrder = boardData.weeks.length + 1;
    const newWeek = {
        id: generateId(),
        title: `Week ${newOrder}`,
        startDate: '',
        order: newOrder
    };
    
    boardData.weeks.push(newWeek);
    renderBoard();
    showToast('Week added successfully', 'success');
}

function openWeekModal(weekId) {
    const week = boardData.weeks.find(w => w.id === weekId);
    if (!week) return;

    document.getElementById('weekId').value = weekId;
    document.getElementById('weekTitle').value = week.title;
    document.getElementById('weekStartDate').value = week.startDate || '';

    document.getElementById('weekModal').classList.add('active');
}

function closeWeekModal() {
    document.getElementById('weekModal').classList.remove('active');
}

function saveWeekSettings() {
    const weekId = document.getElementById('weekId').value;
    const week = boardData.weeks.find(w => w.id === weekId);
    
    if (week) {
        week.title = document.getElementById('weekTitle').value;
        week.startDate = document.getElementById('weekStartDate').value;
        renderBoard();
        showToast('Week updated successfully', 'success');
    }
    
    closeWeekModal();
}

function deleteWeek() {
    const weekId = document.getElementById('weekId').value;
    const week = boardData.weeks.find(w => w.id === weekId);
    
    if (!week) return;
    
    const cardCount = boardData.cards.filter(c => c.weekId === weekId).length;
    const message = cardCount > 0 
        ? `Delete "${week.title}" and its ${cardCount} activities?`
        : `Delete "${week.title}"?`;
    
    showConfirm('Delete Week', message, () => {
        // Remove all cards in this week
        boardData.cards = boardData.cards.filter(c => c.weekId !== weekId);
        // Remove the week
        boardData.weeks = boardData.weeks.filter(w => w.id !== weekId);
        // Reorder remaining weeks
        reorderWeeks();
        renderBoard();
        closeWeekModal();
        showToast('Week deleted', 'success');
    });
}

function moveWeek(weekId, direction) {
    const week = boardData.weeks.find(w => w.id === weekId);
    if (!week) return;

    const sortedWeeks = [...boardData.weeks].sort((a, b) => a.order - b.order);
    const currentIndex = sortedWeeks.findIndex(w => w.id === weekId);
    const newIndex = currentIndex + direction;

    if (newIndex < 0 || newIndex >= sortedWeeks.length) return;

    // Swap orders
    const otherWeek = sortedWeeks[newIndex];
    const tempOrder = week.order;
    week.order = otherWeek.order;
    otherWeek.order = tempOrder;

    renderBoard();
}

function reorderWeeks() {
    const sortedWeeks = [...boardData.weeks].sort((a, b) => a.order - b.order);
    sortedWeeks.forEach((week, index) => {
        week.order = index + 1;
    });
}

// =====================================================
// Card Management
// =====================================================

function openAddCardModal(weekId) {
    document.getElementById('modalTitle').textContent = 'Add Learning Activity';
    document.getElementById('cardForm').reset();
    document.getElementById('cardId').value = '';
    document.getElementById('cardWeek').value = weekId;
    document.getElementById('deleteCardBtn').style.display = 'none';
    
    // Uncheck all learning types
    document.querySelectorAll('input[name="learningType"]').forEach(cb => {
        cb.checked = false;
    });

    document.getElementById('cardModal').classList.add('active');
}

function openEditCardModal(cardId) {
    event.stopPropagation();
    
    const card = boardData.cards.find(c => c.id === cardId);
    if (!card) return;

    document.getElementById('modalTitle').textContent = 'Edit Learning Activity';
    document.getElementById('cardId').value = card.id;
    document.getElementById('cardWeek').value = card.weekId;
    document.getElementById('activityTitle').value = card.title || '';
    document.getElementById('deliveryDate').value = card.deliveryDate || '';
    document.getElementById('duration').value = card.duration || '';
    document.getElementById('deliveredBy').value = card.deliveredBy || '';
    document.getElementById('description').value = card.description || '';
    document.getElementById('deliveryStyle').value = card.deliveryStyle || '';
    document.getElementById('assessmentType').value = card.assessmentType || '';
    document.getElementById('notes').value = card.notes || '';
    
    // Set learning types checkboxes
    document.querySelectorAll('input[name="learningType"]').forEach(cb => {
        cb.checked = (card.learningTypes || []).includes(cb.value);
    });

    document.getElementById('deleteCardBtn').style.display = 'inline-flex';
    document.getElementById('cardModal').classList.add('active');
}

function closeModal() {
    document.getElementById('cardModal').classList.remove('active');
}

function saveCard() {
    const cardId = document.getElementById('cardId').value;
    const weekId = document.getElementById('cardWeek').value;
    const title = document.getElementById('activityTitle').value.trim();

    if (!title) {
        showToast('Please enter an activity title', 'error');
        return;
    }

    // Get selected learning types
    const learningTypes = [];
    document.querySelectorAll('input[name="learningType"]:checked').forEach(cb => {
        learningTypes.push(cb.value);
    });

    const cardData = {
        title: title,
        weekId: weekId,
        deliveryDate: document.getElementById('deliveryDate').value,
        duration: document.getElementById('duration').value.trim(),
        deliveredBy: document.getElementById('deliveredBy').value.trim(),
        description: document.getElementById('description').value.trim(),
        learningTypes: learningTypes,
        deliveryStyle: document.getElementById('deliveryStyle').value,
        assessmentType: document.getElementById('assessmentType').value,
        notes: document.getElementById('notes').value.trim()
    };

    if (cardId) {
        // Update existing card
        const card = boardData.cards.find(c => c.id === cardId);
        if (card) {
            Object.assign(card, cardData);
            showToast('Activity updated successfully', 'success');
        }
    } else {
        // Create new card
        const weekCards = boardData.cards.filter(c => c.weekId === weekId);
        cardData.id = generateId();
        cardData.order = weekCards.length + 1;
        boardData.cards.push(cardData);
        showToast('Activity added successfully', 'success');
    }

    renderBoard();
    closeModal();
}

function deleteCard() {
    const cardId = document.getElementById('cardId').value;
    const card = boardData.cards.find(c => c.id === cardId);
    
    if (!card) return;

    showConfirm('Delete Activity', `Delete "${card.title}"?`, () => {
        boardData.cards = boardData.cards.filter(c => c.id !== cardId);
        renderBoard();
        closeModal();
        showToast('Activity deleted', 'success');
    });
}

// =====================================================
// Drag and Drop
// =====================================================

function setupDropZone(element) {
    element.addEventListener('dragover', (e) => {
        e.preventDefault();
        element.classList.add('drag-over');
    });

    element.addEventListener('dragleave', (e) => {
        element.classList.remove('drag-over');
    });

    element.addEventListener('drop', (e) => {
        e.preventDefault();
        element.classList.remove('drag-over');
        
        const cardId = e.dataTransfer.getData('text/plain');
        const newWeekId = element.dataset.weekId;
        
        if (cardId && newWeekId) {
            moveCardToWeek(cardId, newWeekId);
        }
    });

    // Setup drag events for cards within this zone
    element.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('card')) {
            e.target.classList.add('dragging');
            e.dataTransfer.setData('text/plain', e.target.dataset.cardId);
            draggedCard = e.target;
        }
    });

    element.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('card')) {
            e.target.classList.remove('dragging');
            draggedCard = null;
        }
    });
}

function moveCardToWeek(cardId, newWeekId) {
    const card = boardData.cards.find(c => c.id === cardId);
    if (!card) return;

    card.weekId = newWeekId;
    
    // Update order for the new week
    const weekCards = boardData.cards.filter(c => c.weekId === newWeekId);
    card.order = weekCards.length;

    renderBoard();
    showToast('Activity moved', 'info');
}

// =====================================================
// Export Functions
// =====================================================

function exportToImage() {
    showToast('Generating image...', 'info');
    
    const board = document.getElementById('board');
    const boardWrapper = document.querySelector('.board-wrapper');
    
    // Temporarily expand the board for full capture
    const originalOverflow = boardWrapper.style.overflow;
    boardWrapper.style.overflow = 'visible';
    
    html2canvas(board, {
        backgroundColor: '#16162a',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: board.scrollWidth,
        windowHeight: board.scrollHeight
    }).then(canvas => {
        boardWrapper.style.overflow = originalOverflow;
        
        const link = document.createElement('a');
        link.download = `${sanitizeFilename(boardData.title)}_${getDateString()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        showToast('Image exported successfully', 'success');
    }).catch(err => {
        boardWrapper.style.overflow = originalOverflow;
        console.error('Export error:', err);
        showToast('Error exporting image', 'error');
    });
}

function exportToPDF() {
    showToast('Generating PDF...', 'info');
    
    const board = document.getElementById('board');
    const boardWrapper = document.querySelector('.board-wrapper');
    
    const originalOverflow = boardWrapper.style.overflow;
    boardWrapper.style.overflow = 'visible';
    
    html2canvas(board, {
        backgroundColor: '#16162a',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: board.scrollWidth,
        windowHeight: board.scrollHeight
    }).then(canvas => {
        boardWrapper.style.overflow = originalOverflow;
        
        const { jsPDF } = window.jspdf;
        
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        // Calculate PDF dimensions (landscape for board layout)
        const pdfWidth = imgWidth * 0.264583; // Convert pixels to mm at 96 DPI
        const pdfHeight = imgHeight * 0.264583;
        
        const pdf = new jsPDF({
            orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
            unit: 'mm',
            format: [pdfWidth, pdfHeight]
        });
        
        // Add title
        pdf.setFontSize(24);
        pdf.setTextColor(255, 255, 255);
        
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        pdf.save(`${sanitizeFilename(boardData.title)}_${getDateString()}.pdf`);
        
        showToast('PDF exported successfully', 'success');
    }).catch(err => {
        boardWrapper.style.overflow = originalOverflow;
        console.error('Export error:', err);
        showToast('Error exporting PDF', 'error');
    });
}

function saveToJSON() {
    boardData.lastModified = new Date().toISOString();
    boardData.title = document.getElementById('boardTitle').value;
    
    const dataStr = JSON.stringify(boardData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = `${sanitizeFilename(boardData.title)}_${getDateString()}.json`;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
    showToast('Design saved successfully', 'success');
}

function loadFromJSON() {
    document.getElementById('fileInput').click();
}

function handleFileLoad(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            // Validate the loaded data
            if (!data.weeks || !Array.isArray(data.weeks)) {
                throw new Error('Invalid file format: missing weeks');
            }
            if (!data.cards || !Array.isArray(data.cards)) {
                data.cards = [];
            }
            
            boardData = data;
            document.getElementById('boardTitle').value = boardData.title || 'My Learning Design';
            renderBoard();
            showToast('Design loaded successfully', 'success');
        } catch (err) {
            console.error('Load error:', err);
            showToast('Error loading file: Invalid format', 'error');
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

// =====================================================
// Local Storage
// =====================================================

function saveToLocalStorage() {
    boardData.lastModified = new Date().toISOString();
    boardData.title = document.getElementById('boardTitle').value;
    localStorage.setItem('abcld_board', JSON.stringify(boardData));
}

// =====================================================
// Confirmation Modal
// =====================================================

function showConfirm(title, message, callback) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    confirmCallback = callback;
    
    const confirmBtn = document.getElementById('confirmBtn');
    confirmBtn.onclick = () => {
        if (confirmCallback) {
            confirmCallback();
        }
        closeConfirmModal();
    };
    
    document.getElementById('confirmModal').classList.add('active');
}

function closeConfirmModal() {
    document.getElementById('confirmModal').classList.remove('active');
    confirmCallback = null;
}

// =====================================================
// Toast Notifications
// =====================================================

function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    container.id = 'toastContainer';
    document.body.appendChild(container);
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' 
               : type === 'error' ? 'fa-exclamation-circle' 
               : 'fa-info-circle';
    
    toast.innerHTML = `<i class="fas ${icon}"></i> ${escapeHtml(message)}`;
    container.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// =====================================================
// Utility Functions
// =====================================================

function generateId() {
    return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (e) {
        return dateStr;
    }
}

function getDateString() {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

function sanitizeFilename(name) {
    return (name || 'abcld').replace(/[^a-z0-9]/gi, '_').substring(0, 50);
}

// =====================================================
// Keyboard Shortcuts
// =====================================================

document.addEventListener('keydown', (e) => {
    // Ctrl+S to save
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveToJSON();
    }
    // Ctrl+O to open/load
    if (e.ctrlKey && e.key === 'o') {
        e.preventDefault();
        loadFromJSON();
    }
    // Ctrl+E to export image
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        exportToImage();
    }
});

// =====================================================
// Initialize on Load
// =====================================================

// Auto-save every 30 seconds
setInterval(() => {
    saveToLocalStorage();
}, 30000);

// Save before leaving page
window.addEventListener('beforeunload', () => {
    saveToLocalStorage();
});
