const products = {
  'local-88e2f73f-aa96-4bef-b58b-05ac8b1a1a6d': {
    nameFr: 'RJ45',
    nameAr: 'RJ45',
    categoryFr: 'Informatique',
    categoryAr: 'المعلوميات',
    descriptionFr: 'Connecteur RJ45. Description à compléter.',
    descriptionAr: 'موصل RJ45. الوصف قيد الإضافة.',
    price: 180,
    image: null,
  },
  'demo-camera': {
    nameFr: 'Caméra de sécurité',
    nameAr: 'كاميرا مراقبة',
    categoryFr: 'Électronique & vidéosurveillance',
    categoryAr: 'الإلكترونيات والمراقبة',
    descriptionFr: 'Caméra de surveillance de démonstration. Les caractéristiques techniques sont à confirmer.',
    descriptionAr: 'كاميرا مراقبة تجريبية. المواصفات التقنية قيد التأكيد.',
    price: 550,
    image: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?auto=format&fit=crop&w=900&q=82',
  },
  'demo-phone': {
    nameFr: 'Téléphone mobile',
    nameAr: 'هاتف محمول',
    categoryFr: 'Téléphones & accessoires',
    categoryAr: 'الهواتف والإكسسوارات',
    descriptionFr: 'Téléphone mobile de démonstration. Le modèle et ses caractéristiques sont à confirmer.',
    descriptionAr: 'هاتف محمول تجريبي. الطراز والمواصفات قيد التأكيد.',
    price: 550,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=82',
  },
  'demo-laptop': {
    nameFr: 'Ordinateur portable',
    nameAr: 'حاسوب محمول',
    categoryFr: 'Informatique',
    categoryAr: 'المعلوميات',
    descriptionFr: 'Ordinateur portable de démonstration. Le modèle et la configuration sont à confirmer.',
    descriptionAr: 'حاسوب محمول تجريبي. الطراز والتكوين قيد التأكيد.',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=82',
  },
};

const storageKey = 'info-essoussi-admin-products-v1';
const params = new URLSearchParams(window.location.search);
const productId = params.get('id');
const defaultProduct = products[productId] ?? null;
let currentLanguage = params.get('lang') === 'ar' ? 'ar' : 'fr';
let savedProduct = null;
const productImage = document.querySelector('#page-product-image');
const galleryThumbnails = document.querySelector('#product-gallery-thumbnails');
let currentProductImages = [];

try {
  const storedProducts = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
  if (Array.isArray(storedProducts)) savedProduct = storedProducts.find((item) => item?.id === productId) ?? null;
} catch {
  savedProduct = null;
}

const categoryLabels = {
  surveillance: { fr: 'Électronique & vidéosurveillance', ar: 'الإلكترونيات والمراقبة' },
  phones: { fr: 'Téléphones & accessoires', ar: 'الهواتف والإكسسوارات' },
  tools: { fr: 'Outils & équipements', ar: 'الأدوات والمعدات' },
  computing: { fr: 'Informatique', ar: 'المعلوميات' },
};

function productFromSavedRecord(record) {
  const category = record.categoryLabel
    ? { fr: record.categoryLabel, ar: record.categoryLabelAr || record.categoryLabel }
    : categoryLabels[record.category] ?? { fr: record.category, ar: record.category };
  return {
    nameFr: record.name,
    nameAr: record.nameAr || record.name,
    categoryFr: category.fr,
    categoryAr: category.ar,
    descriptionFr: record.description || 'Description non renseignée.',
    descriptionAr: record.descriptionAr || record.description || 'الوصف غير متوفر.',
    price: record.price ?? null,
    image: (Array.isArray(record.images) ? record.images[0] : null) || record.image || null,
  };
}

let product = defaultProduct ?? (savedProduct ? productFromSavedRecord(savedProduct) : null);

function formatPrice(price) {
  if (price === null || price === undefined || !Number.isFinite(Number(price))) {
    return currentLanguage === 'ar' ? 'السعر قيد التأكيد' : 'Prix à confirmer';
  }
  const locale = currentLanguage === 'ar' ? 'ar-MA' : 'fr-MA';
  const formatted = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(price);
  return currentLanguage === 'ar' ? `${formatted} درهم` : `${formatted} DH`;
}

function renderProduct() {
  const languageKey = currentLanguage === 'ar' ? 'Ar' : 'Fr';
  const productName = currentLanguage === 'ar' ? savedProduct?.nameAr || product.nameAr : savedProduct?.name || product.nameFr;
  const savedDescription = typeof savedProduct?.description === 'string' ? savedProduct.description.trim() : '';
  const rawPrice = savedProduct?.price;
  const savedPrice = Number(rawPrice);
  const price = rawPrice !== null && rawPrice !== undefined && Number.isFinite(savedPrice) ? savedPrice : product.price;
  const savedImages = Array.isArray(savedProduct?.images) ? savedProduct.images.filter((image) => typeof image === 'string' && image).slice(0, 4) : [];
  currentProductImages = savedImages.length ? savedImages : savedProduct?.image ? [savedProduct.image] : product.image ? [product.image] : [];

  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-fr][data-ar]').forEach((element) => {
    element.textContent = element.dataset[currentLanguage];
  });
  document.querySelector('#product-language-switch').textContent = currentLanguage === 'ar' ? 'Français' : 'العربية';
  document.querySelector('#product-language-switch').lang = currentLanguage === 'ar' ? 'fr' : 'ar';
  if (currentProductImages[0]) productImage.src = currentProductImages[0];
  else productImage.removeAttribute('src');
  productImage.alt = productName;
  productImage.hidden = currentProductImages.length === 0;
  document.querySelector('#product-image-placeholder').hidden = currentProductImages.length > 0;
  renderGalleryThumbnails(productName);
  document.querySelector('#page-product-category').textContent = product[`category${languageKey}`];
  document.querySelector('#page-product-name').textContent = productName;
  document.querySelector('#product-breadcrumb-name').textContent = productName;
  document.querySelector('#page-product-description').textContent = savedDescription || product[`description${languageKey}`];
  document.querySelector('#page-product-price').textContent = formatPrice(price);
  document.querySelector('#checkout-product-name').textContent = productName;
  document.querySelector('#checkout-product-price').textContent = formatPrice(price);
  document.title = `${productName} | Info Essoussi`;
}

function renderGalleryThumbnails(productName) {
  galleryThumbnails.replaceChildren();
  galleryThumbnails.hidden = currentProductImages.length < 2;
  currentProductImages.forEach((source, index) => {
    const button = document.createElement('button');
    button.className = `gallery-thumbnail${index === 0 ? ' is-active' : ''}`;
    button.type = 'button';
    button.setAttribute('aria-label', currentLanguage === 'ar' ? `الصورة ${index + 1} من ${productName}` : `Image ${index + 1} de ${productName}`);
    button.setAttribute('aria-pressed', String(index === 0));
    const thumbnail = document.createElement('img');
    thumbnail.src = source;
    thumbnail.alt = '';
    button.append(thumbnail);
    button.addEventListener('click', () => {
      productImage.src = source;
      galleryThumbnails.querySelectorAll('.gallery-thumbnail').forEach((item, itemIndex) => {
        const selected = itemIndex === index;
        item.classList.toggle('is-active', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
    });
    galleryThumbnails.append(button);
  });
}

const productContent = document.querySelector('#product-content');
const productNotFound = document.querySelector('#product-not-found');

if (product) {
  productContent.hidden = false;
  renderProduct();
} else {
  productNotFound.hidden = false;
  document.title = currentLanguage === 'ar' ? 'المنتج غير موجود | Info Essoussi' : 'Produit introuvable | Info Essoussi';
  document.querySelectorAll('[data-fr][data-ar]').forEach((element) => {
    element.textContent = element.dataset[currentLanguage];
  });
}

document.querySelector('#product-language-switch').addEventListener('click', () => {
  currentLanguage = currentLanguage === 'fr' ? 'ar' : 'fr';
  if (product) renderProduct();
  else {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
    document.querySelector('#product-language-switch').textContent = currentLanguage === 'ar' ? 'Français' : 'العربية';
    document.querySelectorAll('[data-fr][data-ar]').forEach((element) => {
      element.textContent = element.dataset[currentLanguage];
    });
  }
});

document.querySelector('#show-order').addEventListener('click', () => {
  const checkout = document.querySelector('#checkout-section');
  checkout.hidden = false;
  checkout.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.querySelector('#order-first-name').focus({ preventScroll: true });
});

document.querySelector('#order-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity() || !product) return;

  const firstName = document.querySelector('#order-first-name').value.trim();
  const lastName = document.querySelector('#order-last-name').value.trim();
  const phone = document.querySelector('#order-phone').value.trim();
  const city = document.querySelector('#order-city').value.trim();
  const productName = document.querySelector('#page-product-name').textContent;
  const price = document.querySelector('#page-product-price').textContent;
  const message = currentLanguage === 'ar'
    ? `طلب شراء جديد\nالمنتج: ${productName}\nالسعر: ${price}\nالاسم: ${firstName} ${lastName}\nالهاتف: ${phone}\nالمدينة: ${city}\nالتوصيل: مجاني\nالدفع: عند الاستلام`
    : `Nouvelle demande de commande\nProduit : ${productName}\nPrix : ${price}\nNom : ${firstName} ${lastName}\nTéléphone : ${phone}\nVille : ${city}\nLivraison : gratuite\nPaiement : à la livraison`;
  const destination = new URL('https://wa.me/212665946134');
  destination.searchParams.set('text', message);
  window.open(destination.toString(), '_blank', 'noopener,noreferrer');
  form.reset();
});

window.addEventListener('storage', (event) => {
  if (product && (event.key === storageKey || event.key === null)) {
    try {
      const storedProducts = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
      savedProduct = Array.isArray(storedProducts) ? storedProducts.find((item) => item?.id === productId) ?? null : null;
    } catch {
      savedProduct = null;
    }
    if (!defaultProduct) {
      product = savedProduct ? productFromSavedRecord(savedProduct) : null;
      productContent.hidden = !product;
      productNotFound.hidden = Boolean(product);
    }
    if (product) renderProduct();
  }
});

document.querySelector('#current-year').textContent = String(new Date().getFullYear());