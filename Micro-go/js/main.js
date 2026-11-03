/**
 * ==============================================================================
 * MICROLASER EQUIPAMENTOS HOSPITALARES — GOIÂNIA (GO)
 * Plataforma Corporativa B2B & Engenharia Clínica
 * Arquitetura Modular Moderna (ES6+)
 * ==============================================================================
 */

(() => {
  'use strict';

  // Configurações e constantes
  const CONFIG = {
    PHONE_WHATSAPP: '5562981030357',
    DEFAULT_EXPAND_LIMIT: 6,
    CATEGORY_LABELS: {
      raiox: 'Máquinas de Raio-X & Konica Minolta',
      manutencao: 'Serviços & Manutenção Radiológica',
      filmes: 'Filmes Drypro & Químicos',
      protecao: 'Proteção Radiológica & Sala'
    },
    STORAGE_KEYS: {
      CART: 'microlaser_quote_cart',
      LEADS: 'microlaser_leads'
    }
  };

  // Estado da Aplicação
  const state = {
    currentCategory: 'all',
    currentBrand: 'all',
    searchQuery: '',
    currentViewMode: 'grid', // 'grid' | 'table'
    isCatalogExpanded: false,
    selectedEquipment: '',
    selectedModel: '',
    currentTechSpecId: null,
    quoteCart: []
  };

  // Inicialização do carrinho a partir do LocalStorage
  try {
    state.quoteCart = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.CART) || '[]');
  } catch (err) {
    state.quoteCart = [];
  }

  // ==========================================
  // 1. TEMA & AMBIENTAÇÃO
  // ==========================================
  function initTheme() {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }

  // ==========================================
  // 2. BUSCA E FILTRAGEM DO CATÁLOGO
  // ==========================================
  function focusCatalogSearch() {
    const input = document.getElementById('catalogSearchInput');
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function clearCatalogSearch() {
    const searchInput = document.getElementById('catalogSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    if (searchInput) searchInput.value = '';
    state.searchQuery = '';
    if (clearSearchBtn) clearSearchBtn.classList.add('hidden');
    applyCatalogFilters();
  }

  function toggleCatalogExpansion() {
    state.isCatalogExpanded = !state.isCatalogExpanded;
    applyCatalogFilters();
    if (!state.isCatalogExpanded) {
      const catSection = document.getElementById('catalogo');
      if (catSection) catSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function resetCatalogFilters() {
    const searchInput = document.getElementById('catalogSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    if (searchInput) searchInput.value = '';
    if (clearSearchBtn) clearSearchBtn.classList.add('hidden');
    state.searchQuery = '';
    state.currentCategory = 'all';
    state.currentBrand = 'all';
    state.isCatalogExpanded = false;

    const filterButtons = document.querySelectorAll('#catalogFilterTabs .cat-btn');
    filterButtons.forEach((b, idx) => {
      if (idx === 0) {
        b.classList.add('active-tab', 'bg-primary', 'text-on-primary');
        b.classList.remove('bg-surface-container-lowest', 'text-on-surface-variant', 'border', 'border-outline-variant/30');
      } else {
        b.classList.remove('active-tab', 'bg-primary', 'text-on-primary');
        b.classList.add('bg-surface-container-lowest', 'text-on-surface-variant', 'border', 'border-outline-variant/30');
      }
    });

    filterByBrand('all');
    applyCatalogFilters();
  }

  function filterByBrand(brand) {
    state.currentBrand = brand;
    const brandButtons = document.querySelectorAll('.brand-btn, .brand-pill');
    brandButtons.forEach(b => {
      const onclickAttr = b.getAttribute('onclick') || '';
      const dataBrand = b.getAttribute('data-brand') || '';
      const isTarget = onclickAttr.includes(`'${brand}'`) || dataBrand === brand;

      if (isTarget) {
        b.classList.add('active', 'bg-primary', 'text-on-primary', 'font-bold');
        b.classList.remove('text-on-surface-variant', 'bg-surface-container-lowest', 'border', 'border-outline-variant/40');
      } else {
        b.classList.remove('active', 'bg-primary', 'text-on-primary', 'font-bold');
        b.classList.add('text-on-surface-variant', 'bg-surface-container-lowest', 'border', 'border-outline-variant/40');
      }
    });
    applyCatalogFilters();
  }

  function applyCatalogFilters() {
    const productItems = document.querySelectorAll('#productGridContainer .product-item');
    const noResultsAlert = document.getElementById('noResultsAlert');
    const catalogCount = document.getElementById('catalogCount');

    let matchedItems = [];

    productItems.forEach(item => {
      const itemCategory = item.getAttribute('data-category') || '';
      const itemKeywords = (
        (item.getAttribute('data-keywords') || '') + ' ' +
        (item.getAttribute('data-name') || '') + ' ' +
        (item.getAttribute('data-model') || '') + ' ' +
        item.textContent
      ).toLowerCase();

      const matchCategory = (state.currentCategory === 'all' || itemCategory === state.currentCategory);
      const matchBrand = (state.currentBrand === 'all' || itemKeywords.includes(state.currentBrand));
      const matchSearch = (!state.searchQuery || itemKeywords.includes(state.searchQuery));

      if (matchCategory && matchBrand && matchSearch) {
        matchedItems.push(item);
      } else {
        item.classList.add('hidden');
        item.classList.remove('flex');
      }
    });

    const totalMatched = matchedItems.length;
    const shouldLimit = !state.searchQuery && !state.isCatalogExpanded && totalMatched > CONFIG.DEFAULT_EXPAND_LIMIT;

    matchedItems.forEach((item, index) => {
      if (shouldLimit && index >= CONFIG.DEFAULT_EXPAND_LIMIT) {
        item.classList.add('hidden');
        item.classList.remove('flex');
      } else {
        item.classList.remove('hidden');
        item.classList.add('flex');
      }
    });

    // Controle do botão de expansão
    const expandContainer = document.getElementById('catalogExpandContainer');
    const expandText = document.getElementById('expandText');
    const expandBadge = document.getElementById('expandBadge');
    const expandIcon = document.getElementById('expandIcon');

    if (expandContainer) {
      if (totalMatched > CONFIG.DEFAULT_EXPAND_LIMIT && !state.searchQuery) {
        expandContainer.classList.remove('hidden');
        if (state.isCatalogExpanded) {
          if (expandText) expandText.innerText = 'Mostrar menos equipamentos';
          if (expandBadge) expandBadge.innerText = `Exibindo todos os ${totalMatched}`;
          if (expandIcon) expandIcon.innerText = 'expand_less';
        } else {
          const hiddenCount = totalMatched - CONFIG.DEFAULT_EXPAND_LIMIT;
          if (expandText) expandText.innerText = 'Ver mais equipamentos desta categoria';
          if (expandBadge) expandBadge.innerText = `+${hiddenCount} itens`;
          if (expandIcon) expandIcon.innerText = 'expand_more';
        }
      } else {
        expandContainer.classList.add('hidden');
      }
    }

    if (catalogCount) catalogCount.innerText = totalMatched;

    if (noResultsAlert) {
      if (totalMatched === 0) noResultsAlert.classList.remove('hidden');
      else noResultsAlert.classList.add('hidden');
    }

    if (state.currentViewMode === 'table') {
      buildTableView();
    }
  }

  // ==========================================
  // 3. GRADE VS TABELA TÉCNICA
  // ==========================================
  function switchViewMode(mode) {
    state.currentViewMode = mode;
    const gridBtn = document.getElementById('btnViewGrid') || document.getElementById('viewGridBtn');
    const tableBtn = document.getElementById('btnViewTable') || document.getElementById('viewTableBtn');
    const gridContainer = document.getElementById('productGridContainer');
    const tableViewContainer = document.getElementById('productTableView');

    if (mode === 'table') {
      if (gridBtn) {
        gridBtn.classList.remove('bg-primary', 'text-on-primary', 'font-bold');
        gridBtn.classList.add('text-on-surface-variant', 'hover:text-on-surface');
      }
      if (tableBtn) {
        tableBtn.classList.add('bg-primary', 'text-on-primary', 'font-bold');
        tableBtn.classList.remove('text-on-surface-variant', 'hover:text-on-surface');
      }
      if (gridContainer) gridContainer.classList.add('hidden');
      if (tableViewContainer) {
        tableViewContainer.classList.remove('hidden');
        buildTableView();
      }
    } else {
      if (gridBtn) {
        gridBtn.classList.add('bg-primary', 'text-on-primary', 'font-bold');
        gridBtn.classList.remove('text-on-surface-variant', 'hover:text-on-surface');
      }
      if (tableBtn) {
        tableBtn.classList.remove('bg-primary', 'text-on-primary', 'font-bold');
        tableBtn.classList.add('text-on-surface-variant', 'hover:text-on-surface');
      }
      if (gridContainer) gridContainer.classList.remove('hidden');
      if (tableViewContainer) tableViewContainer.classList.add('hidden');
    }
  }

  function buildTableView() {
    const tableBody = document.getElementById('productTableBody');
    const productItems = document.querySelectorAll('#productGridContainer .product-item');
    if (!tableBody) return;

    const visibleItems = Array.from(productItems).filter(item => !item.classList.contains('hidden'));

    if (visibleItems.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="p-8 text-center text-on-surface-variant font-technical-mono text-xs">
            Nenhum equipamento localizado com os critérios informados.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = visibleItems.map(item => {
      const id = item.getAttribute('data-id') || '';
      const name = item.getAttribute('data-name') || '';
      const model = item.getAttribute('data-model') || '';
      const cat = item.getAttribute('data-category') || '';
      const img = item.getAttribute('data-img') || './img/catalogo/equipamentos/aeroDr.jpg';

      const specList = item.querySelectorAll('.space-y-1\\.5 > div, .product-specs span, ul li');
      let specsSummary = [];
      specList.forEach((s, idx) => {
        if (idx < 2 && s.textContent.trim()) {
          specsSummary.push(s.textContent.replace(/\s+/g, ' ').trim());
        }
      });
      const specsText = specsSummary.length > 0 ? specsSummary.join(' | ') : 'Padrão Hospitalar Homologado';

      return `
        <tr class="transition-colors border-b border-outline-variant/30 hover:bg-surface-container-low/50">
          <td class="p-3">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container/60 text-on-secondary-container text-[10px] font-technical-mono uppercase font-bold">
              <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Disponível
            </span>
          </td>
          <td class="p-3">
            <div class="flex items-center gap-3">
              <img src="${img}" alt="${name}" class="w-10 h-10 object-contain rounded-lg bg-surface-container-low p-1 border border-outline-variant/30 shrink-0" loading="lazy">
              <div class="min-w-0">
                <span class="font-bold text-xs text-on-surface block truncate">${name}</span>
                <span class="text-[10px] text-on-surface-variant font-technical-mono block">Cód: ${id}</span>
              </div>
            </div>
          </td>
          <td class="p-3">
            <span class="px-2.5 py-0.5 rounded bg-surface-container text-[11px] text-on-surface-variant font-technical-mono whitespace-nowrap">
              ${CONFIG.CATEGORY_LABELS[cat] || cat}
            </span>
          </td>
          <td class="p-3 font-technical-mono text-xs text-primary font-bold">
            ${model}
          </td>
          <td class="p-3 font-technical-mono text-[11px] text-on-surface-variant max-w-md">
            ${specsText}
          </td>
          <td class="p-3 pr-6 text-right whitespace-nowrap">
            <div class="inline-flex items-center justify-end gap-2 shrink-0">
              <button onclick="window.Microlaser.openTechSpecModal('${id}')" class="btn-lp p-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline-variant/40 text-xs transition-colors shrink-0 flex items-center justify-center min-h-[34px] min-w-[34px] active:scale-[0.98]" title="Ficha Técnica">
                <span class="material-symbols-outlined text-[16px]">description</span>
              </button>
              <button onclick="window.Microlaser.addToQuoteCart('${id}')" class="btn-lp p-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary border border-outline-variant/40 text-xs transition-colors shrink-0 flex items-center justify-center min-h-[34px] min-w-[34px] active:scale-[0.98]" title="Adicionar à Lista de Orçamento">
                <span class="material-symbols-outlined text-[16px]">add_shopping_cart</span>
              </button>
              <button onclick="window.Microlaser.openQuickQuoteModal('${name.replace(/'/g, "\\'")}', '${model.replace(/'/g, "\\'")}')" class="btn-lp px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors whitespace-nowrap shrink-0 flex items-center justify-center min-h-[34px] active:scale-[0.98]" title="Cotar no WhatsApp">
                Orçamento
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ==========================================
  // 4. MODAL DE FICHA TÉCNICA
  // ==========================================
  function openTechSpecModal(productId) {
    state.currentTechSpecId = productId;
    const productElement = document.querySelector(`.product-item[data-id="${productId}"]`);
    if (!productElement) return;

    const name = productElement.getAttribute('data-name') || '';
    const model = productElement.getAttribute('data-model') || '';
    const cat = productElement.getAttribute('data-category') || '';
    const img = productElement.getAttribute('data-img') || './img/catalogo/equipamentos/aeroDr.jpg';
    const descEl = productElement.querySelector('p.font-body-sm');
    const desc = descEl ? descEl.textContent.trim() : 'Equipamento hospitalar com assistência técnica e garantia da Microlaser.';

    document.getElementById('techSpecImg').src = img;
    document.getElementById('techSpecImg').alt = name;
    document.getElementById('techSpecName').innerText = name;
    document.getElementById('techSpecModel').innerText = 'MODELO TÉCNICO: ' + model;
    document.getElementById('techSpecCategory').innerText = 'CATEGORIA: ' + (CONFIG.CATEGORY_LABELS[cat] || cat).toUpperCase();
    document.getElementById('techSpecDesc').innerText = desc;

    const specItems = productElement.querySelectorAll('.space-y-1\\.5 > div, ul li, .product-specs span');
    const specRows = [];
    specItems.forEach(row => {
      const spans = row.querySelectorAll('span');
      if (spans.length >= 2) {
        const label = spans[0].textContent.trim().replace(/:$/, '');
        const val = spans[1].textContent.trim();
        specRows.push(`<tr><td class="p-3 bg-surface-container-low/60 text-on-surface-variant font-semibold w-2/5">${label}</td><td class="p-3 text-on-surface font-bold">${val}</td></tr>`);
      } else {
        const text = row.textContent.trim().replace(/^•\s*/, '');
        if (text) {
          const parts = text.split(':');
          if (parts.length > 1) {
            specRows.push(`<tr><td class="p-3 bg-surface-container-low/60 text-on-surface-variant font-semibold w-2/5">${parts[0].trim()}</td><td class="p-3 text-on-surface font-bold">${parts.slice(1).join(':').trim()}</td></tr>`);
          }
        }
      }
    });

    specRows.push(`<tr><td class="p-3 bg-surface-container-low/60 text-on-surface-variant font-semibold w-2/5">Certificações e Laudos</td><td class="p-3 text-on-surface">Padrões RBC / Inmetro e ART CREA-GO</td></tr>`);
    specRows.push(`<tr><td class="p-3 bg-surface-container-low/60 text-on-surface-variant font-semibold w-2/5">Faturamento / Condições</td><td class="p-3 text-on-surface">Faturamento hospitalar (28/56 dias) ou Locação Mensal</td></tr>`);

    document.getElementById('techSpecTableBody').innerHTML = specRows.join('');

    const modal = document.getElementById('techSpecModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  function closeTechSpecModal() {
    const modal = document.getElementById('techSpecModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  function openQuickQuoteFromTechSpec() {
    const name = document.getElementById('techSpecName').innerText;
    const model = document.getElementById('techSpecModel').innerText.replace('MODELO TÉCNICO: ', '');
    closeTechSpecModal();
    openQuickQuoteModal(name, model);
  }

  function addCurrentTechSpecToCart() {
    if (state.currentTechSpecId) {
      addToQuoteCart(state.currentTechSpecId);
      closeTechSpecModal();
    }
  }

  // ==========================================
  // 5. FAQ INTERATIVO
  // ==========================================
  function toggleFaq(index) {
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems[index]) {
      const isActive = faqItems[index].classList.contains('active');
      faqItems.forEach(item => item.classList.remove('active'));
      if (!isActive) {
        faqItems[index].classList.add('active');
      }
    }
  }

  // ==========================================
  // 6. NOTIFICAÇÕES TOAST
  // ==========================================
  function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'px-4 py-3 rounded-xl bg-inverse-surface text-inverse-on-surface shadow-xl border border-outline-variant/20 font-body-sm text-xs font-semibold flex items-center gap-2.5 transform transition-all duration-300 translate-y-2 pointer-events-auto';
    toast.innerHTML = `
      <span class="material-symbols-outlined text-primary-fixed text-[18px]">check_circle</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2');
      toast.classList.add('opacity-100');
    });
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-x-4');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ==========================================
  // 7. COTAÇÃO RÁPIDA INDIVIDUAL
  // ==========================================
  function openQuickQuoteModal(equipmentName, modelCode) {
    state.selectedEquipment = equipmentName;
    state.selectedModel = modelCode || '';
    const nameEl = document.getElementById('modalProductName');
    const modelEl = document.getElementById('modalProductModel');
    if (nameEl) nameEl.innerText = equipmentName;
    if (modelEl) modelEl.innerText = modelCode ? 'MODELO: ' + modelCode : '';

    const modal = document.getElementById('quickQuoteModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  function closeQuickQuoteModal() {
    const modal = document.getElementById('quickQuoteModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  function sendQuickQuoteToWhatsApp() {
    const name = document.getElementById('modalInputName')?.value.trim();
    const hospital = document.getElementById('modalInputHospital')?.value.trim();
    const phone = document.getElementById('modalInputPhone')?.value.trim();

    if (!name || !hospital || !phone) {
      alert('Por favor, informe seu nome, instituição e telefone/WhatsApp.');
      return;
    }

    try {
      const leads = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.LEADS) || '[]');
      leads.push({ name, hospital, phone, equipment: state.selectedEquipment, date: new Date().toISOString() });
      localStorage.setItem(CONFIG.STORAGE_KEYS.LEADS, JSON.stringify(leads));
    } catch (e) {}

    const message = `*SOLICITAÇÃO DE PROPOSTA - MICROLASER*\n\n*Equipamento:* ${state.selectedEquipment} (${state.selectedModel})\n*Solicitante:* ${name}\n*Instituição / CNPJ:* ${hospital}\n*Contato:* ${phone}\n\nOlá! Gostaria de receber proposta com prazo de entrega e condições de faturamento para este item.`;
    const url = `https://wa.me/${CONFIG.PHONE_WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    closeQuickQuoteModal();
    showToast('Encaminhado ao WhatsApp com sucesso.');
  }

  // ==========================================
  // 8. LISTA DE COTAÇÃO MULTI-ITEM (CARRINHO)
  // ==========================================
  function updateCartBadge() {
    const badge = document.getElementById('quoteCartBadge');
    const drawerCount = document.getElementById('cartDrawerCount');
    const totalCount = state.quoteCart.reduce((sum, item) => sum + item.qty, 0);
    if (badge) badge.innerText = totalCount;
    if (drawerCount) drawerCount.innerText = `${totalCount} item(ns) na cotação`;
  }

  function addToQuoteCart(productId) {
    const productElement = document.querySelector(`.product-item[data-id="${productId}"]`);
    if (!productElement) return;

    const name = productElement.getAttribute('data-name');
    const model = productElement.getAttribute('data-model');
    const img = productElement.getAttribute('data-img');

    const existingIndex = state.quoteCart.findIndex(item => item.id === productId);
    if (existingIndex > -1) {
      state.quoteCart[existingIndex].qty += 1;
    } else {
      state.quoteCart.push({ id: productId, name, model, img, qty: 1 });
    }

    localStorage.setItem(CONFIG.STORAGE_KEYS.CART, JSON.stringify(state.quoteCart));
    updateCartBadge();
    showToast(`"${name}" adicionado à lista.`);
  }

  function updateCartItemQty(productId, delta) {
    const idx = state.quoteCart.findIndex(i => i.id === productId);
    if (idx > -1) {
      state.quoteCart[idx].qty += delta;
      if (state.quoteCart[idx].qty <= 0) {
        state.quoteCart.splice(idx, 1);
      }
    }
    localStorage.setItem(CONFIG.STORAGE_KEYS.CART, JSON.stringify(state.quoteCart));
    updateCartBadge();
    renderCartDrawer();
  }

  function removeFromCart(productId) {
    state.quoteCart = state.quoteCart.filter(i => i.id !== productId);
    localStorage.setItem(CONFIG.STORAGE_KEYS.CART, JSON.stringify(state.quoteCart));
    updateCartBadge();
    renderCartDrawer();
  }

  function clearQuoteCart() {
    if (confirm('Deseja esvaziar todos os itens da sua lista de cotação?')) {
      state.quoteCart = [];
      localStorage.setItem(CONFIG.STORAGE_KEYS.CART, JSON.stringify(state.quoteCart));
      updateCartBadge();
      renderCartDrawer();
    }
  }

  function renderCartDrawer() {
    const container = document.getElementById('cartItemsContainer');
    if (!container) return;

    if (state.quoteCart.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 text-on-surface-variant">
          <span class="material-symbols-outlined text-[44px] text-outline mb-2">assignment</span>
          <p class="text-sm font-semibold text-on-surface">Sua lista de cotação está vazia.</p>
          <p class="text-xs mt-1">Clique em "Adicionar" nos equipamentos do catálogo.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = state.quoteCart.map(item => `
      <div class="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
        <img src="${item.img}" alt="${item.name}" class="w-12 h-12 object-contain rounded-lg bg-surface-container-lowest p-1 border border-outline-variant/30 shrink-0">
        <div class="flex-1 min-w-0">
          <span class="block text-xs font-bold text-on-surface truncate">${item.name}</span>
          <span class="block font-technical-mono text-[10px] text-primary font-semibold">${item.model}</span>
          <div class="flex items-center gap-2 mt-1.5 font-technical-mono">
            <button onclick="window.Microlaser.updateCartItemQty('${item.id}', -1)" class="w-5 h-5 rounded bg-surface-container-lowest border border-outline-variant/40 text-on-surface font-bold text-xs flex items-center justify-center hover:bg-surface-container transition-colors">-</button>
            <span class="text-xs font-bold px-1 text-on-surface">${item.qty}</span>
            <button onclick="window.Microlaser.updateCartItemQty('${item.id}', 1)" class="w-5 h-5 rounded bg-surface-container-lowest border border-outline-variant/40 text-on-surface font-bold text-xs flex items-center justify-center hover:bg-surface-container transition-colors">+</button>
          </div>
        </div>
        <button onclick="window.Microlaser.removeFromCart('${item.id}')" class="text-on-surface-variant hover:text-error p-1 transition-colors" title="Remover item">
          <span class="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    `).join('');
  }

  function toggleQuoteDrawer(open) {
    const drawer = document.getElementById('quoteCartDrawer');
    if (!drawer) return;
    if (open) {
      renderCartDrawer();
      drawer.classList.remove('hidden');
    } else {
      drawer.classList.add('hidden');
    }
  }

  function sendFullQuoteListToWhatsApp() {
    if (state.quoteCart.length === 0) {
      alert('Sua lista de cotação está vazia.');
      return;
    }

    const name = document.getElementById('cartLeadName')?.value.trim();
    const hospital = document.getElementById('cartLeadHospital')?.value.trim();
    const phone = document.getElementById('cartLeadPhone')?.value.trim();

    if (!name || !hospital || !phone) {
      alert('Por favor, informe seu nome, instituição e WhatsApp para envio da proposta formal.');
      return;
    }

    const itemsText = state.quoteCart.map(i => `• ${i.qty}x ${i.name} (Ref: ${i.model})`).join('\n');
    const message = `*SOLICITAÇÃO DE COTAÇÃO MULTI-ITEM - MICROLASER*\n\n*Solicitante:* ${name}\n*Hospital / Instituição:* ${hospital}\n*Contato / WhatsApp:* ${phone}\n\n*Itens Selecionados:*\n${itemsText}\n\nOlá, gostaria de receber proposta formal com prazo de entrega e condições de faturamento para os equipamentos listados.`;
    const url = `https://wa.me/${CONFIG.PHONE_WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    toggleQuoteDrawer(false);
    showToast('Lista encaminhada ao WhatsApp.');
  }

  // ==========================================
  // 9. FORMULÁRIO DE PROPOSTA INSTITUCIONAL
  // ==========================================
  function handleB2BFormSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('b2bName')?.value.trim() || '';
    const hospital = document.getElementById('b2bHospital')?.value.trim() || '';
    const phone = document.getElementById('b2bPhone')?.value.trim() || '';
    const need = document.getElementById('b2bNeed')?.value || '';
    const messageText = document.getElementById('b2bMessage')?.value.trim() || 'Nenhum detalhe adicional informado';

    const successBox = document.getElementById('formSuccessMessage');
    if (successBox) successBox.classList.remove('hidden');

    const fullMessage = `*SOLICITAÇÃO DE PROPOSTA / EDITAL - MICROLASER*\n\n*Solicitante:* ${name}\n*Instituição:* ${hospital}\n*Contato:* ${phone}\n*Demanda:* ${need}\n*Detalhes:* ${messageText}`;
    const whatsappUrl = `https://wa.me/${CONFIG.PHONE_WHATSAPP}?text=${encodeURIComponent(fullMessage)}`;

    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      e.target.reset();
      if (successBox) successBox.classList.add('hidden');
    }, 800);
  }

  // ==========================================
  // 10. GAVETA MOBILE
  // ==========================================
  function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) menu.classList.toggle('hidden');
  }

  // ==========================================
  // INICIALIZAÇÃO E EVENT LISTENERS
  // ==========================================
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateCartBadge();

    // Abas de categoria
    const filterButtons = document.querySelectorAll('#catalogFilterTabs .cat-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => {
          b.classList.remove('active-tab', 'bg-primary', 'text-on-primary');
          b.classList.add('bg-surface-container-lowest', 'text-on-surface-variant', 'border', 'border-outline-variant/30');
        });
        btn.classList.add('active-tab', 'bg-primary', 'text-on-primary');
        btn.classList.remove('bg-surface-container-lowest', 'text-on-surface-variant', 'border', 'border-outline-variant/30');

        state.currentCategory = btn.getAttribute('data-cat') || 'all';
        state.isCatalogExpanded = false;
        applyCatalogFilters();
      });
    });

    // Input de busca em tempo real com debounce
    const searchInput = document.getElementById('catalogSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    let searchDebounce = null;

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(() => {
          state.searchQuery = e.target.value.toLowerCase().trim();
          if (clearSearchBtn) {
            if (state.searchQuery) clearSearchBtn.classList.remove('hidden');
            else clearSearchBtn.classList.add('hidden');
          }
          applyCatalogFilters();
        }, 150);
      });
    }

    // Atalho de teclado '/' para pesquisar
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        focusCatalogSearch();
      }
      if (e.key === 'Escape') {
        closeQuickQuoteModal();
        closeTechSpecModal();
        toggleQuoteDrawer(false);
      }
    });

    // Clique na imagem dos cards para abrir ficha técnica
    document.querySelectorAll('#productGridContainer .product-item').forEach(card => {
      const imgBox = card.querySelector('.group') || card.querySelector('img')?.parentElement;
      if (imgBox) {
        imgBox.classList.add('cursor-pointer');
        imgBox.setAttribute('title', 'Ver especificações completas');
        imgBox.addEventListener('click', (e) => {
          if (e.target.tagName !== 'BUTTON') {
            const id = card.getAttribute('data-id');
            if (id) openTechSpecModal(id);
          }
        });
      }
    });

    // Rolagem suave dedicada apenas para links de âncora (#), mantendo a rolagem natural do mouse/touch 100% nativa e direta
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href && href !== '#' && href.startsWith('#')) {
          const targetEl = document.querySelector(href);
          if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth' });
            if (history.pushState) {
              history.pushState(null, null, href);
            }
          }
        }
      });
    });
  });

  // Exportação segura para window para manter compatibilidade com onclick inline existentes
  window.Microlaser = {
    focusCatalogSearch,
    clearCatalogSearch,
    toggleCatalogExpansion,
    resetCatalogFilters,
    filterByBrand,
    switchViewMode,
    openTechSpecModal,
    closeTechSpecModal,
    openQuickQuoteFromTechSpec,
    addCurrentTechSpecToCart,
    toggleFaq,
    showToast,
    openQuickQuoteModal,
    closeQuickQuoteModal,
    sendQuickQuoteToWhatsApp,
    updateCartItemQty,
    removeFromCart,
    clearQuoteCart,
    toggleQuoteDrawer,
    sendFullQuoteListToWhatsApp,
    handleB2BFormSubmit,
    toggleMobileMenu,
    addToQuoteCart
  };

  // Exposição global das funções para os atributos onclick inline do HTML
  Object.assign(window, window.Microlaser);

})();

