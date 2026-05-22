"use strict";
const title = getRequiredElement("title");
const price = getRequiredElement("price");
const taxes = getRequiredElement("taxes");
const ads = getRequiredElement("ads");
const discount = getRequiredElement("discount");
const total = getRequiredElement("total");
const count = getRequiredElement("count");
const category = getRequiredElement("category");
const submit = getRequiredElement("submit");
const search = getRequiredElement("search");
const searchTitle = getRequiredElement("searchtitle");
const searchCategory = getRequiredElement("searchcategory");
const message = getRequiredElement("message");
const cancelEdit = getRequiredElement("cancelEdit");
const tbody = getRequiredElement("tbody");
const deleteAllContainer = getRequiredElement("deleteAll");
const state = {
    mode: "create",
    editIndex: null,
    searchMode: "title",
    products: loadProducts(),
};
function getRequiredElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Missing required element: ${id}`);
    }
    return element;
}
function loadProducts() {
    const storedProducts = localStorage.getItem("product");
    if (!storedProducts) {
        return [];
    }
    try {
        const parsed = JSON.parse(storedProducts);
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed.map(normalizeProduct).filter((product) => product !== null);
    }
    catch (_a) {
        return [];
    }
}
function normalizeProduct(value) {
    if (typeof value !== "object" || value === null) {
        return null;
    }
    const candidate = value;
    if (typeof candidate.title !== "string" ||
        typeof candidate.price !== "string" ||
        typeof candidate.taxes !== "string" ||
        typeof candidate.ads !== "string" ||
        typeof candidate.discount !== "string" ||
        typeof candidate.total !== "string" ||
        typeof candidate.count !== "number" ||
        typeof candidate.category !== "string") {
        return null;
    }
    return {
        title: candidate.title,
        price: candidate.price,
        taxes: candidate.taxes,
        ads: candidate.ads,
        discount: candidate.discount,
        total: candidate.total,
        count: candidate.count,
        category: candidate.category,
    };
}
function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
function storeProducts() {
    localStorage.setItem("product", JSON.stringify(state.products));
}
function addProduct(product) {
    if (product.count > 1) {
        for (let index = 0; index < product.count; index += 1) {
            state.products.push(Object.assign({}, product));
        }
        return;
    }
    state.products.push(product);
}
function updateProduct(index, product) {
    state.products[index] = product;
}
function removeProduct(index) {
    state.products.splice(index, 1);
}
function clearProducts() {
    state.products = [];
}
function renderEmptyState(emptyText) {
    tbody.innerHTML = `
      <tr>
        <td class="empty-state" colspan="10">${emptyText}</td>
      </tr>
    `;
}
function setEditMode(active, index = null) {
    state.mode = active ? "update" : "create";
    state.editIndex = index;
    submit.textContent = active ? "update" : "create";
    count.style.display = active ? "none" : "block";
    cancelEdit.hidden = !active;
}
function getTotal() {
    if (price.value !== "") {
        const result = (+price.value + +taxes.value + +ads.value) - +discount.value;
        total.textContent = String(result);
        total.style.background = "#040";
    }
    else {
        total.textContent = "";
        total.style.background = "#a00d02";
    }
}
function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
}
function clearMessage() {
    message.textContent = "";
    message.className = "message";
}
function clearData() {
    title.value = "";
    price.value = "";
    taxes.value = "";
    ads.value = "";
    discount.value = "";
    total.textContent = "";
    count.value = "";
    category.value = "";
    clearMessage();
}
function resetEditMode() {
    setEditMode(false);
    clearData();
    showMessage("Edit mode canceled.", "success");
    title.focus();
}
function submitData() {
    var _a;
    const action = state.mode;
    const normalizedTitle = title.value.trim().toLowerCase();
    const normalizedCategory = category.value.trim().toLowerCase();
    const newPro = {
        title: normalizedTitle,
        price: price.value,
        taxes: taxes.value,
        ads: ads.value,
        discount: discount.value,
        total: (_a = total.textContent) !== null && _a !== void 0 ? _a : "",
        count: +count.value || 1,
        category: normalizedCategory,
    };
    if (normalizedTitle === "" || price.value === "" || normalizedCategory === "") {
        showMessage("Please fill title, price, and category.", "error");
        return;
    }
    if (newPro.count < 1 || newPro.count > 100) {
        showMessage("Count must be between 1 and 100.", "error");
        return;
    }
    if (state.mode === "create") {
        addProduct(newPro);
    }
    else if (state.editIndex !== null) {
        updateProduct(state.editIndex, newPro);
        setEditMode(false);
    }
    storeProducts();
    clearData();
    showData();
    showMessage(action === "create" ? "Product saved successfully." : "Product updated successfully.", "success");
    title.focus();
}
function renderRows(items, emptyText) {
    if (items.length === 0) {
        renderEmptyState(emptyText);
        return;
    }
    tbody.innerHTML = items
        .map((item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHTML(item.title)}</td>
          <td>${escapeHTML(item.price)}</td>
          <td>${escapeHTML(item.taxes)}</td>
          <td>${escapeHTML(item.ads)}</td>
          <td>${escapeHTML(item.discount)}</td>
          <td>${escapeHTML(item.total)}</td>
          <td>${escapeHTML(item.category)}</td>
          <td><button class="update" type="button" data-action="update" data-index="${index}">update</button></td>
          <td><button class="delete" type="button" data-action="delete" data-index="${index}">delete</button></td>
        </tr>
      `)
        .join("");
}
function showData() {
    getTotal();
    renderRows(state.products, "No products yet. Add the first item to get started.");
    if (state.products.length > 0) {
        deleteAllContainer.innerHTML = `<button type="button" data-action="delete-all">delete all (${state.products.length})</button>`;
    }
    else {
        deleteAllContainer.innerHTML = "";
    }
}
function deleteData(index) {
    if (!confirm("Delete this product?")) {
        return;
    }
    removeProduct(index);
    storeProducts();
    showData();
    showMessage("Product deleted.", "success");
}
function deleteAll() {
    if (!confirm("Delete all products?")) {
        return;
    }
    localStorage.removeItem("product");
    clearProducts();
    showData();
    showMessage("All products deleted.", "success");
}
function updateData(index) {
    const product = state.products[index];
    if (!product) {
        return;
    }
    title.value = product.title;
    price.value = product.price;
    taxes.value = product.taxes;
    ads.value = product.ads;
    discount.value = product.discount;
    getTotal();
    category.value = product.category;
    setEditMode(true, index);
    window.scroll({
        top: 0,
        behavior: "smooth",
    });
}
function getSearchMood(id) {
    state.searchMode = id === "searchtitle" ? "title" : "category";
    search.placeholder = `search by ${state.searchMode}`;
    search.focus();
    search.value = "";
    showData();
}
function searchData(value) {
    if (value.trim() === "") {
        showData();
        return;
    }
    const filteredProducts = state.products.filter((product) => matchesSearch(product, value));
    if (filteredProducts.length === 0) {
        tbody.innerHTML = `
      <tr>
        <td class="empty-state search-empty" colspan="10">No matching products found.</td>
      </tr>
    `;
        return;
    }
    renderRows(filteredProducts, "No matching products found.");
}
function matchesSearch(product, query) {
    const currentValue = query.toLowerCase();
    return state.searchMode === "title"
        ? product.title.toLowerCase().includes(currentValue)
        : product.category.toLowerCase().includes(currentValue);
}
price.addEventListener("input", getTotal);
taxes.addEventListener("input", getTotal);
ads.addEventListener("input", getTotal);
discount.addEventListener("input", getTotal);
submit.addEventListener("click", submitData);
cancelEdit.addEventListener("click", resetEditMode);
search.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
        return;
    }
    searchData(target.value);
});
searchTitle.addEventListener("click", () => getSearchMood("searchtitle"));
searchCategory.addEventListener("click", () => getSearchMood("searchcategory"));
tbody.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
        return;
    }
    const actionButton = target.closest("button[data-action]");
    if (!actionButton || !actionButton.dataset.action) {
        return;
    }
    const index = Number(actionButton.dataset.index);
    if (actionButton.dataset.action === "update") {
        updateData(index);
        return;
    }
    if (actionButton.dataset.action === "delete") {
        deleteData(index);
    }
});
deleteAllContainer.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
        return;
    }
    if (target.closest("button[data-action='delete-all']")) {
        deleteAll();
    }
});
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.mode === "update") {
        resetEditMode();
    }
});
cancelEdit.hidden = true;
showData();
