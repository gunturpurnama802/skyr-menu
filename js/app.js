(function () {
  "use strict";

  // State
  let menus = [];
  let categories = [];
  let activeCategory = "";
  let bucket = []; // { item, qty, note }

  // 1. Inisialisasi Maskot Lottie
  if (window.lottie) {
    const lottieEl = document.getElementById("mascot-lottie");
    const fallbackImg = document.getElementById("mascot-fallback");
    try {
      const anim = lottie.loadAnimation({
        container: lottieEl,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: "waving_mascot_lottie.json",
        rendererSettings: { preserveAspectRatio: "xMidYMax meet" },
      });
      anim.addEventListener("DOMLoaded", () => {
        if (fallbackImg) fallbackImg.style.display = "none";
      });
    } catch (e) {
      console.warn("Lottie mascot error:", e);
    }
  }

  // 2. Welcome Screen Logic
  const welcomeScreen = document.getElementById("skyr-welcome");
  const welcomeBtn = document.getElementById("welcome-enter-btn");

  function handleEnter() {
    if (welcomeScreen.classList.contains("welcome-exit")) return;
    welcomeScreen.classList.add("welcome-exit");
    setTimeout(() => {
      welcomeScreen.style.display = "none";
    }, 580);
  }

  if (welcomeBtn) {
    welcomeBtn.addEventListener("click", handleEnter);
  }

  document.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && welcomeScreen.style.display !== "none") {
      e.preventDefault();
      handleEnter();
    }
  });

  // 3. Scroll Sticky Glassmorphism Header
  const floatingTopbar = document.getElementById("floating-topbar");
  window.addEventListener(
    "scroll",
    () => {
      const isStuck = window.scrollY > 16;
      if (isStuck) {
        floatingTopbar.className =
          "pointer-events-auto mx-auto flex max-w-fit items-center gap-2 rounded-full border p-1.5 pr-1.5 transition-all duration-300 ease-out sm:gap-3 sm:p-2 bg-white/22 backdrop-blur-2xl border-white/30 shadow-[0_12px_40px_rgba(0,0,0,0.22),0_4px_16px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.35)] scale-[0.97] sm:scale-[0.98]";
      } else {
        floatingTopbar.className =
          "pointer-events-auto mx-auto flex max-w-fit items-center gap-2 rounded-full border p-1.5 pr-1.5 transition-all duration-300 ease-out sm:gap-3 sm:p-2 bg-white/14 backdrop-blur-xl border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.16),0_4px_12px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.28)] scale-100";
      }
    },
    { passive: true }
  );

  // 4. Format Harga (Sesuai aslinya di data/menu.ts)
  function formatPrice(price) {
    return "Rp " + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  // 5. Load Data Menu dari SQLite API / data/menu.json
  async function loadMenuData() {
    let json = null;
    try {
      // Coba ambil dari endpoint backend SQLite
      const res = await fetch("/api/menu", { cache: "no-store" });
      if (res.ok) {
        json = await res.json();
      }
    } catch {
      // Fallback ke file menu.json statis jika dibuka langsung
    }

    if (!json || !json.data) {
      try {
        const res2 = await fetch("data/menu.json");
        json = await res2.json();
      } catch (err) {
        console.error("Gagal memuat menu:", err);
      }
    }

    if (json && json.data) {
      menus = json.data;
      categories = Array.isArray(json.kategori) ? json.kategori.map((k) => k.nama) : [];
      activeCategory = categories[0] || "";
      renderCategories();
      renderMenu();
    } else {
      const grid = document.getElementById("menu-grid");
      grid.innerHTML = `
        <div class="col-span-2 sm:col-span-2 lg:col-span-3 xl:col-span-4 rounded-2xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-black/5">
          <div class="mx-auto max-w-sm">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef6fb] text-xl font-bold text-[#0061a6]">—</div>
            <h3 class="mt-4 text-sm font-bold text-[#1f2937]">Menu belum bisa dimuat</h3>
            <p class="mt-1 text-sm text-[#6b7280]">Periksa koneksi lalu muat ulang halaman.</p>
          </div>
        </div>
      `;
    }

    // Cek juga setting room chat jika ada
    fetch("/api/setting/chat")
      .then((r) => r.json())
      .then((c) => {
        if (c?.url) renderChatRoomCTA(c.url);
      })
      .catch(() => {});
  }

  // 6. Render Tombol Kategori
  const categoryContainer = document.getElementById("category-container");
  function renderCategories() {
    categoryContainer.innerHTML = "";
    categories.forEach((cat) => {
      const isActive = cat === activeCategory;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", isActive);
      btn.className = `shrink-0 rounded-full px-4 py-2 text-xs font-bold tracking-wide transition active:scale-[0.97] sm:px-5 sm:py-2.5 sm:text-sm ${
        isActive
          ? "bg-[#0061a6] text-white shadow-md"
          : "bg-white text-[#1f2937] border border-black/5 shadow-sm hover:bg-white"
      }`;
      btn.textContent = cat;
      btn.addEventListener("click", () => {
        activeCategory = cat;
        renderCategories();
        renderMenu();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      categoryContainer.appendChild(btn);
    });
  }

  // 7. Render Grid Menu (Persis MenuCard.tsx)
  const menuGrid = document.getElementById("menu-grid");
  function renderMenu() {
    const filtered = menus.filter((item) => {
      if (!activeCategory) return true;
      if (Array.isArray(item.kategoris) && item.kategoris.length > 0) {
        return item.kategoris.some((k) => k.nama === activeCategory);
      }
      return item.category === activeCategory;
    });

    if (filtered.length === 0) {
      menuGrid.innerHTML = `
        <div class="col-span-2 sm:col-span-2 lg:col-span-3 xl:col-span-4 rounded-2xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-black/5">
          <div class="mx-auto max-w-sm">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef6fb] text-xl font-bold text-[#0061a6]">—</div>
            <h3 class="mt-4 text-sm font-bold text-[#1f2937]">Menu tidak ditemukan</h3>
            <p class="mt-1 text-sm text-[#6b7280]">Coba pilih kategori lain.</p>
          </div>
        </div>
      `;
      return;
    }

    menuGrid.innerHTML = "";
    filtered.forEach((item) => {
      const qty = getQty(item.id);
      const isLongName = item.name.length > 16;
      const article = document.createElement("article");
      article.className = "flex flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04]";

      article.innerHTML = `
        <div class="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
          ${
            item.image
              ? `<img src="${item.image}" alt="${item.name}" class="h-full w-full object-cover" onerror="this.outerHTML='<div class=\\'absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-100 text-neutral-400\\'><i data-lucide=\\'image\\' class=\\'w-7 h-7 text-neutral-300\\'></i><span class=\\'text-[11px] font-medium\\'>Foto belum tersedia</span></div>'; lucide.createIcons();" />`
              : `<div class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-100 text-neutral-400">
                  <i data-lucide="image" class="w-7 h-7 text-neutral-300"></i>
                  <span class="text-[11px] font-medium">Foto belum tersedia</span>
                </div>`
          }
        </div>
        <div class="flex flex-1 flex-col px-3.5 py-3.5">
          <div class="w-full overflow-hidden whitespace-nowrap text-[13px] font-bold leading-tight text-[#1f2937] sm:text-[14px]" title="${item.name}">
            ${
              isLongName
                ? `<div class="flex w-max animate-[menuMarquee_10s_linear_infinite]" style="animation-duration: ${Math.max(6, item.name.length * 0.35)}s">
                    <span class="pr-10">${item.name}</span>
                    <span aria-hidden="true" class="pr-10">${item.name}</span>
                  </div>`
                : `<span class="block truncate">${item.name}</span>`
            }
          </div>
          <p class="mt-1 line-clamp-2 min-h-[36px] text-[12px] leading-4 text-[#6b7280] sm:text-[13px]">
            ${item.description || ""}
          </p>
          <p class="mt-2 text-[13px] font-extrabold text-[#0061a6] sm:text-[14px]">
            ${formatPrice(item.price)}
          </p>
          <div class="mt-3 action-slot" data-id="${item.id}">
            ${
              qty === 0
                ? `<button type="button" data-act="add" aria-label="Catat ${item.name}" class="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#0061a6] px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#00548f] active:scale-[0.97]">
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    Catat
                  </button>`
                : `<div class="inline-flex w-full items-center justify-between gap-1 rounded-full bg-[#0061a6] p-1 text-white">
                    <button type="button" data-act="dec" aria-label="Kurangi ${item.name}" class="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 active:scale-95">
                      <i data-lucide="minus" class="w-3.5 h-3.5"></i>
                    </button>
                    <span class="min-w-6 text-center text-sm font-bold">${qty}</span>
                    <button type="button" data-act="inc" aria-label="Tambah ${item.name}" class="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0061a6] hover:bg-white/90 active:scale-95">
                      <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                    </button>
                  </div>`
            }
          </div>
        </div>
      `;

      // Event listener tombol Catat & Stepper +/-
      const slot = article.querySelector(".action-slot");
      slot.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-act]");
        if (!btn) return;
        const act = btn.dataset.act;
        if (act === "add") addToBucket(item);
        if (act === "inc") incQty(item.id);
        if (act === "dec") decQty(item.id);
      });

      menuGrid.appendChild(article);
    });

    if (window.lucide) lucide.createIcons();
  }

  // 8. Logika Catatan / Bucket
  function getQty(id) {
    const found = bucket.find((b) => b.item.id === id);
    return found ? found.qty : 0;
  }

  function addToBucket(item) {
    const found = bucket.find((b) => b.item.id === item.id);
    if (found) {
      found.qty += 1;
    } else {
      bucket.push({ item, qty: 1, note: "" });
    }
    updateBucketBadge();
    renderMenu();
  }

  function incQty(id) {
    const found = bucket.find((b) => b.item.id === id);
    if (found) found.qty += 1;
    updateBucketBadge();
    renderMenu();
    if (!drawerOverlay.classList.contains("hidden")) renderDrawer();
  }

  function decQty(id) {
    const found = bucket.find((b) => b.item.id === id);
    if (!found) return;
    if (found.qty <= 1) {
      bucket = bucket.filter((b) => b.item.id !== id);
    } else {
      found.qty -= 1;
    }
    updateBucketBadge();
    renderMenu();
    if (!drawerOverlay.classList.contains("hidden")) renderDrawer();
  }

  function removeBucket(id) {
    bucket = bucket.filter((b) => b.item.id !== id);
    updateBucketBadge();
    renderMenu();
    renderDrawer();
  }

  function clearBucket() {
    bucket = [];
    updateBucketBadge();
    renderMenu();
    renderDrawer();
  }

  function updateBucketBadge() {
    const total = bucket.reduce((s, b) => s + b.qty, 0);
    const badge = document.getElementById("bucket-badge");
    badge.textContent = total;
    if (total > 0) {
      badge.classList.remove("hidden");
    } else {
      badge.classList.add("hidden");
    }
  }

  // 9. Drawer Catatan Pesanan (Persis BucketDrawer.tsx)
  const drawerOverlay = document.getElementById("bucket-drawer-overlay");
  const drawerBackdrop = document.getElementById("bucket-drawer-backdrop");
  const drawerCloseBtn = document.getElementById("bucket-drawer-close");
  const drawerBody = document.getElementById("bucket-drawer-body");
  const drawerFooter = document.getElementById("bucket-drawer-footer");
  const openBucketBtn = document.getElementById("open-bucket-btn");

  function openDrawer() {
    drawerOverlay.classList.remove("hidden");
    drawerOverlay.classList.add("flex");
    document.body.style.overflow = "hidden";
    renderDrawer();
  }

  function closeDrawer() {
    drawerOverlay.classList.add("hidden");
    drawerOverlay.classList.remove("flex");
    document.body.style.overflow = "";
  }

  openBucketBtn.addEventListener("click", openDrawer);
  drawerBackdrop.addEventListener("click", closeDrawer);
  drawerCloseBtn.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !drawerOverlay.classList.contains("hidden")) {
      closeDrawer();
    }
  });

  function renderDrawer() {
    const totalQty = bucket.reduce((s, b) => s + b.qty, 0);
    const totalPrice = bucket.reduce((s, b) => s + b.item.price * b.qty, 0);

    document.getElementById("drawer-total-count").textContent = `${totalQty} item`;

    if (bucket.length === 0) {
      drawerBody.innerHTML = `
        <div class="pointer-events-none mb-3 flex justify-center">
          <div class="relative">
            <img src="monster-notes.webp" alt="Monster notes" width="140" height="90" class="h-auto w-[140px] object-contain drop-shadow-sm" />
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#0061a6] shadow ring-1 ring-black/5">
              MONSTER NOTES
            </div>
          </div>
        </div>
        <div class="flex flex-col items-center justify-center py-10 text-center">
          <div class="rounded-2xl bg-white/90 px-6 py-8 shadow-sm ring-1 ring-black/5 backdrop-blur">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef6fb] text-[#0061a6]">
              <i data-lucide="shopping-bag" class="w-5 h-5"></i>
            </div>
            <h3 class="mt-3 text-sm font-bold text-[#1f2937]">Kertas masih kosong</h3>
            <p class="mt-1 max-w-[260px] text-sm leading-5 text-[#6b7280]">
              Tap <span class="font-semibold text-[#0061a6]">Catat</span> untuk menambahkan menu ke catatan.
            </p>
          </div>
        </div>
      `;
      drawerFooter.innerHTML = "";
      if (window.lucide) lucide.createIcons();
      return;
    }

    let itemsHtml = `
      <div class="pointer-events-none mb-3 flex justify-center">
        <div class="relative">
          <img src="monster-notes.webp" alt="Monster notes" width="140" height="90" class="h-auto w-[140px] object-contain drop-shadow-sm" />
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#0061a6] shadow ring-1 ring-black/5">
            MONSTER NOTES
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-4">
    `;

    bucket.forEach(({ item, qty, note }) => {
      itemsHtml += `
        <div class="relative rounded-xl bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.06)] ring-1 ring-black/5" data-card-id="${item.id}">
          <!-- Selotip kuning lucu -->
          <div class="absolute -top-2 left-1/2 h-4 w-14 -translate-x-1/2 rotate-[-2deg] rounded-sm bg-amber-200/70 shadow-sm ring-1 ring-amber-300/30"></div>
          
          <div class="flex items-start justify-between gap-3 pt-1">
            <div class="min-w-0">
              <h3 class="text-sm font-bold leading-tight text-[#1f2937]">${item.name}</h3>
              <p class="text-xs text-[#6b7280]">${formatPrice(item.price)} / pcs</p>
            </div>
            <button type="button" data-drawer-act="remove" aria-label="Hapus ${item.name}" class="shrink-0 rounded-full bg-neutral-100 p-1.5 text-[#6b7280] hover:bg-neutral-200">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>

          <div class="mt-3 flex items-center justify-between">
            <div class="inline-flex items-center gap-1 rounded-full bg-[#f1f5f9] p-1">
              <button type="button" data-drawer-act="dec" aria-label="Kurangi ${item.name}" class="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5 hover:bg-neutral-50">
                <i data-lucide="minus" class="w-3.5 h-3.5"></i>
              </button>
              <span class="min-w-7 text-center text-sm font-bold text-[#1f2937]">${qty}</span>
              <button type="button" data-drawer-act="inc" aria-label="Catat ${item.name}" class="flex h-7 w-7 items-center justify-center rounded-full bg-[#0061a6] text-white hover:bg-[#00548f]">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              </button>
            </div>
            <span class="text-sm font-extrabold text-[#0061a6]">${formatPrice(item.price * qty)}</span>
          </div>

          <label class="mt-3 block">
            <span class="flex items-center gap-1.5 text-xs font-medium text-[#6b7280]">
              <span class="h-1.5 w-1.5 rounded-full bg-amber-400"></span> Catatan
            </span>
            <input
              type="text"
              value="${note || ""}"
              data-note-input="${item.id}"
              placeholder="Contoh: tidak pedas, es sedikit..."
              class="mt-1 w-full rounded-lg border border-amber-200/50 bg-amber-50/50 px-3 py-2.5 text-sm text-[#1f2937] placeholder:text-[#9ca3af] outline-none focus:border-[#0061a6]/30 focus:bg-white focus:ring-4 focus:ring-[#0061a6]/10"
              style="background-image: repeating-linear-gradient(transparent, transparent 27px, #fde68a 27px, #fde68a 28px); background-size: 100% 28px;"
            />
          </label>
        </div>
      `;
    });

    itemsHtml += `
        <div class="flex justify-center pt-2 opacity-80">
          <img src="monster-notes.webp" alt="" width="90" height="60" class="h-auto w-[90px] object-contain" />
        </div>
      </div>
    `;

    drawerBody.innerHTML = itemsHtml;

    // Footer
    drawerFooter.innerHTML = `
      <div class="border-t border-black/5 bg-white px-5 py-4">
        <div class="flex items-center justify-between text-sm">
          <span class="text-[#6b7280]">Total (${totalQty} item)</span>
          <span class="text-base font-extrabold text-[#0061a6]">${formatPrice(totalPrice)}</span>
        </div>
        <p class="mt-1 text-xs text-[#9ca3af]">
          Harga belum termasuk PPN 10% • konfirmasi saat pemesanan.
        </p>
        <div class="mt-3 flex gap-2">
          <button id="drawer-clear-btn" type="button" class="flex-1 rounded-full border border-black/10 bg-white py-3 text-sm font-semibold text-[#1f2937] hover:bg-neutral-50">
            Kosongkan
          </button>
          <button id="drawer-close-btn2" type="button" class="flex-1 rounded-full bg-[#0061a6] py-3 text-sm font-bold text-white hover:bg-[#00548f]">
            Tutup
          </button>
        </div>
      </div>
    `;

    // Event listener tombol dalam kartu catatan
    drawerBody.querySelectorAll("[data-card-id]").forEach((card) => {
      const id = card.dataset.cardId;
      card.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-drawer-act]");
        if (!btn) return;
        const act = btn.dataset.drawerAct;
        if (act === "inc") incQty(id);
        if (act === "dec") decQty(id);
        if (act === "remove") removeBucket(id);
      });

      const input = card.querySelector(`[data-note-input="${id}"]`);
      if (input) {
        input.addEventListener("input", (e) => {
          const found = bucket.find((b) => b.item.id === id);
          if (found) found.note = e.target.value;
        });
      }
    });

    document.getElementById("drawer-clear-btn")?.addEventListener("click", clearBucket);
    document.getElementById("drawer-close-btn2")?.addEventListener("click", closeDrawer);

    if (window.lucide) lucide.createIcons();
  }

  // 10. Chat Room CTA (jika ada url chat room)
  function renderChatRoomCTA(chatUrl) {
    const slot = document.getElementById("chat-room-slot");
    if (!slot) return;
    slot.innerHTML = `
      <div class="relative mb-5 overflow-hidden rounded-[24px] bg-[#FFD23F] shadow-[0_10px_0_rgba(0,0,0,0.12),0_16px_32px_rgba(0,0,0,0.18)] ring-2 ring-white/60">
        <svg class="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 400 140" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path d="M-20 110 C 40 60, 90 150, 160 100 S 250 40, 300 90" fill="none" stroke="#FFB300" stroke-width="26" stroke-linecap="round" opacity="0.55" />
          <circle cx="360" cy="20" r="46" fill="#FFE680" />
          <circle cx="300" cy="150" r="54" fill="#FFB300" opacity="0.45" />
          <path d="M-10 18 C 30 -6, 60 40, 100 14 S 160 -4, 190 22" fill="none" stroke="#0061a6" stroke-width="3" stroke-linecap="round" opacity="0.28" />
          <path d="M200 128 q 10 -14 20 0 t 20 0 t 20 0" fill="none" stroke="#0061a6" stroke-width="3" stroke-linecap="round" opacity="0.35" />
          <g fill="#ffffff" opacity="0.85">
            <circle cx="232" cy="26" r="4" />
            <circle cx="250" cy="44" r="2.5" />
          </g>
          <path d="M268 20 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" fill="#ffffff" opacity="0.9" />
          <path d="M150 20 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#0061a6" opacity="0.35" />
        </svg>

        <div class="relative flex min-h-[132px] items-center gap-3 py-4 pl-4 pr-[132px] sm:min-h-[148px] sm:pl-6 sm:pr-[200px]">
          <div class="min-w-0">
            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-[#0061a6]/70">Monster Room</p>
            <h3 class="mt-0.5 text-base font-black leading-tight text-[#0b2a4a] sm:text-lg">Ingin request lagu/menyampaikan pesan?</h3>
            <a href="${chatUrl}" target="_blank" rel="noopener noreferrer" class="mt-3 inline-flex items-center gap-2 rounded-full bg-[#0061a6] px-4 py-2.5 text-sm font-bold text-white shadow-[0_4px_0_#003f6e] transition-[transform,box-shadow] hover:bg-[#00548f] active:translate-y-[2px] active:shadow-[0_2px_0_#003f6e] sm:px-5">
              <i data-lucide="message-circle" class="w-4 h-4 shrink-0"></i>
              Masuk ke room chat
            </a>
          </div>
        </div>

        <div class="pointer-events-none absolute -bottom-1 right-1 w-[128px] sm:right-3 sm:w-[190px]">
          <img src="mascot.webp" alt="Mascot" class="w-full drop-shadow-[0_6px_10px_rgba(0,0,0,0.18)]" />
        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  }

  // Jalankan inisialisasi menu
  loadMenuData();
})();
