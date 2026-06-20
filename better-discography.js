(function BetterDiscography() {

    const DiscographyFilter = {

        // ------------------------------------------------------------
        // Category detection
        // ------------------------------------------------------------
        detectCategory(metaText) {
            if (!metaText) return null;
            if (metaText.includes("compilation")) return "Compilation";
            if (metaText.includes("album")) return "Album";
            if (metaText.includes("ep")) return "EP";
            if (metaText.includes("single")) return "Single";
            return null;
        },

        // ------------------------------------------------------------
        // First‑album placeholder handling
        // ------------------------------------------------------------
        fixFirstAlbumClass() {
            const headers = [...document.querySelectorAll("div.artist-artistDiscography-headerContainer")];

            headers.forEach(el => el.classList.remove("artist-artistDiscography-firstAlbum"));

            const firstVisibleHeader = headers.find(el => el.style.display !== "none");

            if (firstVisibleHeader) {
                firstVisibleHeader.classList.add("artist-artistDiscography-firstAlbum");
                this.restoreDummy(firstVisibleHeader);
                return;
            }

            const firstHeader = headers[0];
            if (firstHeader) this.makeDummy(firstHeader);
        },

        makeDummy(header) {
            header.style.display = "";
            header.classList.add("artist-artistDiscography-firstAlbum", "discography-empty-header");

            [...header.children].forEach(child => {
                child.style.visibility = "hidden";
                child.style.pointerEvents = "none";
            });

            const tracklist = header.nextElementSibling;
            if (tracklist?.classList.contains("artist-artistDiscography-tracklist")) {
                tracklist.style.display = "none";
            }
        },

        restoreDummy(header) {
            if (!header.classList.contains("discography-empty-header")) return;

            header.classList.remove("discography-empty-header");

            [...header.children].forEach(child => {
                child.style.visibility = "";
                child.style.pointerEvents = "";
            });
        },

        // ------------------------------------------------------------
        // Dropdown creation
        // ------------------------------------------------------------
        createDropdown() {
            const wrapper = document.createElement("div");
            wrapper.className = "discography-filter";

            wrapper.innerHTML = `
                <button class="filter-toggle e-10451-legacy-button e-10451-legacy-button-tertiary e-10451-button-tertiary--small encore-text-body-small-bold" aria-expanded="false">
                    All
                    <svg class="chevron" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"/></svg>
                </button>

                <div class="filter-panel" hidden>
                    <label class="filter-option">
                        <input type="checkbox" value="Compilation" checked>
                        <span>Compilations</span>
                    </label>

                    <label class="filter-option">
                        <input type="checkbox" value="Album" checked>
                        <span>Albums</span>
                    </label>

                    <label class="filter-option">
                        <input type="checkbox" value="EP" checked>
                        <span>EPs</span>
                    </label>

                    <label class="filter-option">
                        <input type="checkbox" value="Single" checked>
                        <span>Singles</span>
                    </label>
                </div>
            `;

            return wrapper;
        },

        // ------------------------------------------------------------
        // Dropdown behavior
        // ------------------------------------------------------------
        activateDropdown(root) {
            const toggle = root.querySelector(".filter-toggle");
            const panel = root.querySelector(".filter-panel");

            toggle.addEventListener("click", () => {
                const expanded = toggle.getAttribute("aria-expanded") === "true";
                toggle.setAttribute("aria-expanded", !expanded);
                panel.hidden = expanded;
            });

            document.addEventListener("click", e => {
                if (!root.contains(e.target)) {
                    panel.hidden = true;
                    toggle.setAttribute("aria-expanded", false);
                }
            });

            root.querySelectorAll("input[type=checkbox]").forEach(input => {
                input.addEventListener("change", () => {
                    this.applyFilters();
                    this.updateButtonLabel();

                    const checked = [...root.querySelectorAll("input[type=checkbox]")]
                        .filter(c => c.checked)
                        .map(c => c.value);

                    sessionStorage.setItem("discographyFilter", JSON.stringify(checked));
                });
            });
        },

        updateButtonLabel() {
            const btn = document.querySelector(".filter-toggle");
            if (!btn) return;

            const svg = btn.querySelector("svg");
            if (!svg) return;

            const checked = [...document.querySelectorAll(".filter-option input:checked")]
                .map(cb => cb.value);

            const plural = {
                Compilation: "Compilations",
                Album: "Albums",
                EP: "EPs",
                Single: "Singles"
            };

            let label =
                checked.length === 0 ? "None" :
                checked.length === 4 ? "All" :
                checked.map(v => plural[v]).join(", ");

            btn.innerHTML = `${label} ${svg.outerHTML}`;
        },

        // ------------------------------------------------------------
        // Filtering logic
        // ------------------------------------------------------------
        applyFilters() {
            const active = [...document.querySelectorAll(".filter-option input:checked")]
                .map(i => i.value);

            const headers = document.querySelectorAll("div.artist-artistDiscography-headerContainer");
            const cards = document.querySelectorAll(".main-card-cardContainer.Card")

            if (active.length === 4) {
                headers.forEach(header => {
                    header.style.display = "";
                    const tracklist = header.nextElementSibling;
                    if (tracklist?.classList.contains("artist-artistDiscography-tracklist")) {
                        tracklist.style.display = "";
                    }
                });

                cards.forEach(card => {
                    card.style.display = "";
                });

                this.fixFirstAlbumClass();
                return;
            }

            // LIST VIEW
            headers.forEach(header => {
                const metaText = header.querySelector(".main-entityHeader-metaData")?.innerText.toLowerCase() || "";
                const category = this.detectCategory(metaText);
                const show = active.includes(category);

                header.style.display = show ? "" : "none";

                const tracklist = header.nextElementSibling;
                if (tracklist?.classList.contains("artist-artistDiscography-tracklist")) {
                    tracklist.style.display = show ? "" : "none";
                }
            });
            
            // GRID VIEW
            cards.forEach(card => {
                const metaText = card.querySelector(".main-card-cardMetadata")?.innerText.toLowerCase() || "";
                const category = this.detectCategory(metaText);
                
                card.style.display = active.includes(category) ? "" : "none";
            });

            this.fixFirstAlbumClass();
        },

        // ------------------------------------------------------------
        // Page detection
        // ------------------------------------------------------------
        isDiscographyPage() {
            if (document.querySelector(".artist-artistDiscography-topBar")) return true;
            if (document.querySelector('.main-shelf-shelf[aria-label$=" - Discography"]')) return true;

            return [...document.querySelectorAll("section[aria-label]")]
                .some(sec => sec.getAttribute("aria-label").endsWith(" - Discography"));
        },

        // ------------------------------------------------------------
        // Dropdown injection
        // ------------------------------------------------------------

        injectDropdown() {
            const topBar = document.querySelector(".artist-artistDiscography-topBar");
            if (!topBar) return;

            if (topBar.querySelector(".discography-filter")) return;

            const dropdown = this.createDropdown();
            const sortButton = topBar.querySelector('[data-encore-id="buttonTertiary"]');

            if (sortButton) {
                sortButton.insertAdjacentElement("beforebegin", dropdown);
            } else {
                topBar.appendChild(dropdown);
            }

            this.activateDropdown(dropdown);

            const saved = sessionStorage.getItem("discographyFilter");
            if (saved) {
                const values = JSON.parse(saved);
                dropdown.querySelectorAll("input[type=checkbox]").forEach(cb => {
                    cb.checked = values.includes(cb.value);
                });
                this.updateButtonLabel();
            }
        },

        // ------------------------------------------------------------
        // Misc UI cleanup
        // ------------------------------------------------------------
        simplifyHomeChips() {
            const chipRow = document.querySelector('.x2wL3XqjocqwfUGR');
            if (!chipRow) return;

            const homeDiscographySection = document.querySelector('section[aria-label="Discography"]');
            if (!homeDiscographySection) return;

            const popularChip = [...chipRow.querySelectorAll('button')]
                .find(btn => btn.textContent.trim().toLowerCase().includes("popular"));

            if (!popularChip) return;

            [...chipRow.querySelectorAll('button')].forEach(btn => {
                if (btn !== popularChip) btn.remove();
            });

            const text = document.createElement("span");
            text.className = "artist-home-popular-label";
            text.textContent = popularChip.textContent.trim();

            popularChip.replaceWith(text);
        },

        removeBuiltInFilters() {
            const topBar = document.querySelector(".artist-artistDiscography-topBar");
            if (!topBar) return;

            topBar.querySelectorAll(".x-sortBox-sortDropdown").forEach(el => el.remove());
        }
    };

    // ------------------------------------------------------------
    // MutationObserver
    // ------------------------------------------------------------
    let moTimeout = null;

    const observer = new MutationObserver(() => {
        clearTimeout(moTimeout);
        moTimeout = setTimeout(() => {
            DiscographyFilter.simplifyHomeChips();
            if (DiscographyFilter.isDiscographyPage()) {
                DiscographyFilter.applyFilters();
                DiscographyFilter.removeBuiltInFilters();
                DiscographyFilter.injectDropdown();
            }
        }, 30);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // ------------------------------------------------------------
    // CSS
    // ------------------------------------------------------------
    const style = document.createElement("style");
    style.textContent = `
        .discography-filter {
            position: relative;
            display: inline-flex;
            align-items: center;
            margin-right: 12px;
        }

        .filter-toggle {
            background: transparent;
            border: none;
            color: white;
            font-size: 14px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .filter-panel {
            position: absolute;
            top: calc(100% + 4px);
            right: 0;
            left: auto;
            background: #181818;
            border: 1px solid #333;
            border-radius: 6px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            z-index: 9999;
            opacity: 0;
            transform: translateY(-4px);
            transition: opacity .15s ease, transform .15s ease;
        }

        .filter-panel:not([hidden]) {
            opacity: 1;
            transform: translateY(0);
        }

        .filter-option {
            display: flex;
            align-items: center;
            gap: 8px;
            color: white;
            font-size: 14px;
        }

        .filter-toggle .chevron {
            width: 12px;
            height: 12px;
            fill: currentColor;
            stroke: currentColor;
        }
    `;
    document.head.appendChild(style);

})();