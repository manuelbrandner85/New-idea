# Wireframe – Startseite

Die Startseite ist das Herz von **Klar**. Sie folgt der Regel: *eine Sache pro Blick,
alles Wichtige ohne Scrollen erreichbar, immer Hilfe in Reichweite.*

---

## 1. Smartphone (Hochformat)

```
┌───────────────────────────────┐
│ ☰   Klar             🔊 Aa ⚙️ │   Kopfzeile: Menü · Logo · Vorlesen · Schrift · Einstellungen
├───────────────────────────────┤
│                               │
│   Hallo Helga 👋              │   Persönliche, warme Begrüßung
│   Wie kann ich dir helfen?    │
│                               │
│  ┌─────────────────────────┐  │
│  │        🗣️               │  │
│  │   Mit Klara sprechen    │  │   HAUPTKNOPF (KI-Assistent), volle Breite, sehr groß
│  │   Stell mir eine Frage  │  │
│  └─────────────────────────┘  │
│                               │
│  ┌───────────┐ ┌───────────┐  │
│  │    ✉️     │ │    📄     │  │
│  │  Brief    │ │ Formular  │  │   Zwei große Kacheln
│  │  erklären │ │ ausfüllen │  │
│  └───────────┘ └───────────┘  │
│                               │
│  ┌───────────┐ ┌───────────┐  │
│  │    🛡️     │ │    ⏰     │  │
│  │  Betrug   │ │ Erinne-   │  │   Zwei große Kacheln
│  │  prüfen   │ │ rungen    │  │
│  └───────────┘ └───────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │ 📌 Nächste Erinnerung    │  │   Kontext-Karte: nur wenn relevant
│  │ Wohngeld-Antrag: 10.07. │  │
│  └─────────────────────────┘  │
│                               │
├───────────────────────────────┤
│  🏠     🗣️     📚     ❓      │   Feste untere Navigation
│ Start  Klara Anleit. Hilfe   │   (Symbol + Wort, immer sichtbar)
└───────────────────────────────┘
```

### Erklärungen
- **Kopfzeile**: enthält die drei Komfort-Schalter, die immer erreichbar sind –
  *Vorlesen* (🔊), *Schriftgröße* (Aa), *Einstellungen* (⚙️).
- **Begrüßung**: persönlich mit Namen, reduziert Anonymität und Angst.
- **Hauptknopf „Mit Klara sprechen"**: der direkteste Weg zur Hilfe – für Menschen,
  die nicht wissen, wo sie anfangen sollen. Funktioniert per Sprache und Text.
- **Vier Kernkacheln**: die häufigsten konkreten Aufgaben, je mit Symbol + zwei Worten.
- **Kontext-Karte**: zeigt nur dann etwas, wenn es etwas zu zeigen gibt (anstehende
  Frist) – keine leeren Bereiche, keine Reizüberflutung.
- **Untere Navigation**: vier feste Punkte, davon einer immer der echte **Hilfe**-Knopf.

---

## 2. Desktop / Tablet (Querformat)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Klar                                          🔊 Vorlesen  Aa  ⚙️     │
├───────────────┬──────────────────────────────────────────────────────┤
│               │                                                        │
│  🏠 Start     │   Hallo Helga 👋   Wie kann ich dir helfen?           │
│               │                                                        │
│  🗣️ Klara     │   ┌────────────────────────────────────────────────┐ │
│               │   │   🗣️   Mit Klara sprechen – stell mir eine Frage │ │
│  📚 Anleit.   │   └────────────────────────────────────────────────┘ │
│               │                                                        │
│  📁 Meine     │   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│     Sachen    │   │   ✉️         │ │   📄         │ │   🛡️         │  │
│               │   │   Brief      │ │   Formular   │ │   Betrug     │  │
│  ❓ Hilfe     │   │   erklären   │ │   ausfüllen  │ │   prüfen     │  │
│               │   └──────────────┘ └──────────────┘ └──────────────┘  │
│               │                                                        │
│               │   ┌──────────────┐ ┌────────────────────────────────┐ │
│               │   │   ⏰         │ │ 📌 Nächste Erinnerung           │ │
│               │   │   Erinne-    │ │ Wohngeld-Antrag: 10.07.2026     │ │
│               │   │   rungen     │ │ [ Details ansehen ]             │ │
│               │   └──────────────┘ └────────────────────────────────┘ │
│               │                                                        │
└───────────────┴──────────────────────────────────────────────────────┘
```

### Erklärungen
- Auf großen Bildschirmen wandert die Navigation in eine **linke Seitenleiste mit
  Symbol + Wort** – nichts versteckt sich hinter Hamburger-Menüs.
- Die Kacheln verteilen sich in einem ruhigen Raster, der Hauptknopf bleibt oben und
  prominent.
- Mehr Platz wird für **Luft und große Elemente** genutzt, nicht für mehr Inhalte.

---

## 3. Designvorgaben für die Umsetzung

| Element | Vorgabe |
|---------|---------|
| Mindesthöhe Schaltfläche | 64 px (mobil), 72 px Hauptknopf |
| Mindest-Touch-Fläche | 48 × 48 px |
| Grundschrift | 20 px, einstellbar bis 28 px+ |
| Kachel-Beschriftung | Symbol **und** Wort, nie nur Symbol |
| Kontrast | ≥ 7:1 (Text), Ampel zusätzlich mit Symbol+Wort |
| Abstand zwischen Knöpfen | min. 16 px, damit nichts versehentlich getroffen wird |
| Animationen | dezent, abschaltbar; nichts blinkt oder drängt |

---

## 4. Zustände der Startseite

- **Erststart**: zusätzlicher freundlicher Hinweis „Tippe einfach auf einen großen
  Knopf – du kannst nichts kaputt machen."
- **Mit anstehenden Fristen**: Kontext-Karte oben sichtbar.
- **Ohne Aufgaben**: Kontext-Karte ausgeblendet, Fokus auf den Kernkacheln.
- **Sprachmodus aktiv**: großer Mikrofon-Indikator, Klara hört zu und bestätigt
  jeden Schritt akustisch.
