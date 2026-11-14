# Sandro-Korpus

Kopierbare Fälle je Kategorie. Anwendung: **ein Feld falsch, alle anderen gültig**, Soll je
Kategorie in [SKILL.md](../SKILL.md) → „Gegen das Soll prüfen". Große Werte werden erzeugt,
nicht eingefügt; Beispiele in PHP und TypeScript.

```php
str_repeat('A', 5000);          // über jedem üblichen max
str_repeat('A', 70000);         // über TEXT (64 KiB) in MySQL
"12345\n12345\n12345\n12345\n12345"; // 5 Zeilen in der PLZ
```
```ts
'A'.repeat(5000); 'A'.repeat(70000);
Array.from({ length: 5 }, () => '12345').join('\n');
```

## 1. Größe und Form

| Fall | Wert | Trifft |
|---|---|---|
| Übergröße | 5 000 / 70 000 Zeichen | fehlendes `max`, Spalte zu kurz (500), Layout |
| genau an der Grenze | `max`, `max + 1` | Off-by-one zwischen Frontend, Backend, DB |
| mehrzeilig in Einzeiler | `"12345\n12345"` | PLZ, Name, Betreff, Header-Felder |
| nur Leerraum | `"   "`, `"\t"`, `"\u00A0"` (NBSP) | `required` ohne Trim, NBSP wird nicht getrimmt |
| führender/abschließender Umbruch | `"12345\n"`, `"\n12345"` | Regex mit `$` statt `\z` (PCRE-`$` passt vor finalem `\n`) |
| leer vs. fehlend vs. `null` | `""`, Feld weggelassen, `null` | `nullable` vs. `required` vs. `sometimes` |

## 2. Steuerzeichen und Unicode

| Fall | Wert | Trifft |
|---|---|---|
| NUL-Byte | `"abc\u0000def"` | PostgreSQL lehnt `0x00` in Text ab → 500; C-Bibliotheken schneiden ab |
| Steuerzeichen | `"\u0007"`, `"\u001B[31m"` (ANSI), `"\r"` | Logs, Terminals, CSV |
| Emoji / 4-Byte | `"😀"`, `"👨‍👩‍👧‍👦"` (ZWJ-Folge) | MySQL `utf8` (3 Byte) statt `utf8mb4`; Längenzählung |
| Kombinationszeichen | `"e\u0301"` vs. `"é"`; `"Z̴̡̛͉a̵l̷g̸o̶"` | NFC/NFD-Dubletten, Höhe sprengt Layout |
| RTL-Override | `"abc\u202Etxt.exe"` | Anzeige dreht sich, Dateinamen täuschen |
| Zero-Width | `"ad\u200Bmin"`, `"\uFEFF"` | unsichtbare Dubletten bei Namen/Slugs |
| Homoglyphen | `"аdmin"` (kyrillisches а) | Verwechslung von Konten, Slugs, Domains |
| ungültiges UTF-8 | Bytes `\xC3\x28` | `json_encode` scheitert → 500 |

Längenfrage: HTML-`maxLength` zählt UTF-16-Einheiten, PHP `mb_strlen` Codepoints, die DB je
nach Typ Zeichen oder Bytes — dieselbe Eingabe kann an einer Ebene passen und an der nächsten
nicht.

## 3. Falsche Typen (JSON-Body)

```json
{ "zip": ["12345"] }
{ "zip": { "a": 1 } }
{ "zip": 12345 }
{ "zip": true }
{ "zip": null }
{ "qty": "5" }
{ "qty": "5abc" }
```
Trifft: `max` ohne `string` (zählt dann Array-Elemente), Code, der `strtoupper()`/`trim()` auf
ein Array ruft (TypeError → 500), lose Vergleiche, `"5abc"` als Zahl.

## 4. Zahlen

| Fall | Wert | Trifft |
|---|---|---|
| negativ / null | `-1`, `0`, `-0` | Mengen, Preise, Rabatte, Seitengröße |
| riesig | `1e308`, `1e309` (wird INF), `9223372036854775808` (> `PHP_INT_MAX`) | Float-Überlauf, `json_encode(INF)` scheitert, Bigint-Spalte |
| keine Zahl | `"NaN"`, `"Infinity"`, `""` | `is_numeric`, JS `Number()` |
| Dezimaltrenner | `"12,50"` vs. `"12.50"`, `"1.234,56"` | Locale-Parsing, Tausendertrenner |
| Geld als Float | `0.1 + 0.2`, `19.999` | Rundung — Geld nur als Cent-Integer |
| Seitengröße | `per_page=100000` | ungebremste Abfrage, Speicher |

## 5. Struktur und Größe

| Fall | Erzeugen | Trifft |
|---|---|---|
| tiefes JSON | `'['.repeat(10000) + ']'.repeat(10000)` | Parser-Tiefe, Rekursion |
| viele Schlüssel | `Object.fromEntries(Array.from({length:100000},(_,i)=>['k'+i,1]))` | Hash-Kosten, Speicher |
| großer Body | 50 MB Payload | fehlendes Body-Limit (Webserver, PHP `post_max_size`) |
| langes Array | `tags: Array(100000).fill('x')` | `array` ohne `max`, N Inserts |
| unerwartete Felder | `{ "role": "admin", "is_admin": true }` | Mass Assignment |

## 6. Injection-Marker

Erwartung: als **Text** gespeichert (wo fachlich erlaubt), bei jeder Ausgabe escaped; in
Formatfeldern (PLZ, Datum, Betrag) abgelehnt.

| Ziel | Marker |
|---|---|
| SQL | `' OR '1'='1`, `'; DROP TABLE users; --`, `1 UNION SELECT NULL--` |
| HTML/XSS | `<script>alert(1)</script>`, `<img src=x onerror=alert(1)>`, `<svg onload=alert(1)>` |
| Attribut-Ausbruch | `" autofocus onfocus="alert(1)`, `' onmouseover='alert(1)` |
| URL-Schema | `javascript:alert(1)`, `data:text/html,<script>alert(1)</script>` |
| Template | `{{7*7}}`, `${7*7}`, `{!! '<b>x</b>' !!}`, `@php echo 1; @endphp` |
| CSV-Formel | `=1+1`, `=HYPERLINK("http://example.invalid","x")`, `+1`, `-1`, `@SUM(1)` |
| Pfad | `../../etc/passwd`, `..%2f..%2f`, `C:\Windows\win.ini`, `file.txt%00.png` |
| Header/CRLF | `"x\r\nSet-Cookie: a=b"`, `"a@b.de\r\nBcc: c@d.de"` (Mail-Header) |
| LDAP | `*)(uid=*))(|(uid=*` |
| Log | `"x\n[2026-01-01] ERROR fake"` |

`example.invalid` ist eine reservierte Testdomain; nie echte Fremd-URLs als Ziel einsetzen.

## 7. Datei-Uploads

| Fall | Trifft |
|---|---|
| falscher MIME bei passender Endung (`.png`, Inhalt Text/PHP) | Prüfung nur auf Endung |
| Doppelendung `bild.php.png`, `bild.png.php` | Webserver führt aus |
| SVG mit `<script>` | gespeichertes XSS beim Ausliefern |
| 0 Byte | Bildverarbeitung, Vorschau |
| riesig (über Limit), Zip-Bombe | Speicher, Platte, Entpacker |
| Dateiname 300 Zeichen, mit `../`, Unicode, RTL-Override | Dateisystem, Anzeige, Pfad |

## 8. Wiederholung und Flut

| Fall | Soll |
|---|---|
| Doppel-Submit (zweimal schnell klicken, Enter + Klick) | ein Effekt |
| Replay desselben Requests | ein Effekt (Idempotenz-Schlüssel) |
| 100 Requests in kurzer Folge (nur lokal/Staging) | 429 ab dem Limit |
| paralleler Submit (zwei Tabs) | keine Dublette (Unique-Constraint, Lock) |

## 9. IDs

| Fall | Soll |
|---|---|
| UUID eines fremden Kontos | 403 (bzw. 404 nach Konvention) |
| keine UUID (`abc`, `1`, `' OR 1=1`) | 404/422, nie 500 (PostgreSQL wirft bei `uuid`-Spalte) |
| fortlaufende Zahl statt UUID | keine Enumeration möglich |
| gelöschtes Objekt (Soft Delete) | 404, nicht sichtbar |
