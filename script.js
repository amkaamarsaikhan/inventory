let inventory = JSON.parse(localStorage.getItem("inventory")) || [];
let editId = null;

const grid = document.getElementById("inventoryGrid");

function saveToStorage(){
    localStorage.setItem("inventory", JSON.stringify(inventory));
}

function render(data = inventory){
    grid.innerHTML = "";
    let total = 0;

    data.forEach(item => {
        const qty = item.variants.reduce((s, v) => s + v.qty, 0);
        const sum = qty * item.price;
        total += sum;

        grid.innerHTML += `
        <div class="card">
            <h3>${item.name}</h3>

            ${item.variants.map((v, i) => `
                <div class="variant-row">
                    <span>${v.color} (${v.qty})</span>
                    <div class="variant-actions">
                        <button class="qty-btn add"
                            onclick="addQty(${item.id}, ${i})">+</button>
                        <button class="qty-btn sell"
                            onclick="sellItem(${item.id}, ${i})">Зарах</button>
                    </div>
                </div>
            `).join("")}

            <div class="price">₮${sum.toLocaleString()}</div>

            <div class="card-actions">
                <button class="edit-btn" onclick="editItem(${item.id})">Засах</button>
                <button class="delete-btn" onclick="deleteItem(${item.id})">Устгах</button>
            </div>
        </div>`;
    });

    document.getElementById("total").innerText =
        "₮" + total.toLocaleString();
}

function addVariantInput(color="", qty=0){
    const div = document.createElement("div");
    div.innerHTML = `
        <input class="v-color" placeholder="Өнгө" value="${color}">
        <input class="v-qty" type="number" value="${qty}">
    `;
    document.getElementById("variantInputs").appendChild(div);
}

function saveItem(){
    const name = itemName.value;
    const price = +itemPrice.value;
    if(!name || !price) return alert("Мэдээллээ бүрэн бөглөнө үү");

    const variants = [...document.querySelectorAll("#variantInputs div")]
        .map(d=>({
            color:d.querySelector(".v-color").value,
            qty:+d.querySelector(".v-qty").value
        })).filter(v=>v.color);

    if(editId !== null){
        const i = inventory.findIndex(x => x.id === editId);
        inventory[i] = {id:editId, name, price, variants};
    } else {
        inventory.push({id:Date.now(), name, price, variants});
    }

    saveToStorage();
    resetForm();
    toggleSidebar();
    render();
}

function sellItem(id, idx){
    const item = inventory.find(i => i.id === id);
    if(item.variants[idx].qty <= 0) return alert("Нөөц дууссан");
    item.variants[idx].qty--;
    saveToStorage();
    render();
}

function addQty(id, idx){
    const item = inventory.find(i => i.id === id);
    item.variants[idx].qty++;
    saveToStorage();
    render();
}

function editItem(id){
    const item = inventory.find(i => i.id === id);
    editId = id;
    itemName.value = item.name;
    itemPrice.value = item.price;
    variantInputs.innerHTML = "";
    item.variants.forEach(v => addVariantInput(v.color, v.qty));
    toggleSidebar();
}

function deleteItem(id){
    if(confirm("Устгах уу?")){
        inventory = inventory.filter(i => i.id !== id);
        saveToStorage();
        render();
    }
}

function searchItems(){
    const q = searchInput.value.toLowerCase();
    render(inventory.filter(i => i.name.toLowerCase().includes(q)));
}

function resetForm(){
    itemName.value = "";
    itemPrice.value = "";
    variantInputs.innerHTML = "";
    editId = null;
    addVariantInput();
}

function printReport() {
    let rows = "";
    let grandTotal = 0;

    inventory.forEach(item => {
        const qty = item.variants.reduce((s, v) => s + v.qty, 0);
        const sum = qty * item.price;
        grandTotal += sum;

        rows += `
        <tr>
            <td>${item.name}</td>
            <td>${qty}</td>
            <td>₮${item.price.toLocaleString()}</td>
            <td>₮${sum.toLocaleString()}</td>
        </tr>`;
    });

    const win = window.open("", "", "width=800,height=700");
    win.document.write(`
    <html>
    <head>
        <title>Агуулахын тайлан</title>
        <style>
            body { font-family: Arial; padding: 20px; }
            h2 { margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 10px; }
            th { background: #2563eb; color: white; }
            .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
            @media print { button { display: none; } }
        </style>
    </head>
    <body>
        <h2>🧾 Агуулахын тайлан</h2>
        <p>Огноо: ${new Date().toLocaleString()}</p>

        <table>
            <tr>
                <th>Бараа</th>
                <th>Нийт тоо</th>
                <th>Нэгж үнэ</th>
                <th>Нийт үнэ</th>
            </tr>
            ${rows}
        </table>

        <div class="total">
            Нийт хөрөнгө: ₮${grandTotal.toLocaleString()}
        </div>

        <br>
        <button onclick="window.print()">🖨️ Хэвлэх / PDF</button>
    </body>
    </html>
    `);
    win.document.close();
}

function toggleSidebar(){document.body.classList.toggle("open")}
function toggleDark(){document.body.classList.toggle("dark")}

addVariantInput();
render();

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
}
