# Performance-Analyse - Mobile Ladezeit Probleme

## 🔴 Kritische Probleme (sofort beheben)

### 1. Blockierende Skripte im Head
**Problem:** GSAP, ScrollTrigger und SplitText werden synchron im `<head>` geladen und blockieren das Rendering.

**Aktueller Code:**
```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
<script src="https://assets.codepen.io/16327/SplitText3.min.js"></script>
```

**Lösung:** 
- Skripte ans Ende des `<body>` verschieben ODER
- `defer` Attribut hinzufügen (für Skripte, die auf DOM warten müssen)
- SplitText kann eventuell lazy geladen werden

### 2. Erstes Video wird sofort geladen
**Problem:** In `main.js` Zeile 1881-1883 wird das erste Video (Index 0) sofort beim Laden geladen, obwohl `preload="none"` gesetzt ist.

**Aktueller Code:**
```javascript
if (index === 0) {
    // ...
    if (videoSources[0]) {
        loadAndPlayVideo(0); // ❌ Lädt sofort!
    }
}
```

**Lösung:** Video erst laden, wenn es sichtbar wird (Intersection Observer) oder beim ersten Hover.

### 3. Kein Lazy Loading für Bilder
**Problem:** Alle Bilder werden sofort geladen, auch die unterhalb des Viewports.

**Betroffene Bilder:**
- `images/image.png` bis `images/image 5.png` (5 große Screenshots)
- Alle Logos werden sofort geladen

**Lösung:** 
- `loading="lazy"` Attribut zu allen `<img>` Tags hinzufügen
- Für Bilder oberhalb des Viewports: `loading="eager"` oder weglassen

### 4. Externe Font blockiert Rendering
**Problem:** Font wird von CDN geladen und blockiert das Rendering.

**Aktueller Code:**
```css
@import url('https://fonts.cdnfonts.com/css/switzer');
```

**Lösung:**
- Font lokal hosten
- `font-display: swap` verwenden
- ODER Font mit `<link rel="preconnect">` vorladen

### 5. Große unminifizierte Dateien
**Problem:** 
- CSS: 120KB (nicht minifiziert)
- JS: 117KB (nicht minifiziert)

**Lösung:** 
- CSS und JS minifizieren
- Unused CSS entfernen (PurgeCSS)
- Code-Splitting für JS

## 🟡 Mittlere Probleme

### 6. Viele HTTP-Requests
**Problem:** Alle Assets werden einzeln geladen (kein Bundling).

**Lösung:**
- CSS/JS zusammenfassen wo möglich
- Sprites für kleine Icons
- HTTP/2 Server Push (falls möglich)

### 7. Keine Bildoptimierung
**Problem:** 
- PNG/JPEG ohne WebP-Varianten
- Keine responsive Bilder (`srcset`)
- Möglicherweise zu große Dateien

**Lösung:**
- WebP-Varianten erstellen
- `srcset` für responsive Bilder
- Bilder komprimieren (TinyPNG, ImageOptim)

### 8. JavaScript läuft sofort
**Problem:** `main.js` (117KB) wird sofort ausgeführt, auch wenn nicht alle Features sofort benötigt werden.

**Lösung:**
- Code-Splitting
- Non-kritische Features lazy laden
- Event-Listener mit `{ passive: true }` für Scroll-Events

## 📊 Geschätzte Verbesserung

**Aktuell (geschätzt):**
- First Contentful Paint: ~3-5 Sekunden (Mobile 3G)
- Time to Interactive: ~8-12 Sekunden (Mobile 3G)

**Nach Optimierungen:**
- First Contentful Paint: ~1-2 Sekunden
- Time to Interactive: ~3-5 Sekunden

## 🎯 Prioritäten

1. **Sofort:** Skripte mit `defer` versehen oder ans Ende verschieben
2. **Sofort:** Lazy Loading für Bilder hinzufügen
3. **Sofort:** Erstes Video nicht sofort laden
4. **Hoch:** Font-Optimierung
5. **Mittel:** CSS/JS minifizieren
6. **Mittel:** Bildoptimierung (WebP, Kompression)

