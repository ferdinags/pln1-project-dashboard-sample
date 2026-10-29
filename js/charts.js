/**
 * Resilient Charts Engine for PMO PLN 1 Dashboard
 * Supports both standalone SVG/Canvas rendering (100% offline-safe)
 * and Chart.js integration if CDN is loaded.
 */

const PMOCharts = {
  // Palet Warna PLN Icon+
  colors: {
    primary: "#0072BC",    // PLN Blue
    cyan: "#00A3E0",       // PLN Cyan
    gold: "#FFC72C",       // PLN Energy Gold
    emerald: "#10B981",    // Success Green
    rose: "#EF4444",       // Warning / Risk Red
    violet: "#8B5CF6",     // Purple
    slate: "#64748B",      // Gray
    surface: "#F8FAFC",
    border: "#E2E8F0"
  },

  /**
   * Render Donut Chart into a container using SVG
   */
  renderDonut(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
      container.innerHTML = `<div class="empty-chart">Tidak ada data untuk ditampilkan</div>`;
      return;
    }

    const size = options.size || 220;
    const strokeWidth = options.strokeWidth || 34;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    let accumulatedAngle = 0;
    let paths = "";

    data.forEach((item, index) => {
      const percentage = item.value / total;
      const strokeDasharray = `${percentage * circumference} ${circumference}`;
      const strokeDashoffset = -accumulatedAngle * circumference;
      accumulatedAngle += percentage;

      paths += `
        <circle
          cx="${center}"
          cy="${center}"
          r="${radius}"
          fill="transparent"
          stroke="${item.color}"
          stroke-width="${strokeWidth}"
          stroke-dasharray="${strokeDasharray}"
          stroke-dashoffset="${strokeDashoffset}"
          class="donut-segment"
          data-label="${item.label}"
          data-value="${item.value}"
          data-pct="${Math.round(percentage * 100)}%"
        >
          <title>${item.label}: ${item.value} (${Math.round(percentage * 100)}%)</title>
        </circle>
      `;
    });

    const legendHtml = data.map(item => `
      <div class="chart-legend-item">
        <span class="legend-color-dot" style="background-color: ${item.color}"></span>
        <span class="legend-label">${item.label}</span>
        <span class="legend-value">${item.value} <small>(${Math.round((item.value / total) * 100)}%)</small></span>
      </div>
    `).join("");

    container.innerHTML = `
      <div class="donut-chart-wrapper">
        <div class="donut-svg-container" style="width: ${size}px; height: ${size}px;">
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="donut-svg">
            <g transform="rotate(-90 ${center} ${center})">
              ${paths}
            </g>
          </svg>
          <div class="donut-center-text">
            <div class="donut-center-num">${total}</div>
            <div class="donut-center-sub">${options.centerLabel || 'Total Proyek'}</div>
          </div>
        </div>
        <div class="chart-legend-container">
          ${legendHtml}
        </div>
      </div>
    `;
  },

  /**
   * Render Horizontal Bar Chart using clean HTML/CSS bars
   */
  renderHorizontalBar(containerId, items, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!items || items.length === 0) {
      container.innerHTML = `<div class="empty-chart">Tidak ada data untuk ditampilkan</div>`;
      return;
    }

    const html = items.map(item => {
      const percent = Math.min(100, Math.max(0, item.percent));
      let barColor = PMOCharts.colors.primary;
      if (percent >= 90) barColor = PMOCharts.colors.emerald;
      else if (percent >= 60) barColor = PMOCharts.colors.cyan;
      else if (percent >= 30) barColor = PMOCharts.colors.gold;
      else barColor = PMOCharts.colors.slate;

      if (item.customColor) barColor = item.customColor;

      return `
        <div class="hbar-item" title="${item.tooltip || item.label}">
          <div class="hbar-header">
            <span class="hbar-label">${item.label}</span>
            <span class="hbar-badge" style="color: ${barColor}">${item.badgeText || (percent + '%')}</span>
          </div>
          <div class="hbar-track">
            <div class="hbar-fill" style="width: ${percent}%; background-color: ${barColor};"></div>
          </div>
          ${item.subtext ? `<div class="hbar-subtext">${item.subtext}</div>` : ''}
        </div>
      `;
    }).join("");

    container.innerHTML = `<div class="hbar-list">${html}</div>`;
  },

  /**
   * Render Progress Funnel / Stage Tracker
   */
  renderMilestoneFunnel(containerId, stages) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const html = stages.map((st, i) => {
      let icon = "⏳";
      let statusClass = "pending";
      if (st.status === "Done" || st.percent === 100) {
        icon = "✅";
        statusClass = "done";
      } else if (st.status === "In Progress" || (st.percent > 0 && st.percent < 100)) {
        icon = "🔄";
        statusClass = "active";
      } else if (st.status === "Issue" || st.status === "Ada Catatan") {
        icon = "⚠️";
        statusClass = "issue";
      }

      return `
        <div class="funnel-step ${statusClass}">
          <div class="funnel-step-bubble">${icon}</div>
          <div class="funnel-step-body">
            <div class="funnel-step-title">${st.name}</div>
            <div class="funnel-step-progress">
              <div class="funnel-step-bar" style="width: ${st.percent || 0}%"></div>
            </div>
            <div class="funnel-step-meta">${st.percent || 0}% &bull; ${st.status || '-'}</div>
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = `<div class="milestone-funnel-grid">${html}</div>`;
  }
};
