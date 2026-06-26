# Designsystem – Klar

Das Designsystem stellt sicher, dass jede Seite von **Klar** gleich einfach, ruhig und
barrierefrei ist. Es ist für Designer **und** Entwickler geschrieben (inkl. Tokens).

---

## 1. Designprinzipien (kurz)

1. **Eine Sache pro Bildschirm.**
2. **Groß, klar, ruhig.**
3. **Symbol + Wort, nie Symbol allein.**
4. **Immer ein Weg zurück und Hilfe.**
5. **Barrierefreiheit ist Standard, nicht Option.**

---

## 2. Farb-Tokens

```css
:root {
  /* Primär */
  --klar-blue-900: #1B4D7A;  /* Kopfzeile, Hauptknöpfe */
  --klar-blue-500: #3B82C4;  /* aktive Elemente, Links */
  --klar-blue-100: #E3EEF7;  /* sanfte Flächen */

  /* Akzent (Wärme / Klara) */
  --klar-amber-500: #E8A33D;
  --klar-amber-700: #C77800;

  /* Neutral */
  --klar-bg:        #F7F9FB; /* Seitenhintergrund */
  --klar-surface:   #FFFFFF; /* Karten */
  --klar-text:      #1A2733; /* Haupttext, Kontrast >= 12:1 auf weiß */
  --klar-text-soft: #4A5A6A; /* Sekundärtext */
  --klar-border:    #D4DCE4;

  /* Status (Ampel) */
  --klar-safe:    #2E7D4F; /* grün */
  --klar-warn:    #C77800; /* bernstein */
  --klar-danger:  #C0392B; /* rot */
}
```

> **Regel:** Statusfarben werden **immer** mit Symbol *und* Wort kombiniert
> (🟢 Sicher / 🟡 Achtung / 🔴 Gefahr), damit auch Menschen mit Farbsehschwäche sie
> sicher unterscheiden.

---

## 3. Typografie

```css
:root {
  --font-family: "Atkinson Hyperlegible", "Inter", system-ui, sans-serif;

  --font-base:   20px;   /* Standard */
  --font-large:  24px;   /* Nutzer-Einstellung "Größer" */
  --font-xlarge: 28px;   /* Nutzer-Einstellung "Noch größer" */

  --line-height: 1.6;
  --font-weight-normal: 400;
  --font-weight-bold:   700;
}
```

- Überschriften: kurz, konkret („Brief erklären"), nicht dekorativ.
- Fließtext: linksbündig, kurze Zeilen (max. ~60 Zeichen).
- Keine reine Großschreibung in Fließtexten (schlechter lesbar).

---

## 4. Abstände & Raster (8-px-System)

```css
:root {
  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 32px;
  --space-6: 48px;
  --radius:  16px;   /* freundliche, weiche Ecken */
}
```

- Großzügige Abstände zwischen interaktiven Elementen (min. 16 px), damit nichts
  versehentlich getroffen wird.

---

## 5. Komponenten

### 5.1 Hauptknopf (Primary Button)
- Höhe: **72 px** (mobil), volle Breite verfügbar.
- Hintergrund `--klar-blue-900`, Text weiß, Schrift 24 px bold.
- Symbol links, Wort rechts. Deutlicher Fokus-Rahmen für Tastatur.

### 5.2 Kachel (Feature-Tile)
- Mindestgröße: **150 × 150 px** (mobil).
- Großes Symbol oben, ein bis zwei Wörter darunter.
- Weißer Hintergrund, weicher Schatten, klarer Fokuszustand.

### 5.3 Standard-Knopf & „Zurück"
- Höhe: **64 px**.
- „Zurück" immer oben links, mit Pfeil **und** Wort „Zurück".

### 5.4 Ampel-Hinweis (Betrugsprüfung)
- Große farbige Karte mit Symbol, Wort und einer klaren Handlungsanweisung
  („Nicht klicken. Löschen.").

### 5.5 Dialogblase (Klara)
- Klaras Nachrichten in Bernstein-Akzent, Nutzer-Nachrichten in Blau.
- Jede Klara-Nachricht hat einen **Vorlesen**-Knopf.

### 5.6 Vorlesen-Steuerung
- Auf jeder Seite oben verfügbar; liest sichtbaren Inhalt vor.
- Tempo einstellbar (langsam / normal).

---

## 6. Barrierefreiheit (verbindlich)

- **WCAG 2.2 AA** als Mindeststandard, AAA bei Kontrasten wo möglich.
- Vollständige **Tastaturbedienbarkeit** und **Screenreader-Labels**.
- Fokuszustände immer deutlich sichtbar.
- Keine reinen Farb-Informationen (immer Symbol + Text).
- Keine Zeitlimits; Bewegungen reduzierbar (`prefers-reduced-motion`).
- Sprachsteuerung und Vorlesefunktion als gleichwertige Bedienwege.

---

## 7. Bildsprache & Symbole

- Freundliche, klare Symbole mit kräftigen Linien – immer mit Textlabel.
- Bei Anleitungen: **echte Screenshots/Fotos** mit Markierungen (Pfeil, Kreis),
  damit Nutzer Schritte wiedererkennen.
- Menschen auf Bildern: divers und altersgerecht, würdevoll dargestellt.

---

## 8. Tonfall (Microcopy)

| Statt… | Besser… |
|--------|---------|
| „Authentifizierung fehlgeschlagen" | „Das hat nicht geklappt. Versuchen wir es noch einmal." |
| „Bitte verifizieren Sie Ihre Eingabe" | „Schau noch mal: Stimmt das so?" |
| „Upload abgeschlossen" | „Geschafft! Dein Brief ist da." |
| „Ungültiges Format" | „Dieses Bild kann ich nicht lesen. Mach gern ein neues Foto." |

Grundregel: ermutigend, nie Schuld zuweisend, immer mit nächstem konkreten Schritt.
