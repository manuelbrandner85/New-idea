---
name: werbung-aufraeumen
description: >-
  Räumt täglich Werbung und Newsletter im E-Mail-Postfach (Gmail) auf, indem
  Werbe-Mails sicher in den Papierkorb verschoben werden. Verwenden, wenn der
  Nutzer sein Postfach von Werbung befreien, Werbung automatisch löschen lassen
  oder täglich aufräumen möchte ("lösch die Werbung", "räum mein Postfach auf",
  "täglich Werbung entfernen").
---

# Werbung aufräumen

Dieser Skill durchsucht das E-Mail-Postfach nach Werbung und Newslettern und
verschiebt sie **sicher in den Papierkorb** (nicht endgültig löschen). Er ist
für den **täglichen** Einsatz gedacht und arbeitet vorsichtig: Im Zweifel bleibt
eine E-Mail liegen.

> Postfach: Gmail (`brandy13062@gmail.com`). Für andere Anbieter siehe Abschnitt
> „Andere Anbieter“.

---

## Wichtig: Sicherheitsgrundsätze

1. **Niemals endgültig löschen.** Werbung wird nur in den **Papierkorb**
   verschoben. Dort bleibt sie bei Gmail 30 Tage und kann wiederhergestellt
   werden.
2. **Im Zweifel liegen lassen.** Nur Mails entfernen, die eindeutig Werbung sind.
3. **Schutzliste beachten.** Bestimmte Absender und Themen werden nie angefasst
   (siehe „Was niemals gelöscht wird“).
4. **Erst zeigen, dann handeln.** Beim ersten Lauf eine Vorschau geben und
   bestätigen lassen. Danach darf täglich automatisch aufgeräumt werden.
5. **Bericht erstellen.** Nach jedem Lauf kurz melden, was verschoben wurde.

---

## Voraussetzungen (einmalig einrichten)

Damit der Skill auf das Postfach zugreifen kann, ist ein Zugang nötig. Eine
Möglichkeit:

- **Gmail-API** über ein Google-Cloud-Projekt mit OAuth-Zugang (empfohlen,
  feingranular und sicher), oder
- **IMAP** mit einem **App-Passwort** (Google-Konto → Sicherheit → App-Passwörter;
  setzt aktivierte 2-Faktor-Anmeldung voraus).

Die Zugangsdaten gehören in eine sichere Umgebungsvariable / einen Secret-Store,
**niemals** in diese Datei oder ins Repository.

Benötigte Umgebungsvariablen (Beispiel):

```
GMAIL_ADRESSE=brandy13062@gmail.com
GMAIL_APP_PASSWORT=********      # nur bei IMAP
# oder bei Gmail-API:
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
GOOGLE_OAUTH_REFRESH_TOKEN=...
```

---

## Was als Werbung gilt

Eine E-Mail wird als Werbung eingestuft, wenn **mindestens zwei** der folgenden
Merkmale zutreffen:

- Sie liegt in der Gmail-Kategorie **„Werbung“ (Promotions)**.
- Sie enthält einen **Abmelde-Link** („Abmelden“, „Unsubscribe“, „Newsletter
  abbestellen“, `List-Unsubscribe`-Kopfzeile).
- **Betreff** enthält typische Werbe-Wörter: Rabatt, Angebot, Sale, %, Gutschein,
  Newsletter, Aktion, „nur heute“, „jetzt sparen“, Black Friday, Deal.
- Der **Absender** ist eine no-reply-/Marketing-Adresse
  (`no-reply@`, `newsletter@`, `marketing@`, `info@…shop`, `mailing@`).
- Es gibt keinen persönlichen Bezug (Massenversand, kein echter Name in der Anrede).

> Faustregel: „Würde ich diese Mail vermissen?“ – Wenn klar nein und sie wirkt
> wie Massen-Werbung, darf sie in den Papierkorb.

---

## Was niemals gelöscht wird (Schutzliste)

Diese E-Mails bleiben **immer** im Postfach, auch wenn sie Werbe-Wörter enthalten:

- **Behörden, Ämter, Versicherungen, Banken, Krankenkasse, Finanzamt.**
- **Rechnungen, Mahnungen, Verträge, Bestellbestätigungen, Lieferinfos,
  Zahlungsbelege, Kontoauszüge.**
- **Termine, Buchungen, Tickets, Bestätigungscodes, 2-Faktor-Codes.**
- Absender aus dem **persönlichen Adressbuch / bekannte Kontakte**.
- Alles, was als **wichtig markiert** (Stern, Wichtig-Label) ist.
- Mails mit Anhang, die nach einem Dokument aussehen (PDF-Rechnung o. Ä.).

Eigene Ausnahmen pflegt der Nutzer in der Liste **„Geschützte Absender“** weiter
unten.

---

## Ablauf (täglicher Lauf)

1. **Verbinden** mit dem Postfach (Gmail-API oder IMAP).
2. **Suchen** nach Kandidaten der letzten 24 Stunden:
   - Gmail-Suchanfrage als Startpunkt:
     ```
     category:promotions newer_than:2d -is:starred -label:wichtig -has:attachment
     ```
   - Zusätzlich nach `List-Unsubscribe`-Kopfzeile filtern.
3. **Bewerten** jeder Mail nach „Was als Werbung gilt“ **und** „Schutzliste“.
   - Schutzliste schlägt jede Werbe-Einstufung.
4. **Vorschau (nur beim ersten Mal oder auf Wunsch):** Liste der gefundenen
   Werbe-Mails zeigen (Absender + Betreff) und bestätigen lassen.
5. **Verschieben** der bestätigten Werbung in den **Papierkorb** (Trash).
   - NICHT „endgültig löschen“ / „delete forever“.
6. **Bericht** geben: Anzahl verschobener Mails, Liste der Absender, sowie wie
   viele wegen der Schutzliste bewusst liegen blieben.

---

## So wird es täglich ausgeführt

Den Skill regelmäßig laufen lassen, z. B.:

- **Claude Code:** den Skill täglich aufrufen (z. B. mit dem `/loop`-Mechanismus
  oder einem geplanten Task), Beispiel-Aufruf:
  > „Räume die Werbung in meinem Postfach auf.“
- **Server/Cron:** ein kleines Skript, das den Ablauf oben ausführt, per Cron
  einmal pro Tag (z. B. morgens um 7:13 Uhr):
  ```
  13 7 * * *   /pfad/zu/werbung-aufraeumen.sh
  ```

---

## Beispiel-Bericht

```
✅ Postfach aufgeräumt – 26.06.2026, 07:13 Uhr

In den Papierkorb verschoben: 14 Werbe-Mails
  • Mode-Shop XY – "Sommer-Sale: -40% nur heute"
  • Reise-Newsletter – "Deine Angebote der Woche"
  • Supermarkt – "Die neuen Coupons sind da"
  … und 11 weitere

Bewusst liegen gelassen (Schutzliste): 3
  • Krankenkasse – "Ihr Bonusprogramm" (Behörde/Versicherung)
  • Online-Shop – "Ihre Rechnung Nr. 12345" (Rechnung)
  • Bank – "Wichtige Information zu Ihrem Konto" (Bank)

Im Papierkorb bleiben die Mails 30 Tage und sind wiederherstellbar.
```

---

## Geschützte Absender (vom Nutzer pflegbar)

Hier eigene Adressen oder Domains eintragen, die nie aufgeräumt werden sollen:

```
# z. B.:
# rechnung@mein-stromanbieter.de
# @meine-bank.de
# liebe.tante@example.com
```

## Immer-löschen-Absender (optional)

Absender, deren Werbung immer ohne Nachfrage in den Papierkorb darf:

```
# z. B.:
# newsletter@alter-shop.de
```

---

## Andere Anbieter

Für **Outlook/Hotmail**, **GMX**, **Web.de** oder **Yahoo** gilt der gleiche
Ablauf über IMAP. Statt der Gmail-Kategorie „Promotions“ wird dann allein nach
`List-Unsubscribe`-Kopfzeile, Betreff-Wörtern und Absender bewertet. Zielordner
für gelöschte Mails ist der jeweilige **Papierkorb**-Ordner des Anbieters.

---

## Grenzen

- Der Skill ersetzt keinen Spam-Filter gegen Betrug/Phishing – er räumt nur
  reguläre Werbung/Newsletter auf.
- Erkennung ist regelbasiert; bei Unsicherheit bleibt eine Mail liegen. Lieber
  einmal zu wenig löschen als versehentlich Wichtiges entfernen.
