/**
 * Multi-Project / Multi-Customer PMO Dashboard System
 * PLN Icon+ Manajemen Pelayanan PLN 1
 */

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});

const App = {
  // Datasets
  masterProjects: [],
  bagItems: [],
  uip2bItems: [],
  uip2bSummary: INITIAL_UIP2B_SUMMARY,

  // App Navigation State
  // currentScreen: 'master' | 'customer_bag' | 'customer_uip2b' | 'customer_generic'
  currentScreen: 'master',
  selectedCustomerId: null,
  activeTab: 'list', // 'list', 'dashboard', 'advisory'

  // Filters for Master List
  masterFilters: {
    search: '',
    status: 'ALL',
    subHolding: 'ALL'
  },

  // Filters for BAg CR List
  bagFilters: {
    search: '',
    status: 'ALL',
    pic: 'ALL'
  },

  // Filters for UIP2B Jamali List
  uip2bFilters: {
    search: '',
    sbu: 'ALL',
    layanan: 'ALL',
    mutasi: 'ALL',
    statusPA: 'ALL'
  },

  activeSubItem: null,

  init() {
    this.masterProjects = loadMasterProjects();
    this.bagItems = loadBagSubItems();
    this.uip2bItems = loadUip2bItems();

    this.bindEvents();
    this.updateGlobalKPIs();
    this.renderMasterTable();
    this.updateSystemTime();
    setInterval(() => this.updateSystemTime(), 60000);
  },

  updateSystemTime() {
    const timeEl = document.getElementById("header-system-time");
    if (timeEl) {
      const now = new Date();
      timeEl.textContent = now.toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    }
  },

  bindEvents() {
    // Navigation Tabs (on Master level)
    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.switchMainTab(tab);
      });
    });

    // Master Search
    const masterSearch = document.getElementById("master-search-input");
    if (masterSearch) {
      masterSearch.addEventListener("input", (e) => {
        this.masterFilters.search = e.target.value.toLowerCase().trim();
        this.renderMasterTable();
      });
    }

    const masterStatusFilter = document.getElementById("master-filter-status");
    if (masterStatusFilter) {
      masterStatusFilter.addEventListener("change", (e) => {
        this.masterFilters.status = e.target.value;
        this.renderMasterTable();
      });
    }

    // Back to Master List button
    document.querySelectorAll(".btn-back-to-master").forEach(btn => {
      btn.addEventListener("click", () => {
        this.navigateToScreen("master");
      });
    });

    // Quick customer select
    const customerSelect = document.getElementById("quick-customer-dropdown");
    if (customerSelect) {
      customerSelect.addEventListener("change", (e) => {
        const val = e.target.value;
        if (val === "MASTER") {
          this.navigateToScreen("master");
        } else {
          this.openCustomerDashboard(val);
        }
      });
    }

    // BAg Filters
    const bagSearch = document.getElementById("bag-search-input");
    if (bagSearch) {
      bagSearch.addEventListener("input", (e) => {
        this.bagFilters.search = e.target.value.toLowerCase().trim();
        this.renderBagTable();
      });
    }

    const bagStatus = document.getElementById("bag-filter-status");
    if (bagStatus) {
      bagStatus.addEventListener("change", (e) => {
        this.bagFilters.status = e.target.value;
        this.renderBagTable();
      });
    }

    const bagPic = document.getElementById("bag-filter-pic");
    if (bagPic) {
      bagPic.addEventListener("change", (e) => {
        this.bagFilters.pic = e.target.value;
        this.renderBagTable();
      });
    }

    // UIP2B Filters
    const uip2bSearch = document.getElementById("uip2b-search-input");
    if (uip2bSearch) {
      uip2bSearch.addEventListener("input", (e) => {
        this.uip2bFilters.search = e.target.value.toLowerCase().trim();
        this.renderUip2bTable();
      });
    }

    const uip2bSbu = document.getElementById("uip2b-filter-sbu");
    if (uip2bSbu) {
      uip2bSbu.addEventListener("change", (e) => {
        this.uip2bFilters.sbu = e.target.value;
        this.renderUip2bTable();
      });
    }

    const uip2bLayanan = document.getElementById("uip2b-filter-layanan");
    if (uip2bLayanan) {
      uip2bLayanan.addEventListener("change", (e) => {
        this.uip2bFilters.layanan = e.target.value;
        this.renderUip2bTable();
      });
    }

    const uip2bMutasi = document.getElementById("uip2b-filter-mutasi");
    if (uip2bMutasi) {
      uip2bMutasi.addEventListener("change", (e) => {
        this.uip2bFilters.mutasi = e.target.value;
        this.renderUip2bTable();
      });
    }

    const uip2bStatusPA = document.getElementById("uip2b-filter-pa");
    if (uip2bStatusPA) {
      uip2bStatusPA.addEventListener("change", (e) => {
        this.uip2bFilters.statusPA = e.target.value;
        this.renderUip2bTable();
      });
    }

    // Modal Close
    document.querySelectorAll(".btn-close-modal, .btn-modal-cancel").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".modal-backdrop").forEach(m => m.classList.remove("open"));
      });
    });

    document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) {
          backdrop.classList.remove("open");
        }
      });
    });

    // Sub-item tabs
    document.querySelectorAll(".modal-tab-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const paneId = e.currentTarget.dataset.pane;
        document.querySelectorAll(".modal-tab-btn").forEach(b => b.classList.toggle("active", b === e.currentTarget));
        document.querySelectorAll(".modal-pane").forEach(p => p.classList.toggle("active", p.id === `pane-cockpit-${paneId}`));
      });
    });

    // Update Slider
    const devRange = document.getElementById("update-dev-progress");
    const devDisplay = document.getElementById("update-dev-display");
    if (devRange && devDisplay) {
      devRange.addEventListener("input", (e) => {
        devDisplay.textContent = e.target.value + "%";
      });
    }

    const delivRange = document.getElementById("update-deliv-progress");
    const delivDisplay = document.getElementById("update-deliv-display");
    if (delivRange && delivDisplay) {
      delivRange.addEventListener("input", (e) => {
        delivDisplay.textContent = e.target.value + "%";
      });
    }

    // Forms
    const pmoUpdateForm = document.getElementById("pmo-update-form");
    if (pmoUpdateForm) {
      pmoUpdateForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleBagItemUpdateSubmit();
      });
    }
  },

  updateGlobalKPIs() {
    const totalProjects = this.masterProjects.length;
    const totalNilai = this.masterProjects.reduce((sum, p) => sum + (p.nilai || 0), 0);
    const avgOverall = Math.round(this.masterProjects.reduce((sum, p) => sum + (p.overallProgress || 0), 0) / totalProjects);
    const totalSubItems = this.masterProjects.reduce((sum, p) => sum + (p.subItemCount || 0), 0);

    this.setText("kpi-global-projects", totalProjects);
    this.setText("kpi-global-nilai", this.formatRupiahShort(totalNilai));
    this.setText("kpi-global-progress", `${avgOverall}%`);
    this.setText("kpi-global-subitems", totalSubItems.toLocaleString("id-ID"));
    this.setText("nav-badge-master", totalProjects);
  },

  switchMainTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });

    const secList = document.getElementById("sec-master-list");
    const secDash = document.getElementById("sec-global-dashboard");
    const secAdv = document.getElementById("sec-advisory");

    if (secList) secList.style.display = (tabId === "list") ? "block" : "none";
    if (secDash) secDash.style.display = (tabId === "dashboard") ? "block" : "none";
    if (secAdv) secAdv.style.display = (tabId === "advisory") ? "block" : "none";

    if (tabId === "dashboard") {
      this.renderGlobalExecutiveCharts();
    }
  },

  /* ===================================================================
     LEVEL 1: MASTER LIST OF ALL PMO PROJECTS (PELANGGAN)
     =================================================================== */

  renderMasterTable() {
    const tbody = document.getElementById("master-project-tbody");
    if (!tbody) return;

    const filtered = this.masterProjects.filter(p => {
      if (this.masterFilters.status !== "ALL" && p.status !== this.masterFilters.status) return false;
      if (this.masterFilters.search) {
        const q = this.masterFilters.search;
        const matchTitle = (p.pekerjaan || '').toLowerCase().includes(q);
        const matchCust = (p.pelanggan || '').toLowerCase().includes(q);
        const matchPmo = (p.pmo || '').toLowerCase().includes(q);
        const matchType = (p.tipeProyek || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCust && !matchPmo && !matchType) return false;
      }
      return true;
    });

    this.setText("master-filtered-count", `${filtered.length} Proyek Pelanggan`);

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 2rem;">Tidak ada proyek yang sesuai filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(p => {
      const overall = p.overallProgress || 0;
      let barColor = "blue";
      if (overall >= 80) barColor = "green";
      else if (overall <= 40) barColor = "gold";

      return `
        <tr>
          <td style="font-weight: 800; text-align: center; color: var(--text-muted); width: 45px;">${p.no}</td>
          <td>
            <div class="customer-pill">
              <span class="subholding-tag">${p.subHolding}</span>
              <strong style="font-size: 0.9rem; cursor: pointer; color: var(--pln-blue-700);" onclick="App.openCustomerDashboard('${p.id}')">
                ${p.pelanggan}
              </strong>
            </div>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem;">
              📦 ${p.subItemCount.toLocaleString('id-ID')} ${p.subItemUnit}
            </div>
          </td>
          <td style="max-width: 320px;">
            <a href="javascript:void(0)" class="project-title-link" onclick="App.openCustomerDashboard('${p.id}')">
              ${p.pekerjaan}
            </a>
            <div style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.35;">
              ${p.tipeProyek}
            </div>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <span style="width: 26px; height: 26px; border-radius: 50%; background: #E0F2FE; color: var(--pln-blue-700); font-size: 0.75rem; font-weight: 800; display: inline-flex; align-items: center; justify-content: center;">
                ${p.pmo.charAt(0)}
              </span>
              <span style="font-weight: 600; font-size: 0.825rem;">${p.pmo}</span>
            </div>
          </td>
          <td style="white-space: nowrap;">
            <div style="font-weight: 800; font-size: 0.9rem; color: var(--text-main);">
              ${this.formatRupiahShort(p.nilai)}
            </div>
            <div style="font-size: 0.6875rem; color: var(--text-muted);">
              ${p.statusPenagihan}
            </div>
          </td>
          <td>
            ${this.getStatusBadgeHtml(p.status)}
          </td>
          <td style="white-space: nowrap; font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">
            🎯 ${p.target}
          </td>
          <td>
            <div class="progress-container">
              <div class="progress-label-row">
                <span>Progress</span>
                <span>${overall}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill ${barColor}" style="width: ${overall}%"></div>
              </div>
              <div class="progress-subtext">
                <span>Dev: ${p.devProgress}%</span>
                <span>Deliv: ${p.deliverableProgress}%</span>
              </div>
            </div>
          </td>
          <td style="text-align: center; white-space: nowrap;">
            <button class="btn-detail" onclick="App.openCustomerDashboard('${p.id}')" title="Buka Dashboard & Detail Proyek Ini">
              <span>📊</span> Buka Dashboard
            </button>
          </td>
        </tr>
      `;
    }).join("");
  },

  /* ===================================================================
     LEVEL 2: SCREEN NAVIGATION (Master vs Dedicated Customer Dashboards)
     =================================================================== */

  navigateToScreen(screenName, customerId = null) {
    this.currentScreen = screenName;
    this.selectedCustomerId = customerId;

    const screenMaster = document.getElementById("screen-master");
    const screenBag = document.getElementById("screen-customer-bag");
    const screenUip2b = document.getElementById("screen-customer-uip2b");
    const screenGeneric = document.getElementById("screen-customer-generic");

    if (screenMaster) screenMaster.style.display = (screenName === "master") ? "block" : "none";
    if (screenBag) screenBag.style.display = (screenName === "customer_bag") ? "block" : "none";
    if (screenUip2b) screenUip2b.style.display = (screenName === "customer_uip2b") ? "block" : "none";
    if (screenGeneric) screenGeneric.style.display = (screenName === "customer_generic") ? "block" : "none";

    const dropdown = document.getElementById("quick-customer-dropdown");
    if (dropdown) {
      dropdown.value = customerId || "MASTER";
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  openCustomerDashboard(projectId) {
    const p = this.masterProjects.find(item => item.id === projectId);
    if (!p) return;

    if (projectId === "PRJ-BAG") {
      this.navigateToScreen("customer_bag", "PRJ-BAG");
      this.renderBagDashboard();
    } else if (projectId === "PRJ-UIP2B") {
      this.navigateToScreen("customer_uip2b", "PRJ-UIP2B");
      this.renderUip2bDashboard();
    } else {
      this.navigateToScreen("customer_generic", projectId);
      this.renderGenericDashboard(p);
    }
  },

  /* ===================================================================
     LEVEL 2A: DASHBOARD PELANGGAN PT PELAYARAN BAHTERA ADHIGUNA (BAg)
     (Tampilan 16 Sub-Pekerjaan Aplikasi Korporat, ERP FM & CRM)
     =================================================================== */

  renderBagDashboard() {
    this.renderBagKPIs();
    this.renderBagFunnel();
    this.renderBagTable();
  },

  renderBagKPIs() {
    const totalCR = this.bagItems.length;
    const totalNilai = this.bagItems.reduce((s, item) => s + (item.nilai || 0), 0);
    const goLiveCount = this.bagItems.filter(item => item.status === "Go Live" || item.status === "Proses Invoice").length;
    const issueCount = this.bagItems.filter(item => item.status === "Ada Kendala").length;
    const invoiceCount = this.bagItems.filter(item => item.statusPenagihan === "Proses Invoice").length;

    this.setText("bag-kpi-total-cr", totalCR);
    this.setText("bag-kpi-total-nilai", this.formatRupiah(totalNilai));
    this.setText("bag-kpi-golive", `${goLiveCount} / ${totalCR}`);
    this.setText("bag-kpi-issues", issueCount);
    this.setText("bag-kpi-invoice", invoiceCount);
  },

  renderBagFunnel() {
    const container = document.getElementById("bag-lifecycle-stepper");
    if (!container) return;

    const stages = [
      { name: "1. Kontrak Rinci", percent: 100, status: "Done" },
      { name: "2. Blueprint", percent: 94, status: "Done" },
      { name: "3. Development", percent: 88, status: "Done" },
      { name: "4. UAT / Re-UAT", percent: 78, status: "Active" },
      { name: "5. EUT Training", percent: 70, status: "Active" },
      { name: "6. Deployment", percent: 65, status: "Done" },
      { name: "7. Go Live", percent: 62, status: "Done" },
      { name: "8. BASTP", percent: 45, status: "Active" },
      { name: "9. Invoicing", percent: 25, status: "Active" }
    ];

    PMOCharts.renderMilestoneFunnel("bag-lifecycle-stepper", stages);
  },

  renderBagTable() {
    const tbody = document.getElementById("bag-table-tbody");
    if (!tbody) return;

    const filtered = this.bagItems.filter(item => {
      if (this.bagFilters.status !== "ALL" && item.status !== this.bagFilters.status) return false;
      if (this.bagFilters.pic !== "ALL" && item.pic !== this.bagFilters.pic) return false;
      if (this.bagFilters.search) {
        const q = this.bagFilters.search;
        const matchTitle = item.pekerjaan.toLowerCase().includes(q);
        const matchPic = item.pic.toLowerCase().includes(q);
        const matchCat = (item.category || '').toLowerCase().includes(q);
        if (!matchTitle && !matchPic && !matchCat) return false;
      }
      return true;
    });

    this.setText("bag-filtered-count", `${filtered.length} dari ${this.bagItems.length} Pekerjaan CR`);

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 2rem;">Tidak ada sub-pekerjaan yang sesuai filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(item => {
      const overall = item.overallProgress || 0;
      let barColor = "blue";
      if (overall >= 80) barColor = "green";
      else if (overall <= 35 && item.status === "Ada Kendala") barColor = "red";
      else if (overall <= 45) barColor = "gold";

      return `
        <tr>
          <td style="font-weight: 800; text-align: center; color: var(--text-muted); width: 40px;">${item.no}</td>
          <td style="max-width: 320px;">
            <a href="javascript:void(0)" class="project-title-link" onclick="App.openBagItemModal('${item.id}')">
              ${item.pekerjaan}
            </a>
            <div style="display: flex; gap: 0.35rem; align-items: center; margin-top: 0.2rem;">
              <span class="project-category-tag">${item.category}</span>
              ${item.statusPenagihan === 'Proses Invoice' ? '<span class="status-pill success btn-sm" style="font-size: 0.65rem;">🧾 Siap Invoice</span>' : ''}
            </div>
          </td>
          <td>
            <div style="font-weight: 600; font-size: 0.825rem;">${item.pic}</div>
          </td>
          <td style="white-space: nowrap;">
            <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-main);">
              ${item.nilai ? this.formatRupiah(item.nilai) : '<span style="color: var(--text-muted);">Tahap RAB</span>'}
            </div>
            <div style="font-size: 0.6875rem; color: var(--text-muted);">
              Kontrak: ${item.contractProgress || 100}%
            </div>
          </td>
          <td>${this.getStatusBadgeHtml(item.status)}</td>
          <td style="white-space: nowrap; font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">
            🎯 ${item.targetWaktu || item.endDate || '-'}
          </td>
          <td>
            <div class="progress-container">
              <div class="progress-label-row">
                <span>Progress</span>
                <span>${overall}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill ${barColor}" style="width: ${overall}%"></div>
              </div>
              <div class="progress-subtext">
                <span>Dev: ${item.devProgress || 0}%</span>
                <span>Deliv: ${item.deliverableProgress || 0}%</span>
              </div>
            </div>
          </td>
          <td>
            <span class="status-pill ${item.statusBastp?.includes('Sudah') ? 'success' : (item.statusBastp?.includes('Draft') ? 'warning' : 'neutral')} btn-sm" style="font-size: 0.7rem;">
              ${item.statusBastp || 'Belum'}
            </span>
          </td>
          <td class="table-actions-cell" style="text-align: center;">
            <div class="btn-action-group">
              <button class="btn-detail btn-sm" onclick="App.openBagItemModal('${item.id}')" title="Detail Rinci Sub-Pekerjaan">
                <span>📊</span> Detail
              </button>
              <button class="btn-quick-update btn-sm" onclick="App.openUpdateModalForBag('${item.id}')" title="Update Sub-Pekerjaan Ini">
                <span>✏️</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  },

  openBagItemModal(itemId) {
    const item = this.bagItems.find(i => i.id === itemId);
    if (!item) return;
    this.activeSubItem = item;

    this.setText("cockpit-pelanggan", "PT Pelayaran Bahtera Adhiguna (BAg)");
    this.setText("cockpit-subholding-badge", "BAg");
    this.setText("cockpit-title", item.pekerjaan);
    this.setText("cockpit-category", item.category || "CR Korporat");
    this.setText("cockpit-id", item.id);

    const badgeEl = document.getElementById("cockpit-status-badge");
    if (badgeEl) badgeEl.innerHTML = this.getStatusBadgeHtml(item.status);

    this.setText("cockpit-stat-nilai", item.nilai ? this.formatRupiah(item.nilai) : "Tahap RAB");
    this.setText("cockpit-stat-target", item.targetWaktu || item.endDate || "TBD");
    this.setText("cockpit-stat-pic", item.pic);
    this.setText("cockpit-stat-penagihan", item.statusPenagihan || "Belum Tersedia");
    this.setText("cockpit-stat-overall-pct", `${item.overallProgress || 0}%`);
    this.setText("cockpit-stat-dev-pct", `${item.devProgress || 0}%`);
    this.setText("cockpit-stat-deliv-pct", `${item.deliverableProgress || 0}%`);

    // Stepper
    this.renderBagSubItemStepper(item);

    // Panes
    this.renderBagItemOverview(item);
    this.renderBagItemContract(item);
    this.renderBagItemTechnical(item);
    this.renderBagItemLogs(item);
    this.renderBagItemRisks(item);

    // Open Modal
    document.querySelectorAll(".modal-tab-btn").forEach(b => b.classList.toggle("active", b.dataset.pane === "overview"));
    document.querySelectorAll(".modal-pane").forEach(p => p.classList.toggle("active", p.id === "pane-cockpit-overview"));

    const modal = document.getElementById("modal-detail-cockpit");
    if (modal) modal.classList.add("open");
  },

  renderBagSubItemStepper(item) {
    const container = document.getElementById("cockpit-lifecycle-stepper");
    if (!container) return;

    const steps = [
      { id: "kontrak", title: "Kontrak Rinci", desc: item.contractProgress === 100 ? "Tersedia" : "Draft" },
      { id: "blueprint", title: "Blueprint", desc: item.statusBlueprint || "Pending" },
      { id: "dev", title: "Development", desc: `${item.devProgress || 0}%` },
      { id: "uat", title: "UAT", desc: item.statusUat || "Belum" },
      { id: "eut", title: "EUT", desc: item.statusEut || "Belum" },
      { id: "deploy", title: "Deployment", desc: item.statusDeploy || "Belum" },
      { id: "golive", title: "Go Live", desc: item.statusGoLive || "Belum" },
      { id: "bastp", title: "BASTP", desc: item.statusBastp || "Belum" },
      { id: "invoice", title: "Penagihan", desc: item.statusPenagihan || "Belum" }
    ];

    container.innerHTML = steps.map((st, i) => {
      let nodeState = "pending";
      let icon = i + 1;

      if (st.id === "kontrak" && item.contractProgress >= 80) { nodeState = "completed"; icon = "✓"; }
      else if (st.id === "blueprint" && (st.desc.includes("Done") || st.desc.includes("Full"))) { nodeState = "completed"; icon = "✓"; }
      else if (st.id === "dev" && item.devProgress === 100) { nodeState = "completed"; icon = "✓"; }
      else if (st.id === "uat" && st.desc.includes("Sudah")) { nodeState = "completed"; icon = "✓"; }
      else if (st.id === "uat" && st.desc.includes("Catatan")) { nodeState = "issue"; icon = "!"; }
      else if (st.id === "golive" && (st.desc.includes("Sudah") || item.status === "Go Live")) { nodeState = "completed"; icon = "✓"; }
      else if (st.id === "bastp" && st.desc.includes("Sudah")) { nodeState = "completed"; icon = "✓"; }
      else if (st.id === "bastp" && st.desc.includes("Draft")) { nodeState = "current"; }
      else if (st.id === "invoice" && st.desc === "Proses Invoice") { nodeState = "current"; icon = "🧾"; }

      return `
        <div class="stepper-step ${nodeState}">
          <div class="step-node">${icon}</div>
          <div class="step-title">${st.title}</div>
          <div class="step-desc">${st.desc}</div>
        </div>
      `;
    }).join("");
  },

  renderBagItemOverview(item) {
    const pane = document.getElementById("pane-cockpit-overview");
    if (!pane) return;

    pane.innerHTML = `
      <div class="detail-grid-2col">
        <div class="detail-card-panel">
          <div class="panel-header">
            <span>📈 Realisasi Progress & Status</span>
            <span class="status-pill ${item.overallProgress >= 80 ? 'success' : 'active'}">${item.overallProgress}% Overall</span>
          </div>
          <div id="cockpit-progress-bars"></div>
        </div>

        <div class="detail-card-panel">
          <div class="panel-header">
            <span>🎯 Tindak Lanjut & Log Terkini</span>
          </div>
          <div class="field-pair">
            <div class="field-label">Target Waktu Penyelesaian</div>
            <div class="field-val" style="color: var(--pln-blue-700); font-weight: 800;">
              📅 ${item.targetWaktu || item.endDate || 'TBD'}
            </div>
          </div>
          <div class="field-pair">
            <div class="field-label">Langkah Selanjutnya</div>
            <div class="field-val" style="background: #F0FDF4; border: 1px solid #BBF7D0; padding: 0.75rem; border-radius: var(--radius-md); color: #166534; font-size: 0.85rem;">
              👉 ${item.langkahSelanjutnya || 'Belum ada langkah selanjutnya yang dicatat.'}
            </div>
          </div>
          <div class="field-pair">
            <div class="field-label">Update Log Terakhir</div>
            <div class="field-val" style="font-size: 0.85rem; color: var(--text-muted);">
              ${item.statusTerkini || 'Belum ada update log.'}
            </div>
          </div>
          ${item.kendala && item.kendala !== '-' ? `
            <div class="field-pair" style="margin-top: 0.75rem;">
              <div class="field-label" style="color: var(--pln-rose-600);">⚠️ Kendala / Blocker Aktif</div>
              <div class="field-val" style="background: #FEF2F2; border: 1px solid #FECACA; padding: 0.65rem; border-radius: var(--radius-md); color: #991B1B; font-size: 0.825rem;">
                ${item.kendala}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    PMOCharts.renderHorizontalBar("cockpit-progress-bars", [
      { label: "Development Progress", percent: item.devProgress || 0, subtext: "Pengerjaan modul software" },
      { label: "Deliverables Progress", percent: item.deliverableProgress || 0, subtext: "Kelengkapan Berita Acara & Dokumen Legal" },
      { label: "Kontrak Rinci & Administrasi", percent: item.contractProgress || 100, subtext: "MoM, Surat Penugasan & Kontrak Rinci" }
    ]);
  },

  renderBagItemContract(item) {
    const pane = document.getElementById("pane-cockpit-contract");
    if (!pane) return;

    pane.innerHTML = `
      <div class="detail-grid-2col">
        <div class="detail-card-panel">
          <div class="panel-header">
            <span>📜 Kontrak Rinci & Dasar Perjanjian</span>
          </div>
          <div class="field-pair">
            <div class="field-label">Nomor Kontrak Rinci</div>
            <div class="field-val" style="font-family: 'JetBrains Mono', monospace; font-size: 0.825rem;">
              ${item.kontrakRinci || 'Belum Tersedia'}
            </div>
          </div>
          <div class="field-pair">
            <div class="field-label">Risalah Pembahasan (MoM)</div>
            <div class="field-val" style="font-size: 0.825rem;">
              ${item.mom || '-'}
            </div>
          </div>
          <div class="field-pair">
            <div class="field-label">Link Dokumen (SharePoint / Google Drive)</div>
            <div class="field-val">
              ${item.linkDokumen ? `<a href="${item.linkDokumen}" target="_blank" rel="noopener noreferrer">🔗 Buka Folder Dokumen Proyek</a>` : 'Belum ada link'}
            </div>
          </div>
        </div>

        <div class="detail-card-panel">
          <div class="panel-header">
            <span>💰 Nilai & Catatan Sales</span>
          </div>
          <div class="field-pair">
            <div class="field-label">Nilai Kontrak (IDR)</div>
            <div class="field-val" style="font-size: 1.4rem; font-weight: 800; color: var(--pln-blue-800);">
              ${item.nilai ? this.formatRupiah(item.nilai) : 'Tahap RAB Estimasi'}
            </div>
          </div>
          <div class="field-pair">
            <div class="field-label">Status Penagihan</div>
            <div class="field-val">${item.statusPenagihan || 'Belum Tersedia'}</div>
          </div>
          <div class="field-pair">
            <div class="field-label">Catatan Sales</div>
            <div class="field-val" style="background: #F8FAFC; padding: 0.65rem; border-radius: var(--radius-md);">
              ${item.catatanSales || '-'}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderBagItemTechnical(item) {
    const pane = document.getElementById("pane-cockpit-technical");
    if (!pane) return;

    pane.innerHTML = `
      <div class="detail-card-panel">
        <div class="panel-header">
          <span>📋 Status Berita Acara & Deliverables BAg</span>
        </div>
        <div class="deliverables-checklist-grid">
          <div class="deliverable-item-card">
            <div>
              <div class="deliverable-name">Blueprint Document</div>
              <div class="deliverable-meta">BRD, FSD, Technical Specs</div>
            </div>
            <span class="status-pill ${item.statusBlueprint?.includes('Done') ? 'success' : 'warning'}">${item.statusBlueprint || 'Pending'}</span>
          </div>

          <div class="deliverable-item-card">
            <div>
              <div class="deliverable-name">Berita Acara UAT</div>
              <div class="deliverable-meta">Testing User Acceptance</div>
            </div>
            <span class="status-pill ${item.statusUat?.includes('Sudah') ? 'success' : (item.statusUat?.includes('Catatan') ? 'danger' : 'neutral')}">${item.statusUat || 'Belum'}</span>
          </div>

          <div class="deliverable-item-card">
            <div>
              <div class="deliverable-name">Berita Acara EUT</div>
              <div class="deliverable-meta">End User Training</div>
            </div>
            <span class="status-pill ${item.statusEut?.includes('Sudah') ? 'success' : 'neutral'}">${item.statusEut || 'Belum'}</span>
          </div>

          <div class="deliverable-item-card">
            <div>
              <div class="deliverable-name">Berita Acara Deploy</div>
              <div class="deliverable-meta">Deployment Production</div>
            </div>
            <span class="status-pill ${item.statusDeploy?.includes('Sudah') ? 'success' : 'neutral'}">${item.statusDeploy || 'Belum'}</span>
          </div>

          <div class="deliverable-item-card">
            <div>
              <div class="deliverable-name">Berita Acara Go Live</div>
              <div class="deliverable-meta">Live Operation Milestone</div>
            </div>
            <span class="status-pill ${item.statusGoLive?.includes('Sudah') ? 'success' : 'neutral'}">${item.statusGoLive || 'Belum'}</span>
          </div>

          <div class="deliverable-item-card" style="border: 2px solid ${item.statusBastp?.includes('Sudah') ? '#10B981' : '#F59E0B'};">
            <div>
              <div class="deliverable-name">BASTP (Closing Penagihan)</div>
              <div class="deliverable-meta">Serah Terima Pekerjaan</div>
            </div>
            <span class="status-pill ${item.statusBastp?.includes('Sudah') ? 'success' : 'warning'}">${item.statusBastp || 'Pending'}</span>
          </div>
        </div>
      </div>
    `;
  },

  renderBagItemLogs(item) {
    const pane = document.getElementById("pane-cockpit-logs");
    if (!pane) return;

    pane.innerHTML = `
      <div class="detail-card-panel">
        <div class="panel-header">
          <span>📅 Riwayat Log Status Terkini</span>
          <button class="btn-primary btn-sm" onclick="App.openUpdateModalForBag('${item.id}')">+ Tambah Update</button>
        </div>
        <div class="timeline-list">
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-date">${item.targetWaktu || 'Update Terkini'}</div>
            <div class="timeline-content">${item.statusTerkini || 'Belum ada catatan log.'}</div>
          </div>
        </div>
      </div>
    `;
  },

  renderBagItemRisks(item) {
    const pane = document.getElementById("pane-cockpit-risks");
    if (!pane) return;

    pane.innerHTML = `
      <div class="detail-card-panel">
        <div class="panel-header">
          <span>⚠️ Kendala & Rencana Mitigasi</span>
        </div>
        <div style="font-size: 0.875rem; line-height: 1.5; background: #FFFBEB; border: 1px solid #FDE68A; padding: 1rem; border-radius: var(--radius-md);">
          ${item.kendala && item.kendala !== '-' ? item.kendala : 'Tidak ada kendala aktif saat ini (Proyek berjalan lancar).'}
        </div>
      </div>
    `;
  },

  openUpdateModalForBag(itemId) {
    const item = this.bagItems.find(i => i.id === itemId);
    if (!item) return;
    this.activeSubItem = item;

    document.getElementById("update-project-id").value = item.id;
    this.setText("update-modal-customer", "PT Pelayaran Bahtera Adhiguna (BAg)");
    this.setText("update-modal-project-title", item.pekerjaan);

    const devRange = document.getElementById("update-dev-progress");
    const devDisplay = document.getElementById("update-dev-display");
    if (devRange && devDisplay) {
      devRange.value = item.devProgress || 0;
      devDisplay.textContent = (item.devProgress || 0) + "%";
    }

    const delivRange = document.getElementById("update-deliv-progress");
    const delivDisplay = document.getElementById("update-deliv-display");
    if (delivRange && delivDisplay) {
      delivRange.value = item.deliverableProgress || 0;
      delivDisplay.textContent = (item.deliverableProgress || 0) + "%";
    }

    const statusSel = document.getElementById("update-status-select");
    if (statusSel) statusSel.value = item.status || "On Progress";

    const penSel = document.getElementById("update-penagihan-select");
    if (penSel) penSel.value = item.statusPenagihan || "Belum Tersedia";

    const targetInput = document.getElementById("update-target-waktu");
    if (targetInput) targetInput.value = item.targetWaktu || "";

    const nextActionInput = document.getElementById("update-next-action");
    if (nextActionInput) nextActionInput.value = item.langkahSelanjutnya || "";

    const kendalaInput = document.getElementById("update-kendala");
    if (kendalaInput) kendalaInput.value = item.kendala && item.kendala !== '-' ? item.kendala : "";

    const newLogInput = document.getElementById("update-new-log");
    if (newLogInput) newLogInput.value = "";

    document.querySelectorAll(".modal-backdrop").forEach(m => m.classList.remove("open"));
    const modal = document.getElementById("modal-pmo-update");
    if (modal) modal.classList.add("open");
  },

  handleBagItemUpdateSubmit() {
    const id = document.getElementById("update-project-id").value;
    const item = this.bagItems.find(i => i.id === id);
    if (!item) return;

    const devVal = parseInt(document.getElementById("update-dev-progress").value) || 0;
    const delivVal = parseInt(document.getElementById("update-deliv-progress").value) || 0;
    const newStatus = document.getElementById("update-status-select").value;
    const newPen = document.getElementById("update-penagihan-select").value;
    const targetWaktu = document.getElementById("update-target-waktu").value;
    const nextAction = document.getElementById("update-next-action").value;
    const kendala = document.getElementById("update-kendala").value;
    const newLog = document.getElementById("update-new-log").value.trim();

    item.devProgress = devVal;
    item.deliverableProgress = delivVal;
    item.overallProgress = Math.round((devVal * 0.6) + (delivVal * 0.4));
    item.status = newStatus;
    item.statusPenagihan = newPen;
    if (targetWaktu) item.targetWaktu = targetWaktu;
    if (nextAction) item.langkahSelanjutnya = nextAction;
    item.kendala = kendala || "-";

    if (newLog) {
      const now = new Date();
      const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
      item.statusTerkini = `[${dateStr}] ${newLog}`;
    }

    saveBagSubItems(this.bagItems);

    // Update master overall progress for BAg
    const bagMaster = this.masterProjects.find(m => m.id === "PRJ-BAG");
    if (bagMaster) {
      const avg = Math.round(this.bagItems.reduce((s, it) => s + (it.overallProgress || 0), 0) / this.bagItems.length);
      bagMaster.overallProgress = avg;
      saveMasterProjects(this.masterProjects);
    }

    this.renderBagDashboard();
    this.updateGlobalKPIs();
    document.querySelectorAll(".modal-backdrop").forEach(m => m.classList.remove("open"));

    this.showToast("Berhasil Disimpan", `Update CR BAg #${item.no} berhasil disimpan.`, "success");
    this.openBagItemModal(item.id);
  },

  /* ===================================================================
     LEVEL 2B: DASHBOARD PELANGGAN PT PLN (PERSERO) UIP2B JAMALI
     (Tampilan 4.685 Permohonan Layanan Telco, SCADA, Dark Fiber, BMS)
     =================================================================== */

  renderUip2bDashboard() {
    this.renderUip2bKPIs();
    this.renderUip2bCharts();
    this.renderUip2bTable();
  },

  renderUip2bKPIs() {
    const s = this.uip2bSummary;
    this.setText("uip2b-kpi-total", s.totalCount.toLocaleString('id-ID'));
    this.setText("uip2b-kpi-kesepakatan", s.kesepakatanUploaded.toLocaleString('id-ID'));
    this.setText("uip2b-kpi-bai", s.baiUploaded.toLocaleString('id-ID'));
    this.setText("uip2b-kpi-mutasi", `${s.aktivasiCount.toLocaleString('id-ID')} Akt / ${s.changeTariffCount.toLocaleString('id-ID')} Chg`);
    this.setText("uip2b-kpi-aging", `${s.avgAgingMonths} Bulan`);
  },

  renderUip2bCharts() {
    // Services horizontal bars
    const serviceItems = Object.entries(this.uip2bSummary.serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        label: name,
        percent: Math.round((count / this.uip2bSummary.totalCount) * 100),
        badgeText: `${count.toLocaleString('id-ID')} Layanan`,
        tooltip: `${name}: ${count} permohonan`
      }));

    PMOCharts.renderHorizontalBar("uip2b-chart-services", serviceItems.slice(0, 6));

    // SBU Distribution Donut
    const sbuColors = ["#0072BC", "#00A3E0", "#10B981", "#FFC72C", "#8B5CF6"];
    const sbuData = Object.entries(this.uip2bSummary.sbuCounts).map(([name, count], i) => ({
      label: name,
      value: count,
      color: sbuColors[i % sbuColors.length]
    }));

    PMOCharts.renderDonut("uip2b-chart-sbu", sbuData, { size: 210, strokeWidth: 32, centerLabel: "Total SBU" });
  },

  renderUip2bTable() {
    const tbody = document.getElementById("uip2b-table-tbody");
    if (!tbody) return;

    const filtered = this.uip2bItems.filter(item => {
      if (this.uip2bFilters.sbu !== "ALL" && item.sbuTerm !== this.uip2bFilters.sbu) return false;
      if (this.uip2bFilters.layanan !== "ALL" && item.layanan !== this.uip2bFilters.layanan) return false;
      if (this.uip2bFilters.mutasi !== "ALL" && item.jenisMutasi !== this.uip2bFilters.mutasi) return false;
      if (this.uip2bFilters.statusPA !== "ALL" && item.statusPA !== this.uip2bFilters.statusPA) return false;

      if (this.uip2bFilters.search) {
        const q = this.uip2bFilters.search;
        const matchId = (item.id || '').toLowerCase().includes(q);
        const matchSid = (item.sidBaru || '').toLowerCase().includes(q) || (item.sidLama || '').toLowerCase().includes(q);
        const matchTerm = (item.alamatTerm || '').toLowerCase().includes(q);
        const matchSales = (item.sales || '').toLowerCase().includes(q);
        const matchProd = (item.produk || '').toLowerCase().includes(q);
        if (!matchId && !matchSid && !matchTerm && !matchSales && !matchProd) return false;
      }
      return true;
    });

    this.setText("uip2b-filtered-count", `Menampilkan ${filtered.length} dari 4.685 Permohonan UIP2B`);

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 2rem;">Tidak ada permohonan yang sesuai filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map((item, idx) => {
      let mutasiClass = "changetarif";
      if (item.jenisMutasi === "AKTIVASI") mutasiClass = "aktivasi";
      else if (item.jenisMutasi === "DEAKTIVASI") mutasiClass = "deaktivasi";
      else if (item.jenisMutasi === "RELOKASI") mutasiClass = "relokasi";

      let paClass = "diajukan";
      if (item.statusPA?.includes("KESEPAKATAN")) paClass = "kesepakatan";
      else if (item.statusPA?.includes("BAI")) paClass = "bai";
      else if (item.statusPA?.includes("MITRA") || item.statusPA?.includes("PROVISIONING")) paClass = "wo-mitra";
      else if (item.statusPA?.includes("RAB")) paClass = "rab";
      else if (item.statusPA?.includes("DIBATALKAN")) paClass = "cancel";

      return `
        <tr>
          <td style="font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; font-weight: 700; color: var(--pln-blue-700);">
            ${item.id}
          </td>
          <td style="font-family: 'JetBrains Mono', monospace; font-size: 0.78rem;">
            <div>${item.sidBaru}</div>
            ${item.sidLama !== '-' ? `<small style="color: var(--text-muted);">${item.sidLama}</small>` : ''}
          </td>
          <td>
            <span class="badge-mutasi ${mutasiClass}">${item.jenisMutasi}</span>
          </td>
          <td style="max-width: 220px;">
            <div style="font-weight: 700; font-size: 0.825rem; color: var(--text-main);">${item.layanan}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${item.produk}</div>
          </td>
          <td style="max-width: 260px; font-size: 0.78rem; line-height: 1.35;">
            ${item.alamatTerm}
          </td>
          <td>
            <span class="subholding-tag" style="font-size: 0.6875rem;">${item.sbuTerm}</span>
          </td>
          <td>
            <span class="badge-pa ${paClass}">${item.statusPA}</span>
          </td>
          <td style="font-size: 0.78rem; white-space: nowrap;">
            ${item.tglBuat || '-'}
          </td>
          <td style="font-size: 0.78rem;">
            ${item.sales}
          </td>
          <td style="font-weight: 700; text-align: center; font-size: 0.8rem; color: ${item.aging > 20 ? '#EF4444' : 'var(--text-main)'};">
            ${item.aging || '-'}
          </td>
          <td style="text-align: center;">
            <button class="btn-detail btn-sm" onclick="App.openUip2bItemModal('${item.id}')" title="Detail Permohonan">
              Detail
            </button>
          </td>
        </tr>
      `;
    }).join("");
  },

  openUip2bItemModal(itemId) {
    const item = this.uip2bItems.find(i => i.id === itemId);
    if (!item) return;

    this.setText("cockpit-pelanggan", "PT PLN (Persero) UIP2B JAMALI");
    this.setText("cockpit-subholding-badge", "UIP2B");
    this.setText("cockpit-title", `${item.layanan} - ${item.produk}`);
    this.setText("cockpit-category", `${item.jenisMutasi} &bull; SBU ${item.sbuTerm}`);
    this.setText("cockpit-id", item.id);

    const badgeEl = document.getElementById("cockpit-status-badge");
    if (badgeEl) badgeEl.innerHTML = `<span class="badge-pa kesepakatan">${item.statusPA}</span>`;

    this.setText("cockpit-stat-nilai", "Layanan Kontrak UIP2B");
    this.setText("cockpit-stat-target", item.status || "Aktif");
    this.setText("cockpit-stat-pic", item.sales || "-");
    this.setText("cockpit-stat-penagihan", item.statusPA || "-");
    this.setText("cockpit-stat-overall-pct", `${item.aging || 0} Bln`);
    this.setText("cockpit-stat-dev-pct", "100%");
    this.setText("cockpit-stat-deliv-pct", "90%");

    const stepper = document.getElementById("cockpit-lifecycle-stepper");
    if (stepper) {
      stepper.innerHTML = `
        <div class="stepper-step completed"><div class="step-node">✓</div><div class="step-title">Permohonan</div><div class="step-desc">${item.tglBuat}</div></div>
        <div class="stepper-step ${item.tglSubmitRab !== '-' ? 'completed' : 'current'}"><div class="step-node">✓</div><div class="step-title">Submit RAB</div><div class="step-desc">${item.tglSubmitRab}</div></div>
        <div class="stepper-step ${item.tglApproveRab !== '-' ? 'completed' : 'current'}"><div class="step-node">✓</div><div class="step-title">Approve RAB</div><div class="step-desc">${item.tglApproveRab}</div></div>
        <div class="stepper-step completed"><div class="step-node">✓</div><div class="step-title">Status PA</div><div class="step-desc">${item.statusPA}</div></div>
        <div class="stepper-step current"><div class="step-node">⚡</div><div class="step-title">Operasional</div><div class="step-desc">${item.status}</div></div>
      `;
    }

    const pane = document.getElementById("pane-cockpit-overview");
    if (pane) {
      pane.innerHTML = `
        <div class="detail-grid-2col">
          <div class="detail-card-panel">
            <div class="panel-header"><span>🏢 Alamat & Lokasi Jaringan</span></div>
            <div class="field-pair">
              <div class="field-label">Alamat Terminating (GI / Gardu Induk)</div>
              <div class="field-val" style="font-weight: 700; color: var(--pln-blue-800);">${item.alamatTerm}</div>
            </div>
            <div class="field-pair">
              <div class="field-label">SBU Terminating</div>
              <div class="field-val"><span class="subholding-tag">${item.sbuTerm}</span></div>
            </div>
            <div class="field-pair">
              <div class="field-label">Alamat Originating</div>
              <div class="field-val">${item.alamatOrig}</div>
            </div>
            <div class="field-pair">
              <div class="field-label">SBU Originating</div>
              <div class="field-val">${item.sbuOrig}</div>
            </div>
          </div>

          <div class="detail-card-panel">
            <div class="panel-header"><span>📑 Informasi Teknis Permohonan</span></div>
            <div class="field-pair">
              <div class="field-label">ID Permohonan Produk</div>
              <div class="field-val" style="font-family: 'JetBrains Mono', monospace;">${item.id}</div>
            </div>
            <div class="field-pair">
              <div class="field-label">ID Permohonan Induk</div>
              <div class="field-val" style="font-family: 'JetBrains Mono', monospace;">${item.idPermohonan}</div>
            </div>
            <div class="field-pair">
              <div class="field-label">SID Baru / Lama</div>
              <div class="field-val" style="font-family: 'JetBrains Mono', monospace;">${item.sidBaru} / ${item.sidLama}</div>
            </div>
            <div class="field-pair">
              <div class="field-label">Nama Sales PIC</div>
              <div class="field-val">${item.sales} (Manajemen Pelayanan PLN I)</div>
            </div>
            <div class="field-pair">
              <div class="field-label">Aging PA</div>
              <div class="field-val" style="font-weight: 800; color: #DC2626;">${item.aging} Bulan</div>
            </div>
          </div>
        </div>
      `;
    }

    document.querySelectorAll(".modal-tab-btn").forEach(b => b.classList.toggle("active", b.dataset.pane === "overview"));
    document.querySelectorAll(".modal-pane").forEach(p => p.classList.toggle("active", p.id === "pane-cockpit-overview"));

    const modal = document.getElementById("modal-detail-cockpit");
    if (modal) modal.classList.add("open");
  },

  /* ===================================================================
     LEVEL 2C: GENERIC DASHBOARD FOR OTHER SUB-HOLDINGS (IP, NP, KP)
     =================================================================== */

  renderGenericDashboard(p) {
    this.setText("gen-cust-title", p.pelanggan);
    this.setText("gen-cust-desc", p.description);
    this.setText("gen-cust-nilai", this.formatRupiah(p.nilai));
    this.setText("gen-cust-target", p.target);
    this.setText("gen-cust-pmo", p.pmo);
    this.setText("gen-cust-progress", `${p.overallProgress}%`);
    this.setText("gen-cust-link", p.linkDokumen);
  },

  /* ===================================================================
     GLOBAL PMO EXECUTIVE CHARTS
     =================================================================== */

  renderGlobalExecutiveCharts() {
    const donutData = this.masterProjects.map((p, i) => ({
      label: p.subHolding,
      value: p.subItemCount,
      color: ["#0072BC", "#00A3E0", "#10B981", "#FFC72C", "#8B5CF6"][i % 5]
    }));

    PMOCharts.renderDonut("global-donut-projects", donutData, { size: 210, strokeWidth: 32, centerLabel: "Total Items" });

    const barData = this.masterProjects.map(p => ({
      label: p.pelanggan.split('(')[0].trim(),
      percent: p.overallProgress,
      badgeText: `${p.overallProgress}% (${p.subHolding})`,
      tooltip: p.pekerjaan
    }));

    PMOCharts.renderHorizontalBar("global-hbar-progress", barData);
  },

  /* ===================================================================
     UTILITY HELPERS
     =================================================================== */

  getStatusBadgeHtml(status) {
    if (status === "Go Live" || status === "Proses Invoice") {
      return `<span class="status-pill success"><span class="status-dot"></span>${status}</span>`;
    }
    if (status === "On Progress") {
      return `<span class="status-pill active"><span class="status-dot"></span>${status}</span>`;
    }
    if (status === "Ada Kendala") {
      return `<span class="status-pill danger"><span class="status-dot"></span>${status}</span>`;
    }
    if (status === "On Hold" || status === "Tahap Penawaran" || status === "Planning") {
      return `<span class="status-pill warning"><span class="status-dot"></span>${status}</span>`;
    }
    return `<span class="status-pill neutral"><span class="status-dot"></span>${status}</span>`;
  },

  formatRupiah(num) {
    if (!num) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  },

  formatRupiahShort(num) {
    if (!num) return "Rp 0";
    if (num >= 1000000000) {
      return `Rp ${(num / 1000000000).toFixed(2)} Miliar`;
    }
    if (num >= 1000000) {
      return `Rp ${(num / 1000000).toFixed(1)} Juta`;
    }
    return `Rp ${num.toLocaleString('id-ID')}`;
  },

  setText(elementId, text) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = text;
  },

  showToast(title, message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let icon = "✅";
    if (type === "warning") icon = "⚠️";
    if (type === "danger") icon = "❌";

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${message}</div>
      </div>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
};
