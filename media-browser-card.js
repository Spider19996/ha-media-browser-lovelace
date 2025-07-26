class MediaBrowserCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._path = [];
  }

  setConfig(config) {
    this._config = config || {};
    this._title = this._config.title || "Media Browser";
    this._entity = this._config.entity || "browser";
    this._renderBase();
  }

  set hass(hass) {
    this._hass = hass;
    if (this.isConnected) {
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
    `;
    this.shadowRoot.innerHTML = `
      <ha-card header="${this._title}">
        <div class="back" hidden id="back">⬅ Back</div>
        <div id="list"></div>
      </ha-card>
    `;
    this.shadowRoot.appendChild(style);
    this._list = this.shadowRoot.getElementById("list");
    this._back = this.shadowRoot.getElementById("back");
    this._back.addEventListener("click", () => this._navigateBack());
  }

  async _fetch(mediaId) {
    if (!this._hass) return;
    const data = await this._hass.callWS({
      type:
        this._entity === "browser"
          ? "media_source/browse_media"
          : "media_player/browse_media",
      entity_id: this._entity === "browser" ? undefined : this._entity,
      media_content_id: mediaId,
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
          this._fetch(item.media_content_id);
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
}
customElements.define("media-browser-card", MediaBrowserCard);
