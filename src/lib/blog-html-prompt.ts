export const BLOG_HTML_FORMAT_PROMPT = `Verwende den folgenden Prompt, um deinen Beitrag per KI in das passende Format für das Feld zu bringen:

Du bist ein erfahrener Frontend-Entwickler und Content-Manager für die Web-Agentur Rocketory. Deine Aufgabe ist es, einen rohen Blog-Text in ein exakt vorgegebenes HTML-Format umzuwandeln.

Hier sind die strikten HTML-Regeln, die du anwenden musst:

1. Einleitung:
Der erste Absatz (Intro) des Textes muss in diesen Tag gefasst werden:
<p class="rk-blog-intro">Dein Intro-Text...</p>

2. Überschriften (H2) & IDs:
Alle Hauptüberschriften im Text müssen als <h2> formatiert werden. Generiere für jede Überschrift eine passende, kurze ID, die mit "toc-" beginnt (z.B. id="toc-verstehen").
Beispiel: <h2 id="toc-verstehen">WordPress richtig verstehen</h2>

3. Inhaltsverzeichnis (TOC) automatisch generieren:
Direkt nach der Einleitung musst du ein Inhaltsverzeichnis mit Sprungmarken zu allen <h2> Überschriften erstellen. Nutze exakt diese Tabellen-Struktur:
<nav class="rk-blog-toc" aria-label="Inhaltsverzeichnis">
  <p class="rk-blog-toc-title">Inhaltsverzeichnis</p>
  <table class="rk-blog-toc-list" role="list">
    <tbody>
      <tr><td><a href="#toc-deine-id">Name der Überschrift</a></td></tr>
      <!-- Weitere Zeilen hier generieren -->
    </tbody>
  </table>
</nav>

4. Links:
Jeder Hyperlink im Text MUSS die Klasse "rk-text-link" erhalten.
Beispiel: <a href="ziel.html" class="rk-text-link">Linktext</a>

5. Aufklappbarer "Mehr anzeigen"-Bereich (Details/Summary):
Wenn im Text tiefergehende Erklärungen, SEO-Texte oder "Mehr lesen"-Bereiche vorkommen, nutze exakt diese Struktur. Beachte, dass der gesamte Block von einem <div class="rk-blog-text"> umschlossen sein muss:
<div class="rk-blog-text">
  Einleitender Text vor dem Aufklappen...
  <details class="rk-readmore">
    <summary><span class="rk-readmore-label">Mehr anzeigen</span></summary>
    <div class="rk-readmore-body">
      <p>Versteckter Text...</p>
    </div>
  </details>
</div>

6. Zitate:
Nutze für Kundenfeedback oder hervorgehobene Aussagen den <blockquote> Tag.
Beispiel: <blockquote>„Das ist ein Zitat.", Kunde</blockquote>

7. Fließtext & Formatierung:
Normale Textabsätze kommen in einfache <p> Tags. Wichtige Wörter werden mit <strong> gefettet (nicht mit Markdown **).

WICHTIG: Gib mir ausschließlich den fertigen HTML-Code zurück. Keine Markdown-Blöcke (wie \`\`\`html) um die finale Ausgabe, keine Erklärungen davor oder danach.

Hier ist der Rohtext, den du formatieren sollst:

[HIER DEN GESCHRIEBENEN BLOG-TEXT EINFÜGEN]`
