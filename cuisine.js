// Initial Mock Data representing typical orders in a POS system
let orders = [
    {
        id: 'ORD-042',
        server: 'Sarah K.',
        table: 12,
        timePlaced: new Date(Date.now() - 15 * 60000), // 15 mins ago
        status: 'pending',
        priority: 'rush',
        items: [
            { qty: 1, name: 'Margherita Royale', notes: '' },
            { qty: 2, name: 'Truffle Beast Burger', notes: 'Medium Rare on meat' }
        ]
    },
    {
        id: 'ORD-043',
        server: 'Mike D.',
        table: 4,
        timePlaced: new Date(Date.now() - 6 * 60000), // 6 mins ago
        status: 'pending',
        priority: 'normal',
        items: [
            { qty: 1, name: 'Spiced Lamb Wrap', notes: 'Extra Tahini on side' },
            { qty: 1, name: 'Zen Garden Bowl', notes: 'No Avocado please' }
        ]
    },
    {
        id: 'ORD-041',
        server: 'Elena V.',
        table: 8,
        timePlaced: new Date(Date.now() - 25 * 60000), // 25 mins ago
        status: 'cooking',
        priority: 'normal',
        items: [
            { qty: 3, name: 'Diavola Inferno', notes: '' },
            { qty: 1, name: 'Truffle Beast Burger', notes: '' }
        ]
    },
    {
        id: 'ORD-039',
        server: 'Mike D.',
        table: 2,
        timePlaced: new Date(Date.now() - 32 * 60000),
        status: 'ready',
        priority: 'normal',
        items: [
            { qty: 2, name: 'Ocean Blue Bowl', notes: '' }
        ]
    }
];

window.switchTab = (tab) => {
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.nav-tab[onclick*="${tab}"]`).classList.add('active');
    const board = document.querySelector('.kanban-board');
    board.className = `kanban-board active-${tab}`;
};

// Render Orders to UI
function renderOrders() {
    const pendingList = document.getElementById('list-pending');
    const cookingList = document.getElementById('list-cooking');
    const readyList = document.getElementById('list-ready');

    const pendingMap = document.getElementById('map-pending');
    const cookingMap = document.getElementById('map-cooking');
    const readyMap = document.getElementById('map-ready');

    // Clear Lists & Maps
    pendingList.innerHTML = '';
    cookingList.innerHTML = '';
    readyList.innerHTML = '';
    pendingMap.innerHTML = '';
    cookingMap.innerHTML = '';
    readyMap.innerHTML = '';

    let pCount = 0, cCount = 0, rCount = 0;

    // Sort: Oldest first
    const sortedOrders = [...orders].sort((a, b) => a.timePlaced - b.timePlaced);

    sortedOrders.forEach(order => {
        const elapsedMin = Math.floor((new Date() - order.timePlaced) / 60000);

        // Auto-escalate priority if taking too long
        if (order.status === 'pending') {
            if (elapsedMin >= 20) {
                order.priority = 'rush';
            } else {
                order.priority = 'normal';
            }
        }

        const ticket = document.createElement('div');
        ticket.className = `ticket status-${order.status} priority-${order.priority}`;

        let itemsHtml = order.items.map(item => `
            <li class="ticket-item">
                <div style="display: flex;">
                    <span class="item-qty">${item.qty}x</span>
                    <span class="item-name">${item.name}
                        ${item.notes ? `<span class="item-notes">* ${item.notes}</span>` : ''}
                    </span>
                </div>
            </li>
        `).join('');

        ticket.innerHTML = `
            <div class="ticket-header">
                <div class="order-id">#${order.id}</div>
                <div style="font-size: 1.25rem; font-weight: bold;">Table ${order.table}</div>
                <div class="ticket-time">${elapsedMin}m ago</div>
            </div>
            <div class="server-name">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Server: ${order.server}
            </div>
            <ul class="ticket-items">
                ${itemsHtml}
            </ul>
            <div class="ticket-actions">
                <button class="btn btn-primary"></button>
            </div>
        `;

        ticket.onclick = () => {
            ticket.classList.add('clicked');
            setTimeout(() => advanceOrder(order.id), 150);
        };

        const mapItem = document.createElement('div');
        mapItem.className = 'mini-map-item';
        mapItem.textContent = order.table;
        mapItem.title = `Table ${order.table} / ID #${order.id}`;
        mapItem.onclick = () => {
            ticket.scrollIntoView({ behavior: 'smooth', block: 'center' });
            ticket.style.transition = 'box-shadow 0.3s';
            ticket.style.boxShadow = '0 0 0 4px var(--text-secondary)';
            setTimeout(() => ticket.style.boxShadow = '', 800);
        };

        if (order.status === 'pending') {
            pendingList.appendChild(ticket);
            pendingMap.appendChild(mapItem);
            pCount++;
        } else if (order.status === 'cooking') {
            cookingList.appendChild(ticket);
            cookingMap.appendChild(mapItem);
            cCount++;
        } else if (order.status === 'ready') {
            readyList.appendChild(ticket);
            readyMap.appendChild(mapItem);
            rCount++;
        }
    });

    // Update Kanban List Counts
    document.querySelector('#col-pending .count').textContent = pCount;
    document.querySelector('#col-cooking .count').textContent = cCount;
    document.querySelector('#col-ready .count').textContent = rCount;

    // Update Header Global Stats
    document.getElementById('pending-count').textContent = pCount;
    document.getElementById('cooking-count').textContent = cCount;
}

// Global function to push order state forward
window.advanceOrder = (id) => {
    const order = orders.find(o => o.id === id);
    if (order) {
        if (order.status === 'pending') {
            order.status = 'cooking';
            order.priority = 'normal'; // remove the red when in progress
        } else if (order.status === 'cooking') {
            order.status = 'ready';
            // Play a ding sound (mock mechanism for kitchen)
            console.log(`Order ${id} is ready for pick up!`);
        } else if (order.status === 'ready') {
            orders = orders.filter(o => o.id !== id); // Archive immediately
        }
        renderOrders();
    }
};

// Simulate incoming orders seamlessly
const menuItems = [
    'Margherita Royale', 'Black Truffle Pizza', 'Diavola Inferno',
    'Truffle Beast Burger', 'Smoke & Oak', 'Blue Moon',
    'Spiced Lamb Wrap', 'Golden Chicken', 'Mixed Royale',
    'Zen Garden Bowl', 'Ocean Blue Bowl', 'Dragon Fire Bowl'
];

const servers = ['Sarah K.', 'Mike D.', 'Elena V.', 'Alex B.', 'David W.'];

setInterval(() => {
    // Only add a new order if we have less than 5 pending to avoid overcrowding UI
    if (orders.filter(o => o.status === 'pending').length < 6) {
        const idNum = Math.floor(Math.random() * 900) + 100;

        // Randomize items
        const numItems = Math.floor(Math.random() * 3) + 1;
        const newItems = [];
        for (let i = 0; i < numItems; i++) {
            newItems.push({
                qty: Math.floor(Math.random() * 2) + 1,
                name: menuItems[Math.floor(Math.random() * menuItems.length)],
                notes: Math.random() > 0.8 ? 'No onions please' : ''
            });
        }

        orders.push({
            id: 'ORD-' + idNum,
            server: servers[Math.floor(Math.random() * servers.length)],
            table: Math.floor(Math.random() * 20) + 1,
            timePlaced: new Date(),
            status: 'pending',
            priority: 'normal',
            items: newItems
        });
        renderOrders();
    }
}, 45000); // Check every 45 secs to possibly add

// Initial Render
renderOrders();

// Auto refresh timings every minute
setInterval(renderOrders, 60000);
