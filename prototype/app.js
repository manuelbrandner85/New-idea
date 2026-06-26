/* =========================================================
   Klar – Prototyp-Logik
   Einfacher Bildschirm-Router + Vorlesen + Schriftgröße.
   Bewusst ohne Framework: kein Build, läuft überall direkt.
   ========================================================= */

(function () {
  "use strict";

  // Name kommt aus dem Onboarding (im localStorage gespeichert)
  function userName() {
    try { return localStorage.getItem("klar-name") || "Helga"; }
    catch (e) { return "Helga"; }
  }
  function setName(n) {
    try { localStorage.setItem("klar-name", n); } catch (e) {}
  }
  function isOnboarded() {
    try { return localStorage.getItem("klar-onboarded") === "1"; }
    catch (e) { return false; }
  }
  function markOnboarded() {
    try { localStorage.setItem("klar-onboarded", "1"); } catch (e) {}
  }

  // ---- Elemente ----
  var screenEl   = document.getElementById("screen");
  var backBtn    = document.getElementById("backBtn");
  var readBtn    = document.getElementById("readBtn");
  var fontBtn    = document.getElementById("fontBtn");
  var settingsBtn= document.getElementById("settingsBtn");
  var tabbar     = document.querySelector(".tabbar");
  var speakBanner= document.getElementById("speakingBanner");
  var stopReadBtn= document.getElementById("stopReadBtn");

  // ---- Navigationszustand ----
  var historyStack = [];
  var current = null;

  // ============================================================
  //  Vorlesen (Web Speech API)
  // ============================================================
  var synth = window.speechSynthesis || null;

  function stopSpeaking() {
    if (synth) synth.cancel();
    speakBanner.hidden = true;
    readBtn.setAttribute("aria-pressed", "false");
  }

  function speak(text) {
    if (!synth) {
      alert("Vorlesen wird von diesem Browser leider nicht unterstützt.");
      return;
    }
    stopSpeaking();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE";
    u.rate = 0.95; // etwas ruhiger
    u.onstart = function () {
      speakBanner.hidden = false;
      readBtn.setAttribute("aria-pressed", "true");
    };
    u.onend = function () {
      speakBanner.hidden = true;
      readBtn.setAttribute("aria-pressed", "false");
    };
    synth.speak(u);
  }

  // liest den sichtbaren Inhalt des aktuellen Bildschirms vor
  function readScreen() {
    if (synth && synth.speaking) { stopSpeaking(); return; }
    var text = screenEl.getAttribute("data-read") || screenEl.innerText;
    speak(text);
  }

  readBtn.addEventListener("click", readScreen);
  stopReadBtn.addEventListener("click", stopSpeaking);

  // ============================================================
  //  Schriftgröße
  // ============================================================
  var sizes = ["base", "large", "xlarge"];
  fontBtn.addEventListener("click", function () {
    var cur = document.documentElement.getAttribute("data-fontsize") || "base";
    var next = sizes[(sizes.indexOf(cur) + 1) % sizes.length];
    document.documentElement.setAttribute("data-fontsize", next);
    try { localStorage.setItem("klar-fontsize", next); } catch (e) {}
  });
  try {
    var saved = localStorage.getItem("klar-fontsize");
    if (saved) document.documentElement.setAttribute("data-fontsize", saved);
  } catch (e) {}

  settingsBtn.addEventListener("click", function () { go("einstellungen"); });

  // ============================================================
  //  Hilfsfunktion zum Bauen von HTML
  // ============================================================
  function el(html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // ============================================================
  //  Bildschirme
  // ============================================================
  var screens = {

    home: function () {
      var frag = document.createDocumentFragment();
      frag.appendChild(el(
        '<div class="greeting">' +
          '<h1>Hallo ' + esc(userName()) + ' 👋</h1>' +
          '<p>Wie kann ich dir helfen?</p>' +
        '</div>'
      ));
      var big = el(
        '<button class="bigbutton">' +
          '<span class="emoji" aria-hidden="true">🗣️</span>' +
          '<span>Mit Klara sprechen<small>Stell mir einfach eine Frage</small></span>' +
        '</button>'
      );
      big.addEventListener("click", function () { go("klara"); });
      frag.appendChild(big);

      var tiles = el('<div class="tiles"></div>');
      [
        ["✉️", "Brief erklären", "brief"],
        ["📄", "Formular ausfüllen", "formular"],
        ["🛡️", "Betrug prüfen", "betrug"],
        ["⏰", "Erinnerungen", "erinnerungen"]
      ].forEach(function (t) {
        var tile = el(
          '<button class="tile"><span class="emoji" aria-hidden="true">' + t[0] +
          '</span><span>' + esc(t[1]) + '</span></button>'
        );
        tile.addEventListener("click", function () { go(t[2]); });
        tiles.appendChild(tile);
      });
      frag.appendChild(tiles);

      var card = el(
        '<div class="card card--accent" style="margin-top:24px">' +
          '<h2>📌 Nächste Erinnerung</h2>' +
          '<p>Wohngeld-Antrag abgeben</p>' +
          '<p class="card__hint">Frist: 10. Juli 2026</p>' +
        '</div>'
      );
      card.addEventListener("click", function () { go("erinnerungen"); });
      card.style.cursor = "pointer";
      frag.appendChild(card);

      return {
        node: frag,
        readText: "Hallo " + userName() + ". Wie kann ich dir helfen? " +
          "Du kannst mit Klara sprechen, einen Brief erklären lassen, ein Formular ausfüllen, " +
          "Betrug prüfen oder deine Erinnerungen ansehen. " +
          "Deine nächste Erinnerung: Wohngeld-Antrag abgeben bis zum 10. Juli."
      };
    },

    klara: function () {
      var frag = document.createDocumentFragment();
      frag.appendChild(el('<h1 class="screen-title">🗣️ Klara – deine Helferin</h1>'));
      frag.appendChild(el('<p class="screen-intro">Stell mir eine Frage. Ich erkläre alles in einfacher Sprache.</p>'));

      var chat = el('<div class="chat"></div>');
      chat.appendChild(makeBubble("klara",
        "Hallo " + userName() + "! Ich bin Klara. Frag mich etwas – zum Beispiel zu einem Brief, " +
        "einem Antrag oder wenn du unsicher bist, ob eine Nachricht echt ist."));
      frag.appendChild(chat);

      var chips = el('<div class="chips"></div>');
      var examples = [
        ["Was ist Wohngeld?",
         "Wohngeld ist ein Zuschuss vom Staat zu deiner Miete. Wenn dein Einkommen nicht " +
         "hoch genug ist, hilft der Staat mit. Du musst es einmal beantragen. Möchtest du, " +
         "dass ich dir beim Antrag helfe?"],
        ["Wie buche ich einen Arzttermin online?",
         "Das machen wir gemeinsam in 4 kleinen Schritten. Ich zeige dir jeden Schritt mit Bild. " +
         "Tipp unten auf „Anleitungen“, dort findest du es. Soll ich dich hinbringen?"],
        ["Eine SMS will, dass ich auf einen Link klicke.",
         "Bitte nicht klicken! Das ist sehr oft Betrug. Geh auf „Betrug prüfen“, dann schaue " +
         "ich mir die Nachricht genau an und sage dir, ob sie gefährlich ist."]
      ];
      // gemeinsame Antwort-Funktion (für Beispiel-Chips UND Freitext)
      function respond(question, fixedAnswer) {
        chat.appendChild(makeBubble("user", question));
        var answer = fixedAnswer || klaraAnswer(question);
        var b = makeBubble("klara", answer);
        chat.appendChild(b);
        b.scrollIntoView({ behavior: "smooth", block: "nearest" });
        screenEl.setAttribute("data-read", answer);
      }

      examples.forEach(function (ex) {
        var chip = el('<button class="chip">' + esc(ex[0]) + '</button>');
        chip.addEventListener("click", function () { respond(ex[0], ex[1]); });
        chips.appendChild(chip);
      });
      frag.appendChild(el('<p class="card__hint">Beispiel-Fragen (zum Ausprobieren tippen):</p>'));
      frag.appendChild(chips);

      // Freitext-Eingabe mit Mikrofon
      var bar = el(
        '<form class="askbar" autocomplete="off">' +
          '<button type="button" class="askbar__mic" title="Frage sprechen" aria-label="Frage sprechen">🎤</button>' +
          '<input class="askbar__input" type="text" placeholder="Schreib oder sag deine Frage …" aria-label="Deine Frage">' +
          '<button type="submit" class="askbar__send" aria-label="Frage senden">Senden</button>' +
        '</form>'
      );
      var input = bar.querySelector(".askbar__input");
      var mic = bar.querySelector(".askbar__mic");
      bar.addEventListener("submit", function (e) {
        e.preventDefault();
        var q = input.value.trim();
        if (!q) return;
        respond(q);
        input.value = "";
        input.focus();
      });
      setupMic(mic, input, function () {
        var q = input.value.trim();
        if (q) { respond(q); input.value = ""; }
      });
      frag.appendChild(bar);

      frag.appendChild(el('<p class="note">Hinweis: In diesem Prototyp antwortet Klara mit ' +
        'vorbereiteten Beispiel-Antworten. Im echten Produkt antwortet eine KI frei.</p>'));

      return {
        node: frag,
        readText: "Hallo " + userName() + ". Ich bin Klara. Frag mich etwas. " +
          "Du kannst eine Beispiel-Frage antippen oder deine eigene Frage schreiben oder sprechen."
      };
    },

    brief: function () {
      var frag = document.createDocumentFragment();
      frag.appendChild(el('<h1 class="screen-title">✉️ Brief erklären</h1>'));
      frag.appendChild(el('<p class="screen-intro">Fotografiere deinen Brief. Ich erkläre dir in einfacher Sprache, was er bedeutet.</p>'));

      var photoBtn = el('<button class="btn btn--block btn--amber"><span aria-hidden="true">📷</span> Brief fotografieren</button>');
      var result = el('<div></div>');
      photoBtn.addEventListener("click", function () {
        photoBtn.textContent = "✓ Brief erkannt – ich erkläre ihn …";
        photoBtn.disabled = true;
        var explanation =
          '<div class="card" style="margin-top:24px">' +
            '<h2>Das steht in deinem Brief</h2>' +
            '<p><strong>Was ist das?</strong><br>Ein Brief vom Finanzamt zu deiner Steuererklärung.</p>' +
            '<p><strong>Was bedeutet das für dich?</strong><br>Du bekommst Geld zurück: 213,40 Euro.</p>' +
            '<p><strong>Was musst du tun?</strong><br>Nichts. Das Geld kommt von allein auf dein Konto.</p>' +
          '</div>';
        result.innerHTML = explanation +
          '<div class="card card--accent"><p>📅 Es gibt keine Frist. Alles ist erledigt. 🎉</p></div>';
        var saveBtn = el('<button class="btn btn--block">⏰ Trotzdem Notiz speichern</button>');
        saveBtn.addEventListener("click", function () { go("erinnerungen"); });
        result.appendChild(saveBtn);
        screenEl.setAttribute("data-read",
          "Dein Brief kommt vom Finanzamt. Es geht um deine Steuererklärung. " +
          "Gute Nachricht: Du bekommst 213 Euro und 40 Cent zurück. " +
          "Du musst nichts tun. Das Geld kommt von allein auf dein Konto.");
        result.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
      frag.appendChild(photoBtn);
      frag.appendChild(result);
      frag.appendChild(el('<p class="note">Hinweis: Dies ist ein Beispiel. Es wird kein echtes Foto verschickt.</p>'));

      return { node: frag, readText:
        "Brief erklären. Fotografiere deinen Brief mit dem großen Knopf. " +
        "Ich erkläre dir dann in einfacher Sprache, was er bedeutet." };
    },

    betrug: function () {
      var frag = document.createDocumentFragment();
      frag.appendChild(el('<h1 class="screen-title">🛡️ Betrug prüfen</h1>'));
      frag.appendChild(el('<p class="screen-intro">Du hast eine Nachricht bekommen und bist unsicher? Wähle ein Beispiel – ich prüfe es für dich.</p>'));

      var samples = [
        {
          label: "📩 SMS: „Ihr Paket wartet. Zoll bezahlen: bit.ly/xz3“",
          level: "danger", icon: "🔴", title: "Achtung: Betrug!",
          text: "Diese Nachricht ist Betrug. Echte Paketdienste verlangen so kein Geld über einen Link. " +
                "Nicht klicken. Nicht antworten. Am besten löschen.",
          read: "Achtung, das ist Betrug. Bitte nicht auf den Link klicken, nicht antworten und die Nachricht löschen."
        },
        {
          label: "📧 E-Mail: „Ihre Bank: Bitte bestätigen Sie Ihre PIN.“",
          level: "danger", icon: "🔴", title: "Achtung: Betrug!",
          text: "Deine Bank fragt NIE per E-Mail nach PIN oder Passwort. Das ist Betrug. " +
                "Gib niemals deine PIN ein. Lösche die E-Mail.",
          read: "Achtung, das ist Betrug. Deine Bank fragt niemals nach deiner PIN. Bitte lösche die E-Mail."
        },
        {
          label: "📩 SMS: „Termin beim Bürgeramt am 3.7. um 10 Uhr bestätigt.“",
          level: "safe", icon: "🟢", title: "Sieht sicher aus",
          text: "Diese Nachricht wirkt echt – sie bestätigt nur einen Termin und will kein Geld und keine Daten. " +
                "Wenn du den Termin gebucht hast, ist alles in Ordnung.",
          read: "Diese Nachricht sieht sicher aus. Sie bestätigt nur einen Termin und will weder Geld noch Daten."
        }
      ];

      var result = el('<div></div>');
      samples.forEach(function (s) {
        var btn = el('<button class="help-option">' + esc(s.label) + '</button>');
        btn.addEventListener("click", function () {
          result.innerHTML =
            '<div class="ampel ampel--' + s.level + '">' +
              '<span class="emoji" aria-hidden="true">' + s.icon + '</span>' +
              '<div><h2>' + esc(s.title) + '</h2><p>' + esc(s.text) + '</p></div>' +
            '</div>';
          screenEl.setAttribute("data-read", s.read);
          result.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
        frag.appendChild(btn);
      });
      frag.appendChild(result);
      frag.appendChild(el('<p class="note">Klar fragt dich nie nach Passwörtern, PIN oder TAN.</p>'));

      return { node: frag, readText:
        "Betrug prüfen. Wähle eine der Beispiel-Nachrichten aus. " +
        "Ich sage dir mit einer Ampel, ob sie sicher oder gefährlich ist." };
    },

    formular: function () {
      var frag = document.createDocumentFragment();
      frag.appendChild(el('<h1 class="screen-title">📄 Formular ausfüllen</h1>'));
      frag.appendChild(el('<p class="screen-intro">Ich frage dich alles in Ruhe, Schritt für Schritt. Du musst kein Feld selbst suchen.</p>'));

      var stepData = [
        { q: "Wie heißt du mit vollem Namen?", help: "Vorname und Nachname, so wie im Personalausweis.", ph: "z. B. Helga Schmidt" },
        { q: "Wie lautet deine Adresse?", help: "Straße, Hausnummer, Postleitzahl und Ort.", ph: "z. B. Gartenweg 5, 12345 Musterstadt" },
        { q: "Wie hoch ist deine monatliche Miete?", help: "Die Kaltmiete ohne Nebenkosten, in Euro.", ph: "z. B. 540" }
      ];
      var idx = 0;
      var box = el('<div></div>');

      function renderStep() {
        if (idx >= stepData.length) {
          box.innerHTML =
            '<div class="success-banner">' +
              '<div class="emoji" aria-hidden="true">🎉</div>' +
              '<h2>Geschafft!</h2>' +
              '<p>Dein Wohngeld-Antrag ist fertig ausgefüllt.</p>' +
            '</div>' +
            '<div class="btn-row">' +
              '<button class="btn btn--amber" id="pdfBtn">📄 Als PDF speichern</button>' +
              '<button class="btn btn--ghost" id="remBtn">⏰ Abgabe-Frist merken</button>' +
            '</div>';
          box.querySelector("#remBtn").addEventListener("click", function () { go("erinnerungen"); });
          box.querySelector("#pdfBtn").addEventListener("click", function () {
            alert("Im echten Produkt wird hier dein fertiges Formular als PDF gespeichert.");
          });
          screenEl.setAttribute("data-read", "Geschafft! Dein Wohngeld-Antrag ist fertig ausgefüllt.");
          return;
        }
        var s = stepData[idx];
        box.innerHTML =
          '<p class="progress">Schritt ' + (idx + 1) + ' von ' + stepData.length + '</p>' +
          '<div class="field">' +
            '<label for="f">' + esc(s.q) + '</label>' +
            '<p class="help">' + esc(s.help) + '</p>' +
            '<input id="f" type="text" placeholder="' + esc(s.ph) + '" autocomplete="off">' +
          '</div>';
        var next = el('<button class="btn btn--block btn--amber">Weiter →</button>');
        next.addEventListener("click", function () { idx++; renderStep(); });
        box.appendChild(next);
        screenEl.setAttribute("data-read", "Schritt " + (idx + 1) + ": " + s.q + " " + s.help);
        var input = box.querySelector("#f");
        if (input) input.focus();
      }
      renderStep();
      frag.appendChild(box);
      return { node: frag, readText:
        "Formular ausfüllen. Ich frage dich alles Schritt für Schritt. Du musst kein Feld selbst suchen." };
    },

    erinnerungen: function () {
      var frag = document.createDocumentFragment();
      frag.appendChild(el('<h1 class="screen-title">⏰ Deine Erinnerungen</h1>'));
      frag.appendChild(el('<p class="screen-intro">Ich erinnere dich rechtzeitig – per Nachricht, und auf Wunsch sogar per Anruf.</p>'));

      [
        ["10", "JUL", "Wohngeld-Antrag abgeben", "Wichtige Frist"],
        ["18", "JUL", "Arzttermin, Dr. Müller, 10:00 Uhr", "Termin"],
        ["01", "AUG", "Stromzähler ablesen", "Erinnerung"]
      ].forEach(function (r) {
        frag.appendChild(el(
          '<div class="reminder">' +
            '<div class="reminder__date"><strong>' + r[0] + '</strong>' + r[1] + '</div>' +
            '<div><div style="font-weight:700">' + esc(r[2]) + '</div>' +
            '<div class="card__hint">' + esc(r[3]) + '</div></div>' +
          '</div>'
        ));
      });
      var add = el('<button class="btn btn--block">➕ Neue Erinnerung hinzufügen</button>');
      add.addEventListener("click", function () {
        alert("Im echten Produkt kannst du hier eine neue Erinnerung anlegen – auch per Sprache.");
      });
      frag.appendChild(add);
      return { node: frag, readText:
        "Deine Erinnerungen. Am 10. Juli: Wohngeld-Antrag abgeben. Am 18. Juli: Arzttermin um 10 Uhr. " +
        "Am 1. August: Stromzähler ablesen." };
    },

    anleitungen: function () {
      var frag = document.createDocumentFragment();
      frag.appendChild(el('<h1 class="screen-title">📚 Anleitungen</h1>'));
      frag.appendChild(el('<p class="screen-intro">Schritt für Schritt mit Bildern. Ganz in Ruhe, du kannst nichts falsch machen.</p>'));

      var topics = [
        ["📅", "Termin beim Bürgeramt buchen"],
        ["💶", "Online überweisen"],
        ["📱", "Eine App installieren"],
        ["📧", "Eine E-Mail schreiben"]
      ];
      var list = el('<div></div>');
      topics.forEach(function (t, i) {
        var b = el('<button class="help-option"><span class="emoji" aria-hidden="true">' + t[0] +
          '</span><span>' + esc(t[1]) + '</span></button>');
        b.addEventListener("click", function () { showGuide(i); });
        list.appendChild(b);
      });
      frag.appendChild(list);
      var detail = el('<div id="guideDetail"></div>');
      frag.appendChild(detail);

      function showGuide(i) {
        var guide = {
          0: ["📅", "Termin beim Bürgeramt buchen", [
            ["Öffne die Internetseite deiner Stadt", "🌐"],
            ["Tippe auf „Termin buchen“", "👆"],
            ["Wähle den Grund, z. B. „Personalausweis“", "📋"],
            ["Such dir einen freien Tag aus", "✅"]
          ]]
        }[0]; // im Prototyp nur das erste Beispiel ausführlich
        var steps = '<ol class="steps">';
        guide[2].forEach(function (st, n) {
          steps += '<li class="step"><span class="step__num">' + (n + 1) + '</span>' +
            '<div class="step__body"><div style="font-weight:700">' + esc(st[0]) + '</div>' +
            '<div class="step__img" aria-hidden="true">' + st[1] + '</div></div></li>';
        });
        steps += '</ol>';
        detail.innerHTML = '<h2 class="screen-title" style="margin-top:24px">' + guide[0] + ' ' + esc(guide[1]) + '</h2>' + steps;
        detail.scrollIntoView({ behavior: "smooth", block: "start" });
        screenEl.setAttribute("data-read",
          "So buchst du einen Termin beim Bürgeramt. Schritt 1: Öffne die Internetseite deiner Stadt. " +
          "Schritt 2: Tippe auf Termin buchen. Schritt 3: Wähle den Grund. Schritt 4: Such dir einen freien Tag aus.");
      }

      return { node: frag, readText:
        "Anleitungen. Hier findest du bebilderte Hilfen, zum Beispiel einen Termin beim Bürgeramt buchen, " +
        "online überweisen oder eine App installieren." };
    },

    hilfe: function () {
      var frag = document.createDocumentFragment();
      frag.appendChild(el('<h1 class="screen-title">❓ Hilfe</h1>'));
      frag.appendChild(el('<p class="screen-intro">Du bist nie allein. Wähle, wie du Hilfe möchtest.</p>'));

      var b1 = el('<button class="help-option"><span class="emoji" aria-hidden="true">🗣️</span><span>Klara fragen</span></button>');
      b1.addEventListener("click", function () { go("klara"); });
      var b2 = el('<button class="help-option"><span class="emoji" aria-hidden="true">📚</span><span>Anleitung ansehen</span></button>');
      b2.addEventListener("click", function () { go("anleitungen"); });
      var b3 = el('<button class="help-option"><span class="emoji" aria-hidden="true">📞</span><span>Vertrauensperson anrufen</span></button>');
      b3.addEventListener("click", function () {
        alert("Im echten Produkt rufst du hier deine hinterlegte Vertrauensperson an.");
      });
      frag.appendChild(b1); frag.appendChild(b2); frag.appendChild(b3);
      frag.appendChild(el('<p class="note">Tipp: Mit dem 🔊-Knopf oben lasse ich dir jede Seite vorlesen.</p>'));
      return { node: frag, readText:
        "Hilfe. Du bist nie allein. Du kannst Klara fragen, eine Anleitung ansehen oder deine Vertrauensperson anrufen." };
    },

    einstellungen: function () {
      var frag = document.createDocumentFragment();
      frag.appendChild(el('<h1 class="screen-title">⚙️ Einstellungen</h1>'));
      frag.appendChild(el('<p class="screen-intro">Stell Klar so ein, wie es für dich am angenehmsten ist.</p>'));

      frag.appendChild(el('<div class="card"><h2>Schriftgröße</h2><p>Tippe oben rechts auf „Aa“, um die Schrift größer zu machen. Probier es aus!</p></div>'));
      frag.appendChild(el('<div class="card"><h2>Vorlesen</h2><p>Tippe oben auf „Vorlesen“, dann lese ich dir die Seite vor.</p></div>'));
      frag.appendChild(el('<div class="card"><h2>Anrede</h2><p>Du wirst aktuell mit „Du“ angesprochen. Im echten Produkt kannst du auch „Sie“ wählen.</p></div>'));
      frag.appendChild(el('<div class="card card--accent"><h2>🔒 Deine Daten</h2><p>Klar verkauft deine Daten nie und fragt nie nach Passwörtern, PIN oder TAN.</p></div>'));
      var redo = el('<button class="btn btn--ghost btn--block">▶️ Einführung erneut ansehen</button>');
      redo.addEventListener("click", function () {
        try { localStorage.removeItem("klar-onboarded"); } catch (e) {}
        startOnboarding();
      });
      frag.appendChild(redo);
      return { node: frag, readText:
        "Einstellungen. Hier kannst du die Schriftgröße ändern, das Vorlesen nutzen und die Anrede wählen." };
    }
  };

  function makeBubble(who, text) {
    var b = el('<div class="bubble bubble--' + who + '"></div>');
    if (who === "klara") b.appendChild(el('<div class="bubble__name">Klara</div>'));
    b.appendChild(el('<div>' + esc(text) + '</div>'));
    if (who === "klara") {
      var r = el('<button class="bubble__read">🔊 Vorlesen</button>');
      r.addEventListener("click", function () { speak(text); });
      b.appendChild(r);
    }
    return b;
  }

  // ------------------------------------------------------------
  //  Klara-Antworten (Prototyp: einfache Stichwort-Erkennung)
  //  Im echten Produkt antwortet hier eine KI über einen Server.
  // ------------------------------------------------------------
  function klaraAnswer(q) {
    var t = " " + q.toLowerCase() + " ";
    function has() {
      for (var i = 0; i < arguments.length; i++) {
        if (t.indexOf(arguments[i]) !== -1) return true;
      }
      return false;
    }
    if (has("wohngeld", "miete", "zuschuss"))
      return "Wohngeld ist ein Zuschuss vom Staat zu deiner Miete. Wenn dein Einkommen " +
        "nicht reicht, hilft der Staat mit. Du musst es einmal beantragen. Soll ich dir beim Antrag helfen? " +
        "Tippe dazu unten auf „Start“ und dann auf „Formular ausfüllen“.";
    if (has("betrug", "phishing", "link", "klicken", "gewonnen", "paket", "zoll", "pin", "tan", "passwort"))
      return "Das klingt verdächtig. Bitte klicke auf keinen Link und gib keine Daten ein. " +
        "Geh auf „Betrug prüfen“ – dort schaue ich mir die Nachricht an und sage dir mit einer Ampel, " +
        "ob sie gefährlich ist. Echte Stellen fragen nie nach PIN, TAN oder Passwort.";
    if (has("brief", "schreiben vom amt", "behörde", "finanzamt", "bescheid"))
      return "Einen Brief erkläre ich dir gern. Tippe auf „Brief erklären“ und mach ein Foto. " +
        "Ich sage dir dann in einfacher Sprache, was drinsteht und was du tun musst.";
    if (has("termin", "arzt", "bürgeramt", "buchen"))
      return "Einen Termin online zu buchen zeige ich dir Schritt für Schritt mit Bildern. " +
        "Tippe unten auf „Anleitungen“ und wähle „Termin beim Bürgeramt buchen“.";
    if (has("überweis", "geld senden", "konto", "bank"))
      return "Online überweisen üben wir gemeinsam. Unter „Anleitungen“ findest du eine bebilderte " +
        "Schritt-für-Schritt-Hilfe. Und keine Sorge: Klar fragt dich nie nach deiner PIN oder TAN.";
    if (has("erinner", "frist", "vergessen", "wann"))
      return "Ich kann dich an Termine und Fristen erinnern – auf Wunsch sogar per Anruf. " +
        "Schau unter „Erinnerungen“, dort siehst du deine nächsten Termine.";
    if (has("hallo", "hi ", "guten tag", "danke", "wie geht"))
      return "Hallo! Schön, dass du da bist. Frag mich einfach – zu einem Brief, einem Antrag, " +
        "einem Termin oder wenn du unsicher bist, ob eine Nachricht echt ist.";
    return "Das ist eine gute Frage. In diesem Prototyp kann ich nur ein paar Beispiele beantworten " +
      "(Briefe, Wohngeld, Betrug, Termine, Überweisungen, Erinnerungen). " +
      "Im echten Produkt beantworte ich dir alles in einfacher Sprache. Probier gern eine der Beispiel-Fragen oben.";
  }

  // ------------------------------------------------------------
  //  Mikrofon / Spracheingabe (Web Speech API, wenn verfügbar)
  // ------------------------------------------------------------
  function setupMic(micBtn, input, onResult) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { micBtn.style.display = "none"; return; } // Browser kann es nicht
    var rec = new SR();
    rec.lang = "de-DE";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    var listening = false;
    micBtn.addEventListener("click", function () {
      if (listening) { rec.stop(); return; }
      try { rec.start(); } catch (e) {}
    });
    rec.onstart = function () { listening = true; micBtn.classList.add("askbar__mic--on"); micBtn.textContent = "● Hört zu"; };
    rec.onend   = function () { listening = false; micBtn.classList.remove("askbar__mic--on"); micBtn.textContent = "🎤"; };
    rec.onerror = function () { listening = false; micBtn.classList.remove("askbar__mic--on"); micBtn.textContent = "🎤"; };
    rec.onresult = function (e) {
      var text = e.results[0][0].transcript;
      input.value = text;
      if (onResult) onResult();
    };
  }

  // ============================================================
  //  Onboarding (erster Start) – eigene, ablenkungsfreie Schritte
  // ============================================================
  function startOnboarding() {
    document.body.setAttribute("data-onboarding", "1"); // blendet die untere Navigation aus
    backBtn.hidden = true;
    var step = 0;
    var tempName = "";

    function render(node, readText) {
      stopSpeaking();
      screenEl.innerHTML = "";
      screenEl.appendChild(node);
      screenEl.setAttribute("data-read", readText || screenEl.innerText);
      screenEl.focus();
      window.scrollTo(0, 0);
    }

    function finish() {
      markOnboarded();
      document.body.removeAttribute("data-onboarding");
      go("home", true);
    }

    var steps = [
      // 1) Begrüßung
      function () {
        var f = document.createDocumentFragment();
        f.appendChild(el(
          '<div class="onb">' +
            '<div class="onb__emoji" aria-hidden="true">👋</div>' +
            '<h1 class="onb__title">Hallo! Ich bin Klara.</h1>' +
            '<p class="onb__text">Ich helfe dir bei allem Digitalen – ganz in Ruhe. ' +
            'Du kannst nichts falsch machen.</p>' +
          '</div>'
        ));
        var btn = el('<button class="btn btn--block btn--amber">Los geht\'s →</button>');
        btn.addEventListener("click", next);
        f.appendChild(btn);
        render(f, "Hallo! Ich bin Klara. Ich helfe dir bei allem Digitalen, ganz in Ruhe. Du kannst nichts falsch machen.");
      },
      // 2) Name
      function () {
        var f = document.createDocumentFragment();
        f.appendChild(el('<div class="onb"><div class="onb__emoji" aria-hidden="true">😊</div>' +
          '<h1 class="onb__title">Wie möchtest du angesprochen werden?</h1>' +
          '<p class="onb__text">Schreib einfach deinen Vornamen.</p></div>'));
        var field = el('<div class="field"><input id="onbName" type="text" placeholder="z. B. Helga" autocomplete="off"></div>');
        f.appendChild(field);
        var btn = el('<button class="btn btn--block btn--amber">Weiter →</button>');
        btn.addEventListener("click", function () {
          var v = field.querySelector("#onbName").value.trim();
          tempName = v || "Helga";
          setName(tempName);
          next();
        });
        f.appendChild(btn);
        var skip = el('<button class="btn btn--ghost btn--block">Überspringen</button>');
        skip.addEventListener("click", function () { setName("Helga"); next(); });
        f.appendChild(skip);
        render(f, "Wie möchtest du angesprochen werden? Schreib einfach deinen Vornamen.");
        var inp = field.querySelector("#onbName");
        if (inp) inp.focus();
      },
      // 3) Schriftgröße
      function () {
        var f = document.createDocumentFragment();
        f.appendChild(el('<div class="onb"><div class="onb__emoji" aria-hidden="true">🅰️</div>' +
          '<h1 class="onb__title">Wie groß soll die Schrift sein?</h1>' +
          '<p class="onb__text">Wähle, was du am besten lesen kannst. Du kannst es später jederzeit ändern.</p></div>'));
        var opts = el('<div></div>');
        [["base", "So ist gut", "1rem"], ["large", "Etwas größer", "1.25rem"], ["xlarge", "Noch größer", "1.5rem"]]
          .forEach(function (o) {
            var b = el('<button class="btn btn--ghost btn--block" style="font-size:' + o[2] + '">' + esc(o[1]) + '</button>');
            b.addEventListener("click", function () {
              document.documentElement.setAttribute("data-fontsize", o[0]);
              try { localStorage.setItem("klar-fontsize", o[0]); } catch (e) {}
              next();
            });
            opts.appendChild(b);
          });
        f.appendChild(opts);
        render(f, "Wie groß soll die Schrift sein? Wähle, was du am besten lesen kannst.");
      },
      // 4) Vertrauensperson (optional)
      function () {
        var f = document.createDocumentFragment();
        f.appendChild(el('<div class="onb"><div class="onb__emoji" aria-hidden="true">🤝</div>' +
          '<h1 class="onb__title">Möchtest du eine Vertrauensperson hinterlegen?</h1>' +
          '<p class="onb__text">Das kann ein Kind, ein Enkel oder eine Freundin sein, ' +
          'die dir bei Bedarf helfen darf. Du kannst das auch später machen.</p></div>'));
        var btn = el('<button class="btn btn--block btn--amber">Jetzt hinzufügen</button>');
        btn.addEventListener("click", function () {
          alert("Im echten Produkt trägst du hier die Telefonnummer deiner Vertrauensperson ein.");
          next();
        });
        var skip = el('<button class="btn btn--ghost btn--block">Später, weiter →</button>');
        skip.addEventListener("click", next);
        f.appendChild(btn); f.appendChild(skip);
        render(f, "Möchtest du eine Vertrauensperson hinterlegen? Das kann jemand sein, der dir bei Bedarf helfen darf. Du kannst das auch später machen.");
      },
      // 5) Fertig
      function () {
        var f = document.createDocumentFragment();
        f.appendChild(el('<div class="success-banner"><div class="emoji" aria-hidden="true">🎉</div>' +
          '<h2>Alles bereit, ' + esc(userName()) + '!</h2>' +
          '<p>Probier es gleich aus: Stell Klara eine Frage oder lass dir einen Brief erklären.</p></div>'));
        var btn = el('<button class="btn btn--block btn--amber">Zur Startseite →</button>');
        btn.addEventListener("click", finish);
        f.appendChild(btn);
        render(f, "Alles bereit, " + userName() + "! Probier es gleich aus. Stell Klara eine Frage oder lass dir einen Brief erklären.");
      }
    ];

    function next() { step++; if (step >= steps.length) finish(); else steps[step](); }
    steps[0]();
  }

  // ============================================================
  //  Router
  // ============================================================
  var tabScreens = ["home", "klara", "anleitungen", "hilfe"];

  function go(name, fromBack) {
    stopSpeaking();
    if (!screens[name]) name = "home";
    if (!fromBack && current && current !== name) historyStack.push(current);
    current = name;

    var built = screens[name]();
    screenEl.innerHTML = "";
    screenEl.appendChild(built.node);
    screenEl.setAttribute("data-read", built.readText || screenEl.innerText);
    screenEl.focus();
    window.scrollTo(0, 0);

    // Zurück-Knopf nur, wenn es eine Vorgeschichte gibt
    backBtn.hidden = historyStack.length === 0;

    // aktiven Tab markieren
    Array.prototype.forEach.call(tabbar.querySelectorAll(".tab"), function (t) {
      var go = t.getAttribute("data-go");
      if (go === name) t.setAttribute("aria-current", "page");
      else t.removeAttribute("aria-current");
    });
    try { location.hash = name; } catch (e) {}
  }

  backBtn.addEventListener("click", function () {
    var prev = historyStack.pop();
    go(prev || "home", true);
  });

  Array.prototype.forEach.call(tabbar.querySelectorAll(".tab"), function (t) {
    t.addEventListener("click", function () {
      historyStack = []; // Tabs sind oberste Ebene
      go(t.getAttribute("data-go"), true);
    });
  });

  // Start: beim allerersten Mal das Onboarding zeigen
  if (!isOnboarded()) {
    startOnboarding();
  } else {
    var startScreen = (location.hash || "").replace("#", "") || "home";
    go(screens[startScreen] ? startScreen : "home", true);
  }

  // ============================================================
  //  Service Worker (Offline-Fähigkeit der PWA)
  // ============================================================
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
})();
