class MediaBrowserCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._path = [];
  }

  setConfig(config) {
    this._config = config || {};
    this._title = this._config.title ?? "";
    this._entities = this._config.entities || [this._config.entity || "browser"];
    this._entity = this._entities[0];
    this._renderBase();
  }

  set hass(hass) {
    this._hass = hass;
    if (this.isConnected && !this._current) {
      this._fetch();
    }
  }

  connectedCallback() {
    if (this._hass && !this._list) {
      this._fetch();
    }
  }

  _renderBase() {
    if (!this.shadowRoot) return;
    const style = document.createElement("style");
    style.textContent = `
      ha-card {
        padding: 0;
      }
      .controls {
        display: flex;
        align-items: center;
      }
      .item {
        padding: 8px;
        cursor: pointer;
      }
      .item:hover {
        background: var(--secondary-background-color);
      }
      .back {
        padding: 8px;
        cursor: pointer;
        font-weight: bold;
      }
      .refresh {
        margin-left: auto;
        padding: 8px;
        cursor: pointer;
      }
      .entity-select {
        margin: 0 8px;
      }
    `;
    const headerAttr = this._title ? ` header="${this._title}"` : "";
    this.shadowRoot.innerHTML = `
      <ha-card${headerAttr}>
        <div class="controls">
          <div class="back" hidden id="back">⬅ Back</div>
          <select id="entity-select" class="entity-select"></select>
          <div class="refresh" id="refresh">⟳ Refresh</div>
        </div>
        <div id="list"></div>
      </ha-card>
    `;
    this.shadowRoot.appendChild(style);
    this._list = this.shadowRoot.getElementById("list");
    this._back = this.shadowRoot.getElementById("back");
    this._refresh = this.shadowRoot.getElementById("refresh");
    this._select = this.shadowRoot.getElementById("entity-select");
    this._back.addEventListener("click", () => this._navigateBack());
    this._refresh.addEventListener("click", () =>
      this._fetch(
        this._current?.media_content_id,
        this._current?.media_content_type
      )
    );
    if (this._select) {
      this._select.innerHTML = "";
      for (const ent of this._entities) {
        const opt = document.createElement("option");
        opt.value = ent;
        opt.textContent = ent;
        this._select.appendChild(opt);
      }
      this._select.value = this._entity;
      this._select.addEventListener("change", () => {
        this._entity = this._select.value;
        this._path = [];
        this._fetch();
      });
    }
  }

  async _fetch(mediaId, mediaType) {
    if (!this._hass) return;
    const data = await this._hass.callWS({
      type:
        this._entity === "browser"
          ? "media_source/browse_media"
          : "media_player/browse_media",
      entity_id: this._entity === "browser" ? undefined : this._entity,
      media_content_id: mediaId,
      media_content_type: mediaType,
    });
    this._current = data;
    this._renderItems(data.children || []);
    if (this._path.length > 0) {
      this._back.removeAttribute("hidden");
    } else {
      this._back.setAttribute("hidden", "");
    }
  }

  _renderItems(items) {
    this._list.innerHTML = "";
    for (const item of items) {
      const div = document.createElement("div");
      div.className = "item";
      div.textContent = item.title;
      div.addEventListener("click", () => {
        if (item.can_expand) {
          this._path.push(this._current);
          this._fetch(item.media_content_id, item.media_content_type);
        } else if (item.can_play && this._entity !== "browser") {
          this._hass.callService("media_player", "play_media", {
            entity_id: this._entity,
            media_content_id: item.media_content_id,
            media_content_type: item.media_content_type,
          });
        }
      });
      this._list.appendChild(div);
    }
  }

  _navigateBack() {
    const prev = this._path.pop();
    if (prev) {
      this._renderItems(prev.children || []);
      if (this._path.length === 0) {
        this._back.setAttribute("hidden", "");
      }
      this._current = prev;
    }
  }

  getCardSize() {
    return 8;
  }

  static getConfigElement() {
    return document.createElement("media-browser-card-editor");
  }

  static getStubConfig() {
    return { title: "Media", entities: ["browser"] };
  }
}
customElements.define("media-browser-card", MediaBrowserCard);

class MediaBrowserCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = { ...config };
    if (this._title) this._title.value = this._config.title || "";
    if (this._entitiesInput)
      this._entitiesInput.value = (this._config.entities || ["browser"]).join(", ");
  }

  connectedCallback() {
    this.innerHTML = `
      <style>
        .card-config {
          padding: 8px;
        }
        .card-config label {
          display: block;
          margin-bottom: 8px;
        }
      </style>
      <div class="card-config">
        <label>
          Title
          <input id="title" type="text" />
        </label>
        <label>
          Entities (comma separated)
          <input id="entities" type="text" placeholder="browser" />
        </label>
      </div>
    `;
    this._title = this.querySelector("#title");
    this._entitiesInput = this.querySelector("#entities");
    this._title.addEventListener("input", () => this._updateConfig());
    this._entitiesInput.addEventListener("input", () => this._updateConfig());
    if (this._config) {
      this._title.value = this._config.title || "";
      this._entitiesInput.value = (this._config.entities || ["browser"]).join(", ");
    }
  }

  _updateConfig() {
    if (!this._config) this._config = {};
    this._config.title = this._title.value;
    this._config.entities = this._entitiesInput.value
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e);
    this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config: this._config } })
    );
  }
}
customElements.define("media-browser-card-editor", MediaBrowserCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "media-browser-card",
  name: "Media Browser Card",
  description: "Browse and play media from your library.",
});
