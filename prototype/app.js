/* =========================================================
   Klar – Prototyp-Logik
   Einfacher Bildschirm-Router + Vorlesen + Schriftgröße.
   Bewusst ohne Framework: kein Build, läuft überall direkt.
   ========================================================= */

(function () {
  "use strict";

  var USER_NAME = "Helga"; // im echten Produkt aus dem Onboarding

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
          '<h1>Hallo ' + esc(USER_NAME) + ' 👋</h1>' +
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
        readText: "Hallo " + USER_NAME + ". Wie kann ich dir helfen? " +
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
        "Hallo " + USER_NAME + "! Ich bin Klara. Frag mich etwas – zum Beispiel zu einem Brief, " +
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
      examples.forEach(function (ex) {
        var chip = el('<button class="chip">' + esc(ex[0]) + '</button>');
        chip.addEventListener("click", function () {
          chat.appendChild(makeBubble("user", ex[0]));
          var b = makeBubble("klara", ex[1]);
          chat.appendChild(b);
          b.scrollIntoView({ behavior: "smooth", block: "nearest" });
          screenEl.setAttribute("data-read", ex[1]);
        });
        chips.appendChild(chip);
      });
      frag.appendChild(el('<p class="card__hint">Beispiel-Fragen (zum Ausprobieren tippen):</p>'));
      frag.appendChild(chips);

      frag.appendChild(el('<p class="note">Im echten Produkt kannst du auch frei tippen oder ' +
        'das Mikrofon nutzen und deine Frage einfach sagen.</p>'));

      return {
        node: frag,
        readText: "Hallo " + USER_NAME + ". Ich bin Klara. Frag mich etwas. " +
          "Du kannst eine der Beispiel-Fragen antippen, um zu sehen, wie ich antworte."
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

  // Start
  var startScreen = (location.hash || "").replace("#", "") || "home";
  go(screens[startScreen] ? startScreen : "home", true);

  // ============================================================
  //  Service Worker (Offline-Fähigkeit der PWA)
  // ============================================================
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
})();
