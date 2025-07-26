class MediaBrowserCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    this._config = config || {};
    this._title = this._config.title || "Media Browser";
    this._entity = this._config.entity || "browser";
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._browser) {
      this._browser.hass = hass;
    }
  }

  render() {
    if (!this.shadowRoot) return;
    const style = document.createElement("style");
    style.textContent = `
      ha-card {
        padding: 0;
      }
    `;
    this.shadowRoot.innerHTML = `
      <ha-card header="${this._title}">
        <ha-media-player-browse></ha-media-player-browse>
      </ha-card>
    `;
    this.shadowRoot.appendChild(style);
    this._browser = this.shadowRoot.querySelector("ha-media-player-browse");
    if (this._browser) {
      this._browser.hass = this._hass;
      if (this._entity) {
        this._browser.entityId = this._entity;
      }
    }
  }

  getCardSize() {
    return 8;
  }
}
customElements.define("media-browser-card", MediaBrowserCard);
