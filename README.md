# Home Assistant Media Browser Lovelace Card

This repository contains a simple custom card for Home Assistant. The card displays the full content of the Media Browser inside your Lovelace dashboard while keeping the look and feel of the Mushroom theme.

## Installation

### HACS (recommended)

1. Add this repository as a custom repository in HACS (type: Lovelace).
2. Install **Media Browser Card** from the HACS store.

### Manual

1. Copy `media-browser-card.js` to your `config/www` folder in Home Assistant.
2. Add the resource in your dashboard configuration:

```yaml
resources:
  - url: /local/media-browser-card.js
    type: module
```

## Usage

Add the following card configuration to your dashboard:

```yaml
type: custom:media-browser-card
title: Medien
entity: browser
```

`entity` is optional and defaults to `browser`.

The card renders the same folders and media items that you normally see in the Media panel. Because the card uses the built-in Media Browser components, all navigation and playback features work as expected. The surrounding `ha-card` respects your active theme, so it fits nicely when using the Mushroom theme.
