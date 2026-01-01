let inventory = [];
let currentImg = "";
let editIndex = null;

// --- DARK MODE LOGIC ---
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    document.getElementById('modeIcon').innerText = isDark ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDark);
}

// --- SIDEBAR TOGGLE LOGIC ---
function toggleSidebar() {
    document.body.classList.toggle('sidebar-hidden');
    const isHidden = document.body.classList.contains('sidebar-hidden');
    document.getElementById('toggleIcon').innerText = isHidden ? '▶' : '◀';
}

// --- IMAGE PROCESSING ---
document.getElementById('itemImage').onchange = function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const maxSize = 250;
            let w = img.width, h = img.height;
            if (w > h) { h *= maxSize / w; w = maxSize; } else { w *= maxSize / h; h = maxSize; }
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            currentImg = canvas.toDataURL('image/jpeg', 0.6);
            document.getElementById('preview').innerHTML = `<img src="${currentImg}" style="width:100%; border-radius:8px; margin-bottom:10px;">`;
            document.getElementById('fileText').innerText = "✅ Зураг бэлэн";
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
};

// --- SAVE ITEM ---
document.getElementById('addBtn').onclick = function () {
    const name = document.getElementById('itemName').value;
    const price = Number(document.getElementById('itemPrice').value) || 0;
    const varText = document.getElementById('itemColorName').value;
    if (!name || !varText) return alert("Мэдээллээ бүрэн оруулна уу!");

    const variants = varText.split(',').map(v => {
        const p = v.split(':');
        return { color: p[0].trim(), qty: parseInt(p[1]) || 1 };
    });

    const itemData = { name, price, image: currentImg, variants };
    if (editIndex !== null) inventory[editIndex] = itemData;
    else inventory.push(itemData);

    editIndex = null;
    document.getElementById('addBtn').innerText = "💾 Хадгалах";
    resetForm();
    render();
};

// --- RENDER ---
function render(data = inventory) {
    const grid = document.getElementById('inventoryGrid');
    grid.innerHTML = "";
    let grandTotal = 0;

    data.forEach((item, i) => {
        const totalQty = item.variants.reduce((a, b) => a + b.qty, 0);
        const itemTotal = totalQty * item.price;
        grandTotal += itemTotal;

        const card = document.createElement('div');
        card.className = "card";
        const badges = item.variants.map(v => `<span class="badge">${v.color}: ${v.qty}</span>`).join("");

        card.innerHTML = `
                    <img src="${item.image || 'https://via.placeholder.com/250x150?text=No+Image'}">
                    <div class="card-body">
                        <h4 style="margin:0 0 5px 0;">${item.name}</h4>
                        <div>${badges}</div>
                        <span class="price">$${itemTotal.toLocaleString()}</span>
                        <div class="no-print" style="margin-top:10px; display:flex; gap:5px;">
                            <button onclick="editItem(${i})" style="flex:1; cursor:pointer;">Засах</button>
                            <button onclick="deleteItem(${i})" style="flex:1; cursor:pointer; color:red;">Устгах</button>
                        </div>
                    </div>
                `;
        grid.appendChild(card);
    });
    document.getElementById('total').innerText = "$" + grandTotal.toLocaleString();
    localStorage.setItem('inv_v3', JSON.stringify(inventory));
}

function resetForm() {
    document.getElementById('itemName').value = "";
    document.getElementById('itemPrice').value = "";
    document.getElementById('itemColorName').value = "";
    document.getElementById('preview').innerHTML = "";
    document.getElementById('fileText').innerText = "📸 Зураг сонгох";
    currentImg = "";
}

window.editItem = (i) => {
    const it = inventory[i];
    document.getElementById('itemName').value = it.name;
    document.getElementById('itemPrice').value = it.price;
    document.getElementById('itemColorName').value = it.variants.map(v => `${v.color}:${v.qty}`).join(",");
    currentImg = it.image;
    editIndex = i;
    document.getElementById('addBtn').innerText = "🔄 Шинэчлэх";
    document.getElementById('preview').innerHTML = `<img src="${currentImg}" style="width:100%; border-radius:8px;">`;
    if (document.body.classList.contains('sidebar-hidden')) toggleSidebar();
    window.scrollTo(0, 0);
};

window.deleteItem = (i) => { if (confirm("Устгах уу?")) { inventory.splice(i, 1); render(); } };

function searchItems() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    const filtered = inventory.filter(it => it.name.toLowerCase().includes(q));
    render(filtered);
}

// --- LOAD DATA ---
window.onload = () => {
    const saved = localStorage.getItem('inv_v3');
    if (saved) { inventory = JSON.parse(saved); render(); }

    // Шөнийн горимын тохиргоог сэргээх
    if (localStorage.getItem('darkMode') === 'true') {
        toggleDarkMode();
    }
};