const categories = [
  { id: 'surveillance', label: 'Électronique & vidéosurveillance' },
  { id: 'phones', label: 'Téléphones & accessoires' },
  { id: 'tools', label: 'Outils & équipements' },
  { id: 'computing', label: 'Informatique' },
];

const starterProducts = [
  { id: 'local-88e2f73f-aa96-4bef-b58b-05ac8b1a1a6d', name: 'RJ45', category: 'computing', price: 180, demo: false },
  { id: 'demo-camera', name: 'Caméra de sécurité', category: 'surveillance', price: 550, demo: true },
  { id: 'demo-phone', name: 'Téléphone mobile', category: 'phones', price: 550, demo: true },
  { id: 'demo-laptop', name: 'Ordinateur portable', category: 'computing', price: 3500, demo: true },
];

const storageKey = 'info-essoussi-admin-products-v1';
const rows = document.querySelector('#product-rows');
const searchInput = document.querySelector('#product-search');
const categoryFilter = document.querySelector('#category-filter');
const emptyState = document.querySelector('#empty-state');
const dialog = document.querySelector('#product-dialog');
const form = document.querySelector('#product-form');
const toast = document.querySelector('#toast');
const imageInput = document.querySelector('#product-image');
const imagePreview = document.querySelector('#image-preview');
const imagePreviewGrid = document.querySelector('#image-preview-grid');
let products = loadProducts();
let toastTimer;
let selectedImageFiles = [];
let existingImages = [];
let previewObjectUrls = [];

function loadProducts() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === null) return starterProducts.map((product) => ({ ...product }));
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return starterProducts.map((product) => ({ ...product }));
    const normalizedProducts = parsed
      .filter((product) => product && typeof product.id === 'string' && typeof product.name === 'string' && typeof product.category === 'string')
      .map((product) => {
        const confirmedProduct = starterProducts.find((starter) => starter.id === product.id);
        return confirmedProduct ? { ...product, price: confirmedProduct.price } : product;
      });
    const pricesChanged = normalizedProducts.some((product) => {
      const savedProduct = parsed.find((item) => item?.id === product.id);
      return starterProducts.some((starter) => starter.id === product.id && savedProduct?.price !== starter.price);
    });
    if (pricesChanged) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(normalizedProducts));
      } catch {
        return normalizedProducts;
      }
    }
    return normalizedProducts;
  } catch {
    return starterProducts.map((product) => ({ ...product }));
  }
}

function saveProducts() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(products));
    return true;
  } catch {
    showToast('Enregistrement local indisponible dans ce navigateur.');
    return false;
  }
}

function categoryName(categoryId) {
  return categories.find((category) => category.id === categoryId)?.label ?? 'À reclasser';
}

function createTextElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function getProductImages(product) {
  if (Array.isArray(product?.images)) return product.images.filter((image) => typeof image === 'string' && image).slice(0, 4);
  return typeof product?.image === 'string' && product.image ? [product.image] : [];
}

function makeProductRow(product, index) {
  const row = document.createElement('tr');
  const productCell = document.createElement('td');
  const productIdentity = document.createElement('div');
  productIdentity.className = 'product-cell';
  const thumb = createTextElement('span', `product-thumb ${['', 'tone-sand', 'tone-green', 'tone-lilac'][index % 4]}`, product.name.slice(0, 2).toLocaleUpperCase('fr'));
  thumb.setAttribute('aria-hidden', 'true');
  const firstImage = getProductImages(product)[0];
  if (firstImage) {
    const image = document.createElement('img');
    image.src = firstImage;
    image.alt = '';
    thumb.classList.add('has-image');
    thumb.replaceChildren(image);
  }
  const identityText = document.createElement('span');
  identityText.append(document.createTextNode(product.name));
  if (product.description) identityText.append(createTextElement('small', 'product-description', product.description));
  if (product.demo) identityText.append(createTextElement('small', '', 'Exemple de démonstration'));
  productIdentity.append(thumb, identityText);
  productCell.append(productIdentity);

  const categoryCell = createTextElement('td', '', categoryName(product.category));
  const priceCell = createTextElement('td', `price-cell${product.price === null ? ' price-pending' : ''}`, product.price === null ? 'À confirmer' : `${new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 2 }).format(product.price)} DH`);
  const typeCell = document.createElement('td');
  typeCell.append(createTextElement('span', 'demo-badge', product.demo ? 'DÉMO' : 'LOCAL'));
  const actionsCell = document.createElement('td');
  const actions = document.createElement('div');
  actions.className = 'row-actions';
  const editButton = createTextElement('button', 'row-button', 'Modifier');
  editButton.type = 'button';
  editButton.addEventListener('click', () => openEditor(product));
  const deleteButton = createTextElement('button', 'row-button delete', 'Supprimer');
  deleteButton.type = 'button';
  deleteButton.addEventListener('click', () => deleteProduct(product.id));
  actions.append(editButton, deleteButton);
  actionsCell.append(actions);

  row.append(productCell, categoryCell, priceCell, typeCell, actionsCell);
  return row;
}

function renderProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase('fr');
  const selectedCategory = categoryFilter.value;
  const filtered = products.filter((product) => {
    const searchableText = `${product.name} ${product.description ?? ''}`.toLocaleLowerCase('fr');
    const matchesQuery = searchableText.includes(query);
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  rows.replaceChildren(...filtered.map(makeProductRow));
  emptyState.hidden = filtered.length > 0;
  document.querySelector('#visible-count').textContent = String(filtered.length);
  document.querySelector('#total-products').textContent = String(products.length);
  document.querySelector('#nav-product-count').textContent = String(products.length);
  document.querySelector('#total-categories').textContent = String(new Set(products.filter((product) => categories.some((category) => category.id === product.category)).map((product) => product.category)).size);
  document.querySelector('#priced-products').textContent = String(products.filter((product) => product.price !== null).length);
}

function populateCategories() {
  for (const category of categories) {
    const filterOption = new Option(category.label, category.id);
    categoryFilter.add(filterOption);
    document.querySelector('#product-category').add(new Option(category.label, category.id));
  }
}

function openEditor(product = null) {
  form.reset();
  selectedImageFiles = [];
  existingImages = getProductImages(product);
  imageInput.setCustomValidity('');
  document.querySelector('#product-id').value = product?.id ?? '';
  document.querySelector('#product-name').value = product?.name ?? '';
  document.querySelector('#product-description').value = product?.description ?? '';
  document.querySelector('#product-category').value = categories.some((category) => category.id === product?.category) ? product.category : categories[0].id;
  document.querySelector('#product-price').value = product?.price ?? '';
  renderImagePreview();
  document.querySelector('#dialog-title').textContent = product ? 'Modifier le produit' : 'Ajouter un produit';
  dialog.showModal();
  document.querySelector('#product-name').focus();
}

function renderImagePreview() {
  previewObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  previewObjectUrls = [];
  imagePreviewGrid.replaceChildren();
  const previewItems = [
    ...existingImages.map((source, index) => ({ source, label: `Image actuelle ${index + 1}`, existing: true, index })),
    ...selectedImageFiles.map((file, index) => {
      const source = URL.createObjectURL(file);
      previewObjectUrls.push(source);
      return { source, label: file.name, existing: false, index };
    }),
  ];

  imagePreview.hidden = previewItems.length === 0;
  previewItems.forEach((item) => {
    const previewItem = document.createElement('div');
    previewItem.className = 'image-preview-item';
    const image = document.createElement('img');
    image.src = item.source;
    image.alt = '';
    const name = createTextElement('span', '', item.label);
    const removeButton = createTextElement('button', 'row-button delete', 'Retirer');
    removeButton.type = 'button';
    removeButton.setAttribute('aria-label', `Retirer ${item.label}`);
    removeButton.addEventListener('click', () => {
      if (item.existing) existingImages.splice(item.index, 1);
      else selectedImageFiles.splice(item.index, 1);
      renderImagePreview();
    });
    previewItem.append(image, name, removeButton);
    imagePreviewGrid.append(previewItem);
  });
}

async function compressImage(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Choisissez une image JPEG, PNG ou WebP.');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('L’image doit peser moins de 5 Mo.');
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 800 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    throw new Error('Impossible de traiter cette image.');
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const image = canvas.toDataURL('image/webp', 0.78);
  if (image.length > 450_000) throw new Error('Image trop volumineuse après compression.');
  return image;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

function deleteProduct(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product || !window.confirm(`Supprimer « ${product.name} » de ce catalogue local ?`)) return;
  products = products.filter((item) => item.id !== productId);
  if (saveProducts()) {
    renderProducts();
    showToast('Produit supprimé du catalogue local.');
  }
}

document.querySelector('#add-product').addEventListener('click', () => openEditor());
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
document.querySelector('#cancel-dialog').addEventListener('click', () => dialog.close());
searchInput.addEventListener('input', renderProducts);
categoryFilter.addEventListener('change', renderProducts);

imageInput.addEventListener('change', () => {
  const files = [...imageInput.files];
  imageInput.setCustomValidity('');
  if (files.length === 0) return;
  if (existingImages.length + selectedImageFiles.length + files.length > 4) {
    showToast('Vous pouvez ajouter jusqu’à 4 images par produit.');
    imageInput.value = '';
    return;
  }
  const invalidType = files.find((file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type));
  if (invalidType) {
    imageInput.setCustomValidity('Choisissez une image JPEG, PNG ou WebP.');
    imageInput.reportValidity();
    imageInput.value = '';
    return;
  }
  if (files.some((file) => file.size > 5 * 1024 * 1024)) {
    imageInput.setCustomValidity('L’image doit peser moins de 5 Mo.');
    imageInput.reportValidity();
    imageInput.value = '';
    return;
  }
  selectedImageFiles.push(...files);
  imageInput.value = '';
  renderImagePreview();
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const productId = document.querySelector('#product-id').value;
  const rawPrice = document.querySelector('#product-price').value.trim();
  const saveButton = form.querySelector('[type="submit"]');

  if (rawPrice !== '' && (!Number.isFinite(Number(rawPrice)) || Number(rawPrice) < 0)) {
    document.querySelector('#product-price').setCustomValidity('Saisissez un prix valide ou laissez ce champ vide.');
    document.querySelector('#product-price').reportValidity();
    document.querySelector('#product-price').setCustomValidity('');
    return;
  }

  saveButton.disabled = true;
  try {
    const existingIndex = products.findIndex((item) => item.id === productId);
    const existingProduct = existingIndex >= 0 ? products[existingIndex] : null;
    const uploadedImages = await Promise.all(selectedImageFiles.map(compressImage));
    const images = [...existingImages, ...uploadedImages];
    const product = {
      id: productId || `local-${crypto.randomUUID()}`,
      name: document.querySelector('#product-name').value.trim(),
      description: document.querySelector('#product-description').value.trim(),
      category: document.querySelector('#product-category').value,
      price: rawPrice === '' ? null : Number(rawPrice),
      image: images[0] ?? null,
      images,
      demo: existingProduct?.demo ?? false,
    };

    if (existingIndex >= 0) products[existingIndex] = product;
    else products.unshift(product);

    if (saveProducts()) {
      dialog.close();
      renderProducts();
      showToast(existingIndex >= 0 ? 'Modifications enregistrées sur cet appareil.' : 'Produit ajouté au catalogue local.');
    }
  } catch (error) {
    showToast(error instanceof Error ? error.message : 'Impossible de traiter cette image.');
  } finally {
    saveButton.disabled = false;
  }
});

populateCategories();
renderProducts();