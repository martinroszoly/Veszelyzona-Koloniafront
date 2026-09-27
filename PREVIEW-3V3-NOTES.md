# Terra-Prime 3v3 Kontinensfront — gameplay preview v2

Ez a build **a projekt része**, és a főmenü külön `3v3 PREVIEW` gombjáról megnyitható, de szándékosan **nincs hozzáadva a normál pályaválasztóhoz**. A három meglévő pálya térképe, mezőadatai, kezdőpozíciói és játékmeneti kódja változatlan maradt.

## Indítás
Nyisd meg az `index.html` fájlt, majd válaszd a `3v3 PREVIEW` gombot, vagy közvetlenül a `preview-3v3.html` fájlt.

## Pálya és koordinátarendszer
- 237 stabil azonosítójú, tényleges polygon mező.
- 165 sűrűn felosztott központi kontinensmező.
- 6 × 12 kezdőszigeti mező.
- Minden szigeten 1 nagyobb fővárosi polygon, 3 falu, 2 bánya, 1 olajmező, 1 erőmű, 1 technológiai pont, 1 kikötő, 1 ipari és 1 semleges mező.
- A központi kontinens kb. 9,7× nagyobb egy kezdőszigetnél.
- A háttér a projekt meglévő Terra-Prime / Teljes kontinensfront részletes terepgrafikájából készített 3v3-kompozíció: utak, folyók, települések, hegyek és ipari részletek láthatók a polygonréteg alatt.
- A hat sziget és a kontinens között 6 logikai tengeri kapcsolat biztosítja a pálya összefüggőségét.
- A polygon, az egység, a létszám, a nyersanyagjelölő, a mozgásjelölő és a támadásjelölő ugyanazt az SVG 1728×864 koordinátarendszert használja.
- Minden mező `anchor` pontja a saját polygonja belsejében van; ebből számolódik az egység és a marker pozíciója.

## Kamera és mobil
- Egérgörgő: zoom.
- Egérhúzás: pan.
- **W / A / S / D** és nyílbillentyűk: folyamatos kameramozgatás.
- Mobilon kétujjas pinch: zoom.
- Mobilon egyujjas húzás: pan.
- Rövid érintés: mezőkijelölés vagy érvényes mozgás/támadás végrehajtása.
- A kamera csak az SVG `viewBox`-át módosítja; a HUD, panelek és gombok nem zoomolnak a térképpel.

## 3v3 játékmenet
- Bal csapat: Kék (játékos), Zöld (AI), Sárga (AI).
- Jobb csapat: Lila (AI), Piros (AI), Rózsaszín (AI).
- A hat főváros már induláskor a saját játékosszínével van kitöltve.
- A semleges zsoldosok minden semleges mezőt védhetnek, de a zsoldos ikon csak a kijelölt semleges mezőn jelenik meg.
- A saját egység kijelölésekor csak ténylegesen szomszédos célmezők kapnak mozgás- vagy támadásjelölőt.
- A saját egységek az elfoglalt mező `anchor` pontján állnak, a létszám közvetlenül mellettük/alattuk látszik.
- A fővárosban gyalogság, tank és csapásmérő erősítés gyártható a megszerzett nyersanyagokból.
- A nyersanyagmezők körönként termelnek ellátmányt, fémet, olajat, energiát és technológiát.

## Harcbalansz
- A csapásmérő általános támadóereje jelentősen magasabb a gyalogságénál.
- Csapásmérő → gyalogság matchup szorzó: 2,15×.
- Csapásmérő → tank matchup szorzó: 0,34×.
- Tank → csapásmérő matchup szorzó: 1,72×.
- A tank magas védelmi értéket kapott, így egyetlen normál csapásmérő kötelék nem töröl el könnyen tankos alakulatot.

## AI
Mindkét oldal ugyanazt a prioritási elvet használja:
1. területfoglalás;
2. ellenséges egységek kiiktatása.

A pontozás külön értékeli a semleges mezőket, bányákat, olajmezőket, erőműveket, technológiai pontokat, kikötőket/átjárókat és a saját területeket összekötő mezőket. Az AI visszafordulási büntetést kap, ezért kevésbé hajlamos fölösleges oda-vissza mozgásra.

Hard fokozaton nagyobb a terjeszkedési és stratégiai súly, erősebben értékeli az erőforrásmezőket és összekötő mezőket, figyeli a főváros körüli fenyegetést, és kedvezőtlen támadásokat nagyobb eséllyel kerül. A nehézség nem ad ingyen nyersanyagot: ugyanazokból a területbevételekből és ugyanazokkal a gyártási költségekkel működik.

## Ellenőrzés
A `PREVIEW-3V3-VALIDATION.txt` tartalmazza az automatikus geometriai, gráf-, kamera-, marker-, AI- és balanszellenőrzések eredményét. A jelenlegi csomag 32/32 ellenőrzést teljesít.
