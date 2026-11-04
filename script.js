(() => {
  'use strict';
  const config = window.PET_FOFURA_CONFIG || {};
  const phone = String(config.whatsapp || '5545988249009').replace(/\D/g, '');
  const whatsappURL = (msg) => `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

  document.querySelectorAll('[data-wa]').forEach((a) => {
    a.href = whatsappURL(a.dataset.wa || 'Olá, Pet Fofura!');
  });
  document.querySelector('#year').textContent = String(new Date().getFullYear());

  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  const closeMenu = () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    document.body.classList.remove('menu-open');
  };
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('menu-open', open);
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 960) closeMenu(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -25px 0px', threshold: .09 });
    document.querySelectorAll('.reveal').forEach((item) => revealObserver.observe(item));

    const sections = document.querySelectorAll('main section[id]');
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        nav.querySelectorAll('a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
      });
    }, {rootMargin:'-25% 0px -60% 0px', threshold:0});
    sections.forEach(section => sectionObserver.observe(section));
  } else {
    document.querySelectorAll('.reveal').forEach(item => item.classList.add('visible'));
  }

  const backTop = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => backTop.classList.toggle('shown', window.scrollY > 750), {passive:true});
  backTop.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));

  // Galeria: carrossel por cartão, com setas, indicadores e gesto de deslizar.
  const gallery = document.getElementById('gallery-grid');
  const galleryItems = Array.from(gallery.querySelectorAll('.gallery-item'));
  const galleryCounter = document.getElementById('gallery-counter');
  const galleryDots = document.getElementById('gallery-dots');
  const galleryProgress = document.getElementById('gallery-progress-fill');
  const galleryPrev = document.getElementById('gallery-prev');
  const galleryNext = document.getElementById('gallery-next');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let pagePositions = [0];
  let galleryPage = 0;
  let scrollTicking = false;
  const galleryMaxScroll = () => Math.max(0, gallery.scrollWidth - gallery.clientWidth);
  const cardOffset = (item) => item.getBoundingClientRect().left - gallery.getBoundingClientRect().left + gallery.scrollLeft;
  const formatIndex = (i, n) => `${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;

  function makeGalleryPages() {
    const max = galleryMaxScroll();
    const step = galleryItems.length > 1 ? cardOffset(galleryItems[1]) - cardOffset(galleryItems[0]) : gallery.clientWidth;
    const positions = [0];
    if (max > 2 && step > 10) {
      for (let i = 1; i < galleryItems.length; i++) {
        const next = Math.min(max, Math.max(0, cardOffset(galleryItems[i])));
        if (next > positions[positions.length - 1] + 8) positions.push(next);
        if (next >= max - 2) break;
      }
    }
    pagePositions = positions;
    galleryDots.replaceChildren();
    pagePositions.forEach((pos, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'gallery-dot';
      dot.setAttribute('aria-label', `Ir à posição ${i + 1} de ${pagePositions.length} da galeria`);
      dot.addEventListener('click', () => goToGalleryPage(i));
      galleryDots.appendChild(dot);
    });
    syncGalleryControls();
  }
  function syncGalleryControls() {
    const max = galleryMaxScroll();
    const currentScroll = Math.max(0, Math.min(max, gallery.scrollLeft));
    galleryPage = pagePositions.reduce((best, pos, i) =>
      Math.abs(pos - currentScroll) < Math.abs(pagePositions[best] - currentScroll) ? i : best, 0);
    const firstVisible = galleryItems.reduce((best, item, i) =>
      Math.abs(cardOffset(item) - currentScroll) < Math.abs(cardOffset(galleryItems[best]) - currentScroll) ? i : best, 0);
    galleryCounter.textContent = formatIndex(firstVisible, galleryItems.length);
    galleryProgress.style.width = `${max > 0 ? 16 + (currentScroll / max) * 84 : 100}%`;
    Array.from(galleryDots.children).forEach((dot, i) => {
      const isActive = i === galleryPage;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }
  function goToGalleryPage(index) {
    const size = pagePositions.length;
    if (!size) return;
    galleryPage = ((index % size) + size) % size;
    gallery.scrollTo({ left: pagePositions[galleryPage], behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    syncGalleryControls();
    // The scroll event updates the counter again once the animation completes.
  }
  galleryPrev.addEventListener('click', () => goToGalleryPage(galleryPage - 1));
  galleryNext.addEventListener('click', () => goToGalleryPage(galleryPage + 1));
  gallery.addEventListener('scroll', () => {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(() => { syncGalleryControls(); scrollTicking = false; });
    }
  }, { passive: true });
  gallery.addEventListener('keydown', (event) => {
    if (event.target !== gallery) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); goToGalleryPage(galleryPage + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); goToGalleryPage(galleryPage - 1); }
  });
  const galleryResizeObserver = 'ResizeObserver' in window ? new ResizeObserver(() => {
    const oldPosition = pagePositions[galleryPage] || 0;
    makeGalleryPages();
    gallery.scrollLeft = Math.min(galleryMaxScroll(), oldPosition);
    syncGalleryControls();
  }) : null;
  if (galleryResizeObserver) galleryResizeObserver.observe(gallery);
  else window.addEventListener('resize', makeGalleryPages, { passive: true });
  window.addEventListener('load', makeGalleryPages, { once: true });
  makeGalleryPages();

  // Slideshow suave, com controle explícito de pausa e respeitando redução de movimento.
  const galleryAuto = document.getElementById('gallery-autoplay');
  const galleryAutoSymbol = document.getElementById('gallery-auto-symbol');
  const galleryAutoText = document.getElementById('gallery-auto-text');
  let autoplayEnabled = !reducedMotion.matches && window.innerWidth > 700;
  let autoplayTimer = null;
  let galleryVisible = false;
  let galleryHovered = false;
  let galleryFocused = false;
  const updateAutoplayButton = () => {
    galleryAuto.setAttribute('aria-pressed', String(autoplayEnabled));
    galleryAuto.setAttribute('aria-label', autoplayEnabled ? 'Pausar apresentação automática' : 'Iniciar apresentação automática');
    galleryAutoSymbol.textContent = autoplayEnabled ? 'Ⅱ' : '▶';
    galleryAutoText.textContent = autoplayEnabled ? 'Pausar' : 'Reproduzir';
  };
  const autoplayCanRun = () => autoplayEnabled && galleryVisible && !galleryHovered && !galleryFocused && !document.hidden && !dialogIsOpen();
  const dialogIsOpen = () => document.getElementById('lightbox')?.open || false;
  function syncAutoplay() {
    if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
    if (autoplayCanRun()) {
      autoplayTimer = setInterval(() => {
        if (autoplayCanRun()) goToGalleryPage(galleryPage + 1);
      }, 5800);
    }
  }
  galleryAuto.addEventListener('click', () => {
    autoplayEnabled = !autoplayEnabled;
    updateAutoplayButton();
    syncAutoplay();
  });
  gallery.addEventListener('pointerenter', () => { galleryHovered = true; syncAutoplay(); });
  gallery.addEventListener('pointerleave', () => { galleryHovered = false; syncAutoplay(); });
  gallery.addEventListener('focusin', () => { galleryFocused = true; syncAutoplay(); });
  gallery.addEventListener('focusout', () => { galleryFocused = false; syncAutoplay(); });
  galleryPrev.addEventListener('click', () => { autoplayEnabled = false; updateAutoplayButton(); syncAutoplay(); });
  galleryNext.addEventListener('click', () => { autoplayEnabled = false; updateAutoplayButton(); syncAutoplay(); });
  galleryDots.addEventListener('click', () => { autoplayEnabled = false; updateAutoplayButton(); syncAutoplay(); });
  gallery.addEventListener('pointerdown', () => { if (autoplayEnabled) { autoplayEnabled = false; updateAutoplayButton(); syncAutoplay(); } }, { passive: true });
  document.addEventListener('visibilitychange', syncAutoplay);
  if ('IntersectionObserver' in window) {
    const galleryObserver = new IntersectionObserver((entries) => {
      galleryVisible = entries[0]?.isIntersecting || false;
      syncAutoplay();
    }, { threshold: 0.4 });
    galleryObserver.observe(gallery);
  } else { galleryVisible = true; }
  reducedMotion.addEventListener?.('change', () => {
    if (reducedMotion.matches) autoplayEnabled = false;
    updateAutoplayButton(); syncAutoplay();
  });
  updateAutoplayButton(); syncAutoplay();

  // Lightbox com miniaturas, setas, teclado, Escape e gestos no celular.
  const dialog = document.getElementById('lightbox');
  const dialogImg = document.getElementById('lightbox-image');
  const dialogCaption = document.getElementById('lightbox-caption');
  const dialogCounter = document.getElementById('lightbox-counter');
  const thumbTray = document.getElementById('lightbox-thumbnails');
  const thumbs = [];
  let imageIndex = 0;
  let lastGalleryFocus = null;
  galleryItems.forEach((item, i) => {
    const thumb = document.createElement('button');
    thumb.type = 'button';
    thumb.className = 'lightbox-thumb';
    thumb.setAttribute('aria-label', `Visualizar foto ${i + 1}: ${item.dataset.title}`);
    const pic = item.querySelector('img');
    const img = document.createElement('img');
    img.src = pic.getAttribute('src');
    img.alt = '';
    img.loading = 'lazy';
    thumb.appendChild(img);
    thumb.addEventListener('click', () => showImage(i));
    thumbs.push(thumb);
    thumbTray.appendChild(thumb);
  });
  function showImage(n) {
    imageIndex = ((n % galleryItems.length) + galleryItems.length) % galleryItems.length;
    const item = galleryItems[imageIndex];
    dialogImg.classList.remove('image-is-ready');
    dialogImg.src = item.dataset.full;
    dialogImg.alt = item.querySelector('img').alt;
    dialogCaption.textContent = item.dataset.title;
    dialogCounter.textContent = formatIndex(imageIndex, galleryItems.length);
    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === imageIndex);
      thumb.setAttribute('aria-current', i === imageIndex ? 'true' : 'false');
    });
    thumbs[imageIndex].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    if (dialogImg.complete) dialogImg.classList.add('image-is-ready');
  }
  dialogImg.addEventListener('load', () => dialogImg.classList.add('image-is-ready'));
  function openLightbox(i) {
    lastGalleryFocus = document.activeElement;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    document.body.classList.add('lightbox-open');
    syncAutoplay();
    showImage(i);
  }
  galleryItems.forEach((item, i) => item.addEventListener('click', () => openLightbox(i)));
  function closeLightbox() {
    if (!dialog.open) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    document.body.classList.remove('lightbox-open');
    lastGalleryFocus?.focus({ preventScroll: true });
    syncAutoplay();
  }
  dialog.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  dialog.addEventListener('click', (event) => { if (event.target === dialog) closeLightbox(); });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('lightbox-open');
    lastGalleryFocus?.focus({ preventScroll: true });
    syncAutoplay();
  });
  document.getElementById('lightbox-prev').addEventListener('click', () => showImage(imageIndex - 1));
  document.getElementById('lightbox-next').addEventListener('click', () => showImage(imageIndex + 1));
  document.addEventListener('keydown', (event) => {
    if (!dialog.open) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); showImage(imageIndex - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showImage(imageIndex + 1); }
  });
  let gestureStart = null;
  dialog.querySelector('.lightbox-visual').addEventListener('touchstart', (event) => {
    gestureStart = event.touches.length === 1 ? event.touches[0].clientX : null;
  }, { passive: true });
  dialog.querySelector('.lightbox-visual').addEventListener('touchend', (event) => {
    if (gestureStart === null) return;
    const dx = event.changedTouches[0].clientX - gestureStart;
    if (Math.abs(dx) > 45) showImage(imageIndex + (dx < 0 ? 1 : -1));
    gestureStart = null;
  }, { passive: true });

  const form = document.getElementById('whatsapp-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const nome = form.elements.nome.value.trim();
    const telefone = form.elements.telefone.value.trim();
    const servico = form.elements.servico.value.trim();
    const mensagem = form.elements.mensagem.value.trim();
    if (!nome || !servico || telefone.replace(/\D/g, '').length < 10) {
      window.alert('Por favor, informe seu nome, um WhatsApp válido e o serviço desejado.'); return;
    }
    const texto = `Olá, Pet Fofura! Vim pelo site e gostaria de falar com vocês.\n\n*Nome:* ${nome}\n*Meu WhatsApp:* ${telefone}\n*Interesse:* ${servico}${mensagem ? `\n*Mensagem:* ${mensagem}` : ''}`;
    const url = whatsappURL(texto);
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (!newWindow) window.location.href = url;
  });
})();
