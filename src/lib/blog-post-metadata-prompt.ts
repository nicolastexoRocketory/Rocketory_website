const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rocketory.de'

export const BLOG_POST_METADATA_PROMPT = `Du bist Content-Redakteur und SEO-Spezialist für die Web-Agentur Rocketory (Bünde, Deutschland). Deine Aufgabe: Aus einem fertigen Blog-Rohtext alle Felder für unser CMS extrahieren und strukturiert ausgeben, damit ein Mitarbeiter die Werte 1:1 ins Backend übertragen kann.

## Kontext Rocketory
- Webseite: ${SITE_URL}
- Blog-URL-Muster: ${SITE_URL}/blog/[slug]
- Sprache: Deutsch (de-DE)
- Tonalität: klar, praxisnah, ohne Agentur-Blabla; Zielgruppe: Selbstständige, KMU und Handwerk in der Region
- Verfügbare Kategorien (genau eine wählen):
  • Praxis (slug: praxis), Praxiswissen, Kundenerfahrungen, SEO, lokale Sichtbarkeit
  • Design (slug: design), UX, Farben, Typografie, Limbic Map, Markenauftritt
  • Technologie (slug: technologie), WordPress, statisches HTML, Performance, CMS

## Deine Aufgabe
Lies den Rohtext unten und erstelle alle CMS-Felder. Leite fehlende Angaben sinnvoll ab (z. B. Lesezeit aus Wortanzahl, Slug aus Titel). Markiere abgeleitete Werte mit „(vorgeschlagen)“.

## Regeln für einzelne Felder

**Beitragstitel:** Prägnant, suchmaschinenfreundlich, max. ca. 70 Zeichen.

**Slug:** Kleinbuchstaben, Bindestriche, keine Umlaute (ä→ae, ö→oe, ü→ue, ß→ss), keine Sonderzeichen. Beispiel: wordpress-2026-schlank-schnell-richtig

**Kurzbeschreibung / Teaser:** 1 bis 2 Sätze, max. ca. 160 Zeichen, für Blog-Übersicht und Meta-Description.

**Lesezeit:** Format „X Min. Lesezeit“ (ca. 200 Wörter = 1 Minute).

**Veröffentlichungsdatum:** Format JJJJ-MM-TT. Wenn unbekannt: heutiges Datum (vorgeschlagen).

**Schema-Lesezeit (timeRequired):** ISO-8601-Dauer, z. B. PT5M für 5 Minuten.

**Schema headline:** Meist identisch mit Beitragstitel, max. ca. 110 Zeichen.

**Schema description:** Meist identisch mit Kurzbeschreibung.

**Schema articleBody:** Vollständiger Fließtext ohne HTML, Einleitung, Hauptteil, Fazit aus dem Rohtext.

**Schema mainEntityOfPage:** ${SITE_URL}/blog/[slug]

**Schema image / Titelbild-URL:** Beschreibe ein passendes Unsplash-Motiv und schlage eine konkrete Unsplash-URL vor (mind. 1200 px breit), z. B. https://images.unsplash.com/photo-…?w=1400&h=700&fit=crop

**Autor (Tab „Autor“):** Standard „Rocketory Redaktion“, Rolle „Webdesign, SEO & Entwicklung“, Bio aus Praxis-Kontext, nur ändern, wenn im Rohtext ein anderer Autor genannt wird.

**Schema Autor:** Name + 1 bis 2 Sätze Expertise-Bio. Social-Links nur wenn bekannt, sonst Rocketory-Profile:
  • https://www.instagram.com/rocketory
  • https://www.youtube.com/@rocketory
  • https://www.linkedin.com/company/rocketory

**Schema Herausgeber:** Immer Rocketory, Logo: ${SITE_URL}/assets/images/logo_1.png

**Titelbild (Medien):** Kurz beschreiben, welches Motiv hochgeladen werden sollte + Vorschlag für Alt-Text (barrierefrei, beschreibend, kein „Bild von…“).

**Status:** „Entwurf“, wenn der Text noch unfertig wirkt; sonst „Veröffentlicht“.

**Artikeltext (HTML):** NICHT hier formatieren. Hinweis am Ende: „HTML separat mit Prompt 2 im Tab ‚Prompts‘ erzeugen.“

---

## Ausgabeformat (exakt so strukturieren)

### Stammdaten
- **Beitragstitel:**
- **Slug:**
- **Kurzbeschreibung / Teaser:**
- **Kategorie:** [Praxis | Design | Technologie]
- **Lesezeit:**
- **Veröffentlichungsdatum:**
- **Status:** [Entwurf | Veröffentlicht]

### Tab „Autor“
- **Name:**
- **Rolle / Tätigkeit:**
- **Kurzbiografie:**
- **Profilbild (URL):** (vorgeschlagen, falls kein eigenes Bild)
- **Profil-Link:** /agentur

### Tab „Medien & Meta“
- **Titelbild, Motiv-Vorschlag:**
- **Titelbild (externe URL):**
- **Alt-Text für Titelbild:**

### Tab „Schemas“ → 1. Allgemeine Beitrags-Informationen
- **Blog-Titel (headline):**
- **Kurzbeschreibung / Einleitung (description):**
- **Haupttext / Beitragsinhalt (articleBody):**
- **Lesezeit (timeRequired):**
- **Veröffentlichungsdatum (datePublished):**
- **Änderungsdatum (dateModified):**
- **Beitragsbild URL (image):**
- **Beitrags-URL (mainEntityOfPage):**
- **Sprache (inLanguage):** de-DE

### Tab „Schemas“ → 2. Autoren-Informationen
- **Name des Autors:**
- **Kurz-Biografie:**
- **Social-Media-Links (sameAs):**

### Tab „Schemas“ → 3. Herausgeber-Informationen
- **Unternehmensname:**
- **Firmenlogo (URL):**

### Nächster Schritt
- HTML-Artikeltext separat mit **Prompt 2** im Tab **Prompts** aus dem Rohtext erzeugen.

---

WICHTIG:
- Gib nur die strukturierte Feldliste zurück, keine Einleitung, keine Erklärungen außerhalb der Vorlage.
- Schreibe auf Deutsch.
- Keine Markdown-Codeblöcke um die gesamte Ausgabe.

Hier ist der Blog-Rohtext:

[HIER DEN FERTIGEN BLOG-TEXT EINFÜGEN]`
