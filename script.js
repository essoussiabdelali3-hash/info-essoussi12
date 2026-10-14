const searchInput = document.querySelector('#product-search');
const categoryButtons = [...document.querySelectorAll('.category-link')];
let productCards = [...document.querySelectorAll('.product-card')];
const productGrid = document.querySelector('#product-grid');
const emptyState = document.querySelector('#empty-state');
const languageSwitch = document.querySelector('.language-switch');
const productStorageKey = 'info-essoussi-admin-products-v1';
const defaultProductIds = new Set(productCards.map((card) => card.dataset.productId));
const categoryLabels = {
  surveillance: { fr: 'Électronique & vidéosurveillance', ar: 'الإلكترونيات والمراقبة' },
  phones: { fr: 'Téléphones & accessoires', ar: 'الهواتف والإكسسوارات' },
  tools: { fr: 'Outils & équipements', ar: 'الأدوات والمعدات' },
  computing: { fr: 'Informatique', ar: 'المعلوميات' },
};
let selectedCategory = 'all';
let currentLanguage = 'fr';

function formatProductPrice(price) {
  if (price === null || price === undefined || !Number.isFinite(Number(price))) {
    return currentLanguage === 'ar' ? 'السعر قيد التأكيد' : 'Prix à confirmer';
  }
  const locale = currentLanguage === 'ar' ? 'ar-MA' : 'fr-MA';
  const formatted = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(price);
  return currentLanguage === 'ar' ? `${formatted} درهم` : `${formatted} DH`;
}

function createCustomProductCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.dataset.productId = product.id;
  card.dataset.category = product.category;
  const searchableName = product.name.toLocaleLowerCase('fr');
  const description = typeof product.description === 'string' ? product.description : '';
  card.dataset.searchFr = `${searchableName} ${description.toLocaleLowerCase('fr')}`;
  card.dataset.searchAr = `${product.name} ${description}`.toLocaleLowerCase('ar');
  card.dataset.savedDescription = description;

  const imageContainer = document.createElement('div');
  imageContainer.className = 'product-image image-blue';
  const imageLink = document.createElement('a');
  imageLink.className = 'product-image-link';
  imageLink.dataset.productLink = '';
  imageLink.href = `product.html?id=${encodeURIComponent(product.id)}&lang=${currentLanguage}`;
  imageLink.setAttribute('aria-label', currentLanguage === 'ar' ? `عرض تفاصيل ${product.name}` : `Voir les détails de ${product.name}`);
  const images = Array.isArray(product.images) ? product.images : product.image ? [product.image] : [];
  const productImageSource = images.find((image) => typeof image === 'string' && image);
  const productImage = productImageSource;
  if (productImage) {
    const image = document.createElement('img');
    image.src = productImage;
    image.alt = product.name;
    image.loading = 'lazy';
    image.width = 720;
    image.height = 620;
    imageLink.append(image);
  } else {
    const placeholder = document.createElement('span');
    placeholder.className = 'product-image-placeholder';
    placeholder.textContent = product.name.slice(0, 2).toLocaleUpperCase('fr');
    placeholder.setAttribute('aria-hidden', 'true');
    imageLink.append(placeholder);
  }
  imageContainer.append(imageLink);
  if (product.demo) {
    const demoTag = document.createElement('span');
    demoTag.className = 'demo-tag';
    demoTag.textContent = currentLanguage === 'ar' ? 'تجريبي' : 'DÉMO';
    imageContainer.append(demoTag);
  }

  const info = document.createElement('div');
  info.className = 'product-info';
  const category = document.createElement('p');
  category.className = 'product-category';
  category.dataset.fr = product.categoryLabel || categoryLabels[product.category]?.fr || product.category;
  category.dataset.ar = product.categoryLabelAr || categoryLabels[product.category]?.ar || product.categoryLabel || product.category;
  category.textContent = category.dataset[currentLanguage];
  const name = document.createElement('h3');
  name.dataset.fr = product.name;
  name.dataset.ar = product.nameAr || product.name;
  name.textContent = name.dataset[currentLanguage];
  const bottom = document.createElement('div');
  bottom.className = 'product-bottom';
  const price = document.createElement('span');
  price.className = 'product-price';
  price.dataset.fr = product.price === null || product.price === undefined ? 'Prix à confirmer' : formatProductPrice(product.price);
  price.dataset.ar = product.price === null || product.price === undefined ? 'السعر قيد التأكيد' : formatProductPrice(product.price);
  price.textContent = price.dataset[currentLanguage];
  const details = document.createElement('a');
  details.className = 'product-link product-page-link';
  details.dataset.productLink = '';
  details.dataset.labelFr = 'Détails';
  details.dataset.labelAr = 'التفاصيل';
  details.href = imageLink.href;
  details.append(document.createTextNode(currentLanguage === 'ar' ? 'التفاصيل ' : 'Détails '));
  const arrow = document.createElement('span');
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '↗';
  details.append(arrow);
  bottom.append(price, details);
  info.append(category, name, bottom);
  card.append(imageContainer, info);
  return card;
}

function syncProductCatalog() {
  let savedProducts = [];
  try {
    const stored = JSON.parse(localStorage.getItem(productStorageKey) ?? '[]');
    if (Array.isArray(stored)) savedProducts = stored;
  } catch {
    savedProducts = [];
  }

  const savedProductsById = new Map(savedProducts.map((product) => [product.id, product]));
  productCards.forEach((card) => {
    if (!defaultProductIds.has(card.dataset.productId)) return;
    const savedProduct = savedProductsById.get(card.dataset.productId);
    const productImage = card.querySelector('.product-image img');
    if (!productImage.dataset.defaultSource) productImage.dataset.defaultSource = productImage.src;
    if (!productImage.dataset.defaultAlt) productImage.dataset.defaultAlt = productImage.alt;
    const savedImages = Array.isArray(savedProduct?.images) ? savedProduct.images : [];
    productImage.src = savedImages[0] || savedProduct?.image || productImage.dataset.defaultSource;
    productImage.alt = savedProduct?.image ? card.querySelector('h3').textContent : productImage.dataset.defaultAlt;
    card.dataset.savedDescription = typeof savedProduct?.description === 'string' ? savedProduct.description.trim() : '';
    const rawSavedPrice = savedProduct?.price;
    const savedPrice = Number(rawSavedPrice);
    const price = rawSavedPrice !== null && rawSavedPrice !== undefined && Number.isFinite(savedPrice)
      ? savedPrice
      : Number(card.dataset.defaultPrice);
    card.querySelector('.product-price').textContent = formatProductPrice(price);
  });

  productCards.filter((card) => !defaultProductIds.has(card.dataset.productId)).forEach((card) => card.remove());
  savedProducts.filter((product) => product && typeof product.id === 'string' && typeof product.name === 'string' && typeof product.category === 'string' && !defaultProductIds.has(product.id))
    .forEach((product) => productGrid.append(createCustomProductCard(product)));
  productCards = [...productGrid.querySelectorAll('.product-card')];

}

function updateProductLinks() {
  document.querySelectorAll('[data-product-link]').forEach((link) => {
    const card = link.closest('.product-card');
    const productId = card.dataset.productId;
    const params = new URLSearchParams({ id: productId, lang: currentLanguage });
    link.href = `product.html?${params.toString()}`;
    if (link.classList.contains('product-image-link')) {
      const productName = link.closest('.product-card').querySelector('h3').textContent;
      link.setAttribute('aria-label', currentLanguage === 'ar' ? `عرض تفاصيل ${productName}` : `Voir les détails de ${productName}`);
    }
  });
}

function updateProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase(currentLanguage);
  let visibleCount = 0;

  for (const card of productCards) {
    const categoryMatches = selectedCategory === 'all' || card.dataset.category === selectedCategory;
    const searchableText = card.dataset[`search${currentLanguage.toUpperCase()}`] ?? '';
    const searchMatches = searchableText.toLocaleLowerCase(currentLanguage).includes(query);
    const isVisible = categoryMatches && searchMatches;

    card.hidden = !isVisible;
    visibleCount += Number(isVisible);
  }

  emptyState.hidden = visibleCount > 0;
}

function setLanguage(language) {
  currentLanguage = language;
  const languageKey = `${language[0].toUpperCase()}${language.slice(1)}`;
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';

  document.querySelectorAll('[data-fr][data-ar]').forEach((element) => {
    element.textContent = element.dataset[language];
  });

  document.querySelectorAll('[data-label-fr][data-label-ar]').forEach((element) => {
    const label = element.dataset[`label${languageKey}`];
    const icon = element.querySelector('span');
    element.textContent = `${label} `;
    if (icon) element.append(icon);
  });

  searchInput.placeholder = searchInput.dataset[`placeholder${languageKey}`];
  searchInput.setAttribute('aria-label', searchInput.placeholder);
  languageSwitch.textContent = language === 'ar' ? 'Français' : 'العربية';
  languageSwitch.lang = language === 'ar' ? 'fr' : 'ar';
  document.title = language === 'ar' ? 'إنفو السوسي | متجر إلكتروني في المغرب' : 'Info Essoussi | Boutique en ligne au Maroc';
  syncProductCatalog();
  updateProductLinks();
  updateProducts();
}

searchInput.addEventListener('input', updateProducts);
categoryButtons.forEach((button) => {
  button.addEventListener('click', () => {
    selectedCategory = button.dataset.category;
    categoryButtons.forEach((item) => {
      const isSelected = item === button;
      item.classList.toggle('is-active', isSelected);
      item.setAttribute('aria-pressed', String(isSelected));
    });
    updateProducts();
  });
});

languageSwitch.addEventListener('click', () => {
  setLanguage(currentLanguage === 'fr' ? 'ar' : 'fr');
});

window.addEventListener('storage', (event) => {
  if (event.key === productStorageKey || event.key === null) {
    syncProductCatalog();
    updateProductLinks();
    updateProducts();
  }
});

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    searchInput.focus();
  }
});

document.querySelector('#current-year').textContent = String(new Date().getFullYear());
categoryButtons[0].setAttribute('aria-pressed', 'true');
syncProductCatalog();
updateProductLinks();
updateProducts();
