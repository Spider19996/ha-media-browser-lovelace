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

## Adding via the Lovelace UI

Once the resource is added you can add the card directly through the
"Add Card" dialog. Search for **Media Browser Card** and choose it to open
the configuration dialog. From there you can set the title and the media
player entity without editing YAML.

## Usage

Add the following card configuration to your dashboard:

```yaml
type: custom:media-browser-card
title: Medien
entity: browser
```

`entity` is optional and defaults to `browser`.

The card loads media items from your configured media sources and displays them
inside an `ha-card`. Folders can be opened by clicking on them and playable
items will trigger the `media_player.play_media` service when selected. From
version 1.1 on the card correctly includes `media_content_type` when opening
folders so navigation into subdirectories works reliably. The surrounding
`ha-card` respects your active theme, so it fits nicely when using the Mushroom
theme.
