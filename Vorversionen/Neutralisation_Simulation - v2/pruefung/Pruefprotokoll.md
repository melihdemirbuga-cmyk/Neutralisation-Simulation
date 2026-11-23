# Prüfprotokoll – Das virtuelle Neutralisationslabor

Stand: 17.11.2026

## Ergebnis und Auslieferung

`neutralisationslabor.html` ist die vollständige Anwendung. HTML, CSS, JavaScript, Laborgeräte und Molekülgrafiken sind darin eingebettet. Keine Installation, externen Bibliotheken, Schrift-Downloads oder weiteren Dateien werden zur Ausführung benötigt. Die Dateien in `tests/` und `pruefung/` gehören ausschließlich zur Qualitätssicherung.

Die Änderung gegenüber den Anlagen ist durchgängig umgesetzt: Universalindikator statt Bromthymolblau, dargestellt als kleine Glasflasche mit Schraubdeckel, Gummibalg und integrierter Glaspipette. Die vom pH abhängigen Farben sind eine schematische Annäherung an die Farben des Universalindikators. Der neutrale Zustand ist grün, stark saure Lösungen sind rot und stark basische Lösungen violett.

## Chemische Prüfungen

25,0 ml HCl, jeweils 0,10 mol/l HCl und NaOH, 25 °C:

| NaOH zugegeben | Berechneter pH | Anzeige |
| --- | ---: | ---: |
| 0,0 ml | 1,000000 | 1,00 |
| 20,0 ml | 1,954243 | 1,95 |
| 25,0 ml | 7,000000 | 7,00 |
| 30,0 ml | 11,958607 | 11,96 |

Zusätzlich geprüft:

- Alle neun Kombinationen aus 0,05 / 0,10 / 0,20 mol/l Säure und Base: endlicher und monotoner pH-Verlauf, Ladungsbilanz, Wasserprodukt und Äquivalenzpunkt.
- Numerische Stabilität unmittelbar vor, am und nach dem Äquivalenzpunkt.
- 0,05 mol/l HCl mit 0,20 mol/l NaOH: exakt 6,25 ml erreichbar; pH 7,00. Hierfür besitzt die erweiterte Ansicht eine zusätzliche Feindosierung von 0,01 ml. Auch direkt im Browser dosiert und geprüft.
- 0,20 mol/l HCl mit 0,05 mol/l NaOH: Äquivalenzpunkt 100,0 ml; maximal 120,0 ml dosierbar; automatische Nachfüllung der 50-ml-Bürette. Becherglasgröße und Volumenskala passen sich an.
- Die Stoffmengen von Na⁺ und Cl⁻ bleiben erhalten. Wasserautoprotolyse wird berücksichtigt. Im neutralen Zustand sind berechnete und angezeigte Mengen von H₃O⁺ und OH⁻ identisch.
- Flüssigkeitsstand, Büretteninhalt, pH-Meter, Indikatorfarbe, Stoffmengen und Diagramm leiten sich aus demselben chemischen Zustand ab.

## Atomverfolgung und Teilchenmodell

Die Detailreaktion enthält zu jedem Zeitpunkt dieselben zwei O- und vier H-Atome mit festen IDs. Das markierte H-Atom wechselt kontrolliert die Bindung; das ursprüngliche Molekül und das aufnehmende Ion werden zu zwei H₂O-Molekülen. Die Gesamtladung beträgt vorher und nachher null. Kein länger frei wanderndes H⁺ wird dargestellt.

Auch die repräsentativen Reaktionsereignisse im Lösungsausschnitt übertragen das vorhandene H-Atom mit erhaltener Atom-ID. Na⁺ und Cl⁻ bleiben als Ionen mit angedeuteten, passend orientierten Hydrathüllen sichtbar. Beim Pausieren des Experiments werden laufende repräsentative Mischreaktionen abgeschlossen, sodass keine eingefrorenen OH⁻-Zugaben neben einem Säureüberschuss zurückbleiben.

Die Anzahl der Symbole ist ausdrücklich keine quantitative Konzentrationsmessung. Sehr geringe H₃O⁺- und OH⁻-Mengen durch Wasserautoprotolyse liegen unter der Auflösung der Teilchenlupe und werden im neutralen Zustand textlich erläutert.

## Automatisierte Regressionstests

3863 Prüfungen bestanden. Die hohe Zahl entsteht überwiegend aus der systematischen Konzentrationsmatrix mit mehreren Prüfkriterien je Messzustand.

Aufruf aus dem Projektverzeichnis:

```powershell
node --preserve-symlinks --preserve-symlinks-main tests/verify.cjs
```

Die Tests benötigen nur Node.js und verwenden ein DOM-Doppel für Zustands- und Ereignislogik. Sie prüfen insbesondere Berechnung, Stoffmengen und Ladungsbilanz, Dosierung, Maximalvolumen, Nachfüllen, Pause, Reset, gegenseitigen Ausschluss von Dosierung und Dialogen, feste Atom-IDs, Bindungswechsel, Reaktionsschritte, Lernaufgaben, Gleichungen, Lehrkraftzustände, Tastaturkürzel, Hintergrundwechsel und fehlende externe Laufzeitressourcen. Das DOM-Doppel ersetzt keine Prüfung des echten Browserlayouts.

## Prüfung im echten Browser

Die Anwendung wurde zusätzlich in der integrierten Chromium-Vorschau bedient und visuell geprüft:

- Teilchenmodell ab dem Start sichtbar; Vermutung mit Mehrfachauswahl und Begründung als optionale Lernaufgabe.
- Reale Dosierung bis 20,0 ml mit pH 1,95; kontinuierliche Zugabe, Pause und Zurücksetzen.
- Saure, neutrale und basische Zustände mit korrekter Farbe, Teilchenverteilung, pH-Anzeige und veränderlichem Flüssigkeitsstand.
- Auswahl von Teilchen im SVG und über die Legende; passende Informationen und Hervorhebung.
- Detailreaktion: Schritte vorwärts/rückwärts, Start, Pause, Wiederholen, normales Tempo und Zeitlupe, zwei Wassermoleküle als Produkte und sechs unveränderte Atom-IDs.
- Wort-, Formel-, vollständige und gekürzte Ionengleichung; Markieren und Ausblenden der Zuschauerionen.
- Messungsauswertung, Teilchenzuordnung und fachliche Rückmeldungen, beide Transferaufgaben und Überarbeitung der Ausgangserklärung.
- Freies Experimentieren ab dem Start, geänderte Konzentrationen und Feindosierung bis exakt 6,25 ml.
- Messpunkte, ausdrücklich eingeblendeter Modellverlauf, Äquivalenzmarkierung und Stoffmengenansicht.
- Lehrkraftzustände, vollständige Kurve und Ein-/Ausblenden einer Unterrichtsfrage.
- Reduzierte Bewegung sowie Wiederfreigabe der Bewegung nach Abschalten dieser Option.
- Keine JavaScript-Fehler in der abschließenden Browserkonsole.

Layoutprüfung bei 1440 × 900, 1280 × 800, 1280 × 720, 768 × 1024 und ergänzend 390 × 844 Pixeln. Keine unbeabsichtigte horizontale Überbreite; Dosierknöpfe bei 1280 × 720 ohne vertikales Scrollen erreichbar. Auf Tablets und schmalen Geräten werden Bereiche untereinander angeordnet. Zusätzliche Erklärungen und Vertiefungen dürfen gescrollt werden.

Die Browserprüfung erfolgte über einen ausschließlich an `127.0.0.1` gebundenen lokalen Vorschau-Server, der nur diese HTML-Datei ausliefert. Dieser Server wird für die fertige Anwendung nicht benötigt. Die integrierte Browserautomatisierung erlaubt keine direkte `file://`-Navigation; der Doppelklick-Start in einem externen Browser wurde daher nicht separat automatisiert. Der Anwendungscode verwendet keine serverabhängigen APIs oder Ressourcen.

## Abgelegte Ansichten

- `saeureueberschuss.jpg`: 10,0 ml NaOH, pH 1,37.
- `neutralpunkt.jpg`: 25,0 ml NaOH, pH 7,00, hydratisierte Na⁺- und Cl⁻-Ionen.
- `basenueberschuss.jpg`: 30,0 ml NaOH, pH 11,96.
- `protonenuebertragung.jpg`: zwei Wassermoleküle aus denselben sechs Atomen.
- `zustaende-vergleichen.jpg`: optionaler Vergleich der drei Situationen.
- `titrationskurve.jpg`: ausdrücklich freigegebener Modellverlauf und Stoffmengen am Neutralpunkt.

## Modellgrenzen

Vollständige Dissoziation starker einprotoniger Säure und Base, ideales Verhalten, additive Volumina, konstante 25 °C. Aktivitätseffekte, Erwärmung und das reale Protonentransportnetzwerk werden nicht modelliert. Die wenigen Indikatortropfen gelten hinsichtlich Volumen und Stoffbilanz als vernachlässigbar. Eigene Texte werden nicht automatisch semantisch benotet; fachliche Rückmeldungen beziehen sich auf Auswahlantworten und ausdrücklich angebotene Vergleichsargumente. Eingaben werden nur für die geöffnete Sitzung gehalten.

Fachlicher Hintergrund zu Universalindikatorfarben: [American Chemical Society – pH and Color Change](https://www.acs.org/middleschoolchemistry/lessonplans/chapter6/lesson8.html). Dieser optionale Informationslink ist keine Laufzeitabhängigkeit.

## Nachträgliche Designvereinfachung

Die aktuelle Oberfläche orientiert sich an der Vereinfachung zwischen der alten und der überarbeiteten Akkusimulation. Verglichen wurden deren HTML-Dateien und gespeicherte Ansichten unter `Chemie Fachseminar/Akkusimulation/.qa/`. Die Akkusimulation wurde dabei nicht verändert.

- Zwei große Ansichten: Experiment und Teilchenmodell. Die separate dritte Messwertspalte entfällt.
- Kompakter Titel; kein Untertitel, keine nummerierten Ebenenüberschriften, keine ständig sichtbare Phasenleiste und keine Startabfrage.
- Der pH-Wert steht am Messgerät. Das zugegebene Volumen steht direkt über den Dosierknöpfen.
- Kompakte Teilchenlegende; keine doppelte Na⁺-/Cl⁻-Beschriftung und keine dauernden Hinweisabsätze unter der Lupe.
- Lernaufgaben, pH-Kurve, Stoffmengen, Konzentrationen und Modellinformationen unter „Weitere Funktionen“. Teilcheninformationen erscheinen nach Auswahl.
- Begleittexte der Detailreaktion sind gekürzt; deren Modellhinweis ist eingeklappt. Atomverfolgung, Bindungswechsel und Reaktionssteuerung bleiben erhalten.

Nach der Überarbeitung erneut im Browser geprüft: tatsächliche Dosierung bis 25,0 ml und pH 7,00, vollständige Detailreaktion, optionale Vermutung und anschließender Experimentierauftrag, Öffnen der pH-Kurve aus dem Lehrkraftmodus sowie Desktop-, Tablet- und schmale Ansicht. Bei 1280 × 720 liegen die zentralen Bedienelemente ohne Scrollen im sichtbaren Bereich. Keine JavaScript-Fehler in der abschließenden Konsole. Die automatisierten Tests bestehen mit angepasster Prüfung des nun direkt sichtbaren Teilchenmodells und des optionalen Zugangs zu den Aufgaben.

Aktuelle Vorschau: `vorschau-bereinigt.jpg`. Die älteren Ansichten dokumentieren die ursprüngliche Gestaltung. Sicherung der vorherigen HTML-Datei: `neutralisationslabor-vor-designvereinfachung.html`.