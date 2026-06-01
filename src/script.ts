interface Product {
  title: string;
  price: string;
  taxes: string;
  ads: string;
  discount: string;
  total: string;
  count: number;
  category: string;
}

type SearchMood = "title" | "category";
type Mode = "create" | "update";

const title = getRequiredElement<HTMLInputElement>("title");
const price = getRequiredElement<HTMLInputElement>("price");
const taxes = getRequiredElement<HTMLInputElement>("taxes");
const ads = getRequiredElement<HTMLInputElement>("ads");
const discount = getRequiredElement<HTMLInputElement>("discount");
const total = getRequiredElement<HTMLElement>("total");
const count = getRequiredElement<HTMLInputElement>("count");
const category = getRequiredElement<HTMLInputElement>("category");
const submit = getRequiredElement<HTMLButtonElement>("submit");
const search = getRequiredElement<HTMLInputElement>("search");
const searchTitle = getRequiredElement<HTMLButtonElement>("searchtitle");
const searchCategory = getRequiredElement<HTMLButtonElement>("searchcategory");
const message = getRequiredElement<HTMLDivElement>("message");
const cancelEdit = getRequiredElement<HTMLButtonElement>("cancelEdit");
const tbody = getRequiredElement<HTMLTableSectionElement>("tbody");
const deleteAllContainer = getRequiredElement<HTMLDivElement>("deleteAll");

const state = {
  mode: "create" as Mode,
  editIndex: null as number | null,
  searchMode: "title" as SearchMood,
  products: loadProducts(),
};

function getRequiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing required element: ${id}`);
  }

  return element as T;
}

function loadProducts(): Product[] {
  const storedProducts = localStorage.getItem("product");

  if (!storedProducts) {
    return [];
  }

  try {
    const parsed = JSON.parse(storedProducts) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(normalizeProduct).filter((product): product is Product => product !== null);
  } catch {
    return [];
  }
}

function normalizeProduct(value: unknown): Product | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as Partial<Product> & Record<string, unknown>;

  if (
    typeof candidate.title !== "string" ||
    typeof candidate.price !== "string" ||
    typeof candidate.taxes !== "string" ||
    typeof candidate.ads !== "string" ||
    typeof candidate.discount !== "string" ||
    typeof candidate.total !== "string" ||
    typeof candidate.count !== "number" ||
    typeof candidate.category !== "string"
  ) {
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

function escapeHTML(value: string | number): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function storeProducts(): void {
  localStorage.setItem("product", JSON.stringify(state.products));
}

function addProduct(product: Product): void {
  if (product.count > 1) {
    for (let index = 0; index < product.count; index += 1) {
      state.products.push({ ...product });
    }
    return;
  }

  state.products.push(product);
}

function updateProduct(index: number, product: Product): void {
  state.products[index] = product;
}

function removeProduct(index: number): void {
  state.products.splice(index, 1);
}

function clearProducts(): void {
  state.products = [];
}

function renderEmptyState(emptyText: string): void {
  tbody.innerHTML = `
      <tr>
        <td class="empty-state" colspan="10">${emptyText}</td>
      </tr>
    `;
}

function setEditMode(active: boolean, index: number | null = null): void {
  state.mode = active ? "update" : "create";
  state.editIndex = index;
  submit.textContent = active ? "update" : "create";
  count.style.display = active ? "none" : "block";
  cancelEdit.hidden = !active;
}

function getTotal(): void {
  if (price.value !== "") {
    const result = (+price.value + +taxes.value + +ads.value) - +discount.value;
    total.textContent = String(result);
    total.style.background = "#040";
  } else {
    total.textContent = "";
    total.style.background = "#a00d02";
  }
}

function showMessage(text: string, type: "error" | "success"): void {
  message.textContent = text;
  message.className = `message ${type}`;
}

function clearMessage(): void {
  message.textContent = "";
  message.className = "message";
}

function clearData(): void {
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

function resetEditMode(): void {
  setEditMode(false);
  clearData();
  showMessage("Edit mode canceled.", "success");
  title.focus();
}

function submitData(): void {
  const action = state.mode;
  const normalizedTitle = title.value.trim().toLowerCase();
  const normalizedCategory = category.value.trim().toLowerCase();
  const newPro: Product = {
    title: normalizedTitle,
    price: price.value,
    taxes: taxes.value,
    ads: ads.value,
    discount: discount.value,
    total: total.textContent ?? "",
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
  } else if (state.editIndex !== null) {
    updateProduct(state.editIndex, newPro);
    setEditMode(false);
  }

  storeProducts();
  clearData();
  showData();
  showMessage(action === "create" ? "Product saved successfully." : "Product updated successfully.", "success");
  title.focus();
}

function renderRows(items: Product[], emptyText: string): void {
  if (items.length === 0) {
    renderEmptyState(emptyText);
    return;
  }

  tbody.innerHTML = items
    .map(
      (item, index) => `
        <tr>
          <td data-label="id">${index + 1}</td>
          <td data-label="title">${escapeHTML(item.title)}</td>
          <td data-label="price">${escapeHTML(item.price)}</td>
          <td data-label="taxes">${escapeHTML(item.taxes)}</td>
          <td data-label="ads">${escapeHTML(item.ads)}</td>
          <td data-label="discount">${escapeHTML(item.discount)}</td>
          <td data-label="total">${escapeHTML(item.total)}</td>
          <td data-label="category">${escapeHTML(item.category)}</td>
          <td data-label="update"><button class="update" type="button" data-action="update" data-index="${index}">update</button></td>
          <td data-label="delete"><button class="delete" type="button" data-action="delete" data-index="${index}">delete</button></td>
        </tr>
      `,
    )
    .join("");
}

function showData(): void {
  getTotal();
  renderRows(state.products, "No products yet. Add the first item to get started.");

  if (state.products.length > 0) {
    deleteAllContainer.innerHTML = `<button type="button" data-action="delete-all">delete all (${state.products.length})</button>`;
  } else {
    deleteAllContainer.innerHTML = "";
  }
}

function deleteData(index: number): void {
  if (!confirm("Delete this product?")) {
    return;
  }

  removeProduct(index);
  storeProducts();
  showData();
  showMessage("Product deleted.", "success");
}

function deleteAll(): void {
  if (!confirm("Delete all products?")) {
    return;
  }

  localStorage.removeItem("product");
  clearProducts();
  showData();
  showMessage("All products deleted.", "success");
}

function updateData(index: number): void {
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

function getSearchMood(id: string): void {
  state.searchMode = id === "searchtitle" ? "title" : "category";
  search.placeholder = `search by ${state.searchMode}`;
  search.focus();
  search.value = "";
  showData();
}

function searchData(value: string): void {
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

function matchesSearch(product: Product, query: string): boolean {
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
search.addEventListener("input", (event: Event) => {
  const target = event.target;

  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  searchData(target.value);
});
searchTitle.addEventListener("click", () => getSearchMood("searchtitle"));
searchCategory.addEventListener("click", () => getSearchMood("searchcategory"));
tbody.addEventListener("click", (event: MouseEvent) => {
  const target = event.target;

  if (!(target instanceof HTMLElement)) {
    return;
  }

  const actionButton = target.closest<HTMLButtonElement>("button[data-action]");

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
deleteAllContainer.addEventListener("click", (event: MouseEvent) => {
  const target = event.target;

  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (target.closest("button[data-action='delete-all']")) {
    deleteAll();
  }
});
document.addEventListener("keydown", (event: KeyboardEvent) => {
  if (event.key === "Escape" && state.mode === "update") {
    resetEditMode();
  }
});

cancelEdit.hidden = true;
showData();
