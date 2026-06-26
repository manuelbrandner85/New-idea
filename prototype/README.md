# Klar – Klickbarer Prototyp (PWA)

Ein funktionsfähiger, klickbarer Prototyp der Startseite und der Kernabläufe von
**Klar**. Gebaut als **Progressive Web App** ohne Build-Schritt – ein Code für
Smartphone, Tablet und PC.

## Starten

**Einfach öffnen:** `index.html` im Browser öffnen.

Für die volle PWA-Funktion (installierbar, offline, Service Worker) über einen
lokalen Server starten:

```bash
cd prototype
python3 -m http.server 8000
# dann im Browser öffnen:  http://localhost:8000
```

Auf dem Smartphone/Desktop kann die Seite über das Browser-Menü
**„Zum Startbildschirm hinzufügen" / „App installieren"** installiert werden.

## Was funktioniert (echt, nicht nur Mockup)

- 👋 **Onboarding** – sanfter erster Start: Begrüßung, Name, Schriftgröße,
  optionale Vertrauensperson, Erfolgsabschluss (wird gespeichert; in den
  Einstellungen erneut startbar).
- 🔊 **Vorlesen** – liest jede Seite per Web Speech API vor (deutsche Stimme).
- 🅰️ **Schriftgröße** – drei Stufen, oben rechts umschaltbar, wird gespeichert.
- 🗣️ **Klara** – Beispiel-Fragen **und** freie Eingabe per Text oder Mikrofon
  (Spracheingabe, wo der Browser sie unterstützt). Antworten im Prototyp über
  einfache Stichwort-Erkennung.
- ✉️ **Brief erklären** – simulierte Brieferklärung in 3 einfachen Sätzen.
- 🛡️ **Betrug prüfen** – Ampel-Bewertung (🟢/🟡/🔴) für Beispiel-Nachrichten.
- 📄 **Formular ausfüllen** – Schritt-für-Schritt-Dialog bis zur Erfolgsmeldung.
- ⏰ **Erinnerungen** – Übersicht mit Fristen und Terminen.
- 📚 **Anleitungen** – bebilderte Schritt-für-Schritt-Hilfe.
- ❓ **Hilfe** – drei Wege zur Hilfe (Klara, Anleitung, Vertrauensperson).
- 📴 **Offline** – funktioniert dank Service Worker auch ohne Internet.

## Bewusst simuliert (im Prototyp)

Kamera/Foto-Upload, **echte KI-Antworten**, PDF-Export, SMS/Anruf-Erinnerungen und
Konto/Login sind als Platzhalter angedeutet. Diese Funktionen kommen im echten
Produkt über die in [`../docs/KONZEPT.md`](../docs/KONZEPT.md) beschriebene
Architektur (KI-Schicht, OCR, TTS/STT, Benachrichtigungen) hinzu.

> **Hinweis zu echter KI:** Ein API-Schlüssel darf nie im Browser-Code stehen, da
> er sonst öffentlich sichtbar wäre. Echte KI-Antworten (für Klara und die
> Brieferklärung) laufen daher über einen kleinen Server-Endpunkt (z. B. eine
> serverlose Funktion), der die Anfrage an das Sprachmodell weiterleitet. Der
> Prototyp nutzt stattdessen vorbereitete Antworten, damit er ohne Backend sofort
> testbar ist.

## Aufbau

| Datei | Zweck |
|-------|-------|
| `index.html` | App-Rahmen: Kopfzeile, Inhaltsbereich, untere Navigation |
| `styles.css` | Designsystem als CSS (Farben, Schrift, Komponenten) |
| `app.js` | Bildschirm-Router, Vorlesen, Schriftgröße, alle Abläufe |
| `manifest.webmanifest` | PWA-Manifest (Name, Icon, Farben) |
| `sw.js` | Service Worker für Offline-Fähigkeit |
| `icon.svg` | App-Icon |

Das Designsystem folgt [`../docs/DESIGNSYSTEM.md`](../docs/DESIGNSYSTEM.md),
das Layout dem Wireframe in [`../docs/WIREFRAME-STARTSEITE.md`](../docs/WIREFRAME-STARTSEITE.md).
