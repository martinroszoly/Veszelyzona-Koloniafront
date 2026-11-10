# 1. fejlesztési szakasz – ellenőrzőlista

| Követelmény | Állapot |
|---|---|
| Új Godot projekt, külön mappában | Készült |
| Windows PC célplatform, Godot 4.7.2 | Beállítva a projekt leírásában |
| Induló valódi 3D jelenet | Forrás elkészült; Godot editorban még ellenőrizendő |
| Természetes terep, erdő, út, akadály | Graybox forrás elkészült; futtatás még ellenőrizendő |
| RTS kamera mozgatása | Kód elkészült; futtatás még ellenőrizendő |
| 360° vízszintes forgatás | Kód elkészült; futtatás még ellenőrizendő |
| Nagyítás/kicsinyítés | Kód elkészült; futtatás még ellenőrizendő |
| Dőlésszög rögzített | Kód nem enged dőlésbemenetet |
| Biztonságos első renderelő | OpenGL 3 / Compatibility beállítva |
| Windows build export | Nem része ennek az első ellenőrző szakasznak |
| Régi játék/Main ág érintetlen | Külön ág; csak új `godot47-fresh/` fájlok kerülnek fel |
| EMBER gyalogsági tesztegységek | 5 saját graybox egység létrehozva |
| Egységkijelölés | Bal klikk és Shift+bal klikk elkészült; futtatás ellenőrizendő |
| Keretes egységkijelölés | Bal gombos húzás, látható kijelölőkeret és Shift-hozzáadás elkészült |
| Mozgási parancs | Jobb klikkes csoportos alakzat elkészült; futtatás ellenőrizendő |
| Földhöz kötött RTS-kamera | Pályahatár, simítás és képernyőszéli görgetés elkészült |
| Nagyobb hadszíntér | 270 × 210 méteres pálya, kibővített kamera- és útvonaltervezési határokkal |
| Három csillagos célpont | V1–V3 kizárólag győzelmi pontot termel; nem ad gázt |
| Hat nyersanyagpont | G1–G6 gázt termel és az utánpótlási hálózat része |
| Időzített pontfoglalás | Körön belüli, 6 másodperces foglalás és vizuális állapot elkészült |
| Gázalapú gazdaság | 100 kezdőgáz, pontonként +2 gáz/mp és élő HUD-kijelzés elkészült |
| HÁTORSZÁG alapváltozat | 120 gázért 3 fős EMBER gyalogsági raj behívható az indulási területre |
| Rajalapú irányítás | Egy katonára kattintva a teljes raj kijelölődik és együtt kap parancsot |
| Mozgási céljelző | Jobb kattintáskor kék, animált parancsjelző jelenik meg |
| Érkezési irány megadása | Jobb gombos húzásnál iránynyíl, érkezéskor a raj a megadott irányba fordul |
| Company of Heroes-szerű fedezékalap | Homokzsákfal, automatikus rajszétosztás, zöld erős-fedezék helyek és irányba fordulás elkészült |
| Egyszerű harcrendszer | Életerő, automatikus célkeresés, lőtáv, sebzés és vörös ellenséges tesztraj elkészült |
| Fedezéki védelem | Erős fedezékből, megfelelő irányból érkező találatok sebzése 50%-kal csökken |
| Harci észlelés | 22 méteres teszt-lőtáv és fizikai látóvonal-ellenőrzés |
| Akadálykerülés | Előre irányuló érzékelés és homokzsákfal melletti oldalirányú kerülés alapja elkészült |
| Látható lövedékek | Kék és vörös világító lövedékek célkövetéssel és becsapódáskori sebzéssel |
| Első ellenséges AI | A vörös raj önállóan kiválasztja és elfoglalja a hozzá legközelebbi stratégiai pontokat |
| AI harci prioritás | Lőtávon belüli ellenfélnél megáll, céloz és visszalő, majd folytatja a korábbi útját |
| AI erősítés | Az AI a saját gázkészletéből 120 gázért háromfős rajokat hív be |
| Stabilabb akadálykerülés | Az egység 1,1 másodpercig megtartja a választott kerülési oldalt |
| Elakadás-feloldás | 0,45 másodperces elakadás után az egység kényszerített oldalirányú kerülést végez |
| Utánpótlási lánc | A saját hátország felőli nyersanyagpontokról a közeli, összefüggő saját pontokra terjed |
| Elszigetelt terület | Kapcsolat nélküli pont csökkentett +0,5 gáz/mp bevételt és halvány jelzést kap |
| Változó frontvonal | A pontok közti vonalak semleges, kék vagy vörös színnel mutatják az ellátott frontot |
| Első katonai jármű | 260 gázért behívható könnyű páncélozott jármű, külön életerővel, sebességgel és fegyverrel |
| Rácsalapú útvonaltervezés | A* útvonal készül a homokzsákfalak körül, helyi kerüléssel és elakadás-feloldással kiegészítve |
| Tesztpálya hátországi kapcsolat | EMBER a déli G3, az AI az északi G4 ponton keresztül kapcsolódik a nyersanyag-hálózathoz |
| Fog of War – első réteg | Az ellenséges egységek csak saját látótávon és tiszta látóvonal mellett jelennek meg |
| Felderítési távolság | Gyalogság 32 méter, könnyű jármű 42 méter |
| Győzelmi pontok | Mindkét oldal 0-ról indul; minden birtokolt csillagos pont másodpercenként 1 pontot ad |
| Mérkőzés vége | Az első 250 összegyűjtött pontnál teljes képernyős eredmény és új mérkőzés gomb jelenik meg |
| Egységesebb méretarány | Kisebb katonák, fák, kövek és talajfoltok; tágasabb harctéri összhatás |
| Fedezék-előnézet | Kijelölt rajjal a fedezék fölé vitt egér már jobb kattintás előtt megmutatja a kisebb zöld/sárga érkezési helyeket |
| Gyártási sor | A gyalogság 8, a könnyű jármű 14 másodperc alatt készül el; a folyamat a HÁTORSZÁG panelen látható |
| Létszámkorlát | Mindkét oldal 30 pontos keretet használ; katona 1, könnyű jármű 4 pontot foglal |
| AI-gyártás | Az ellenfél is kifizeti, kivárja és csak szabad létszámkeret esetén kapja meg az erősítést |
| Raj-visszavonulás | `R` parancsra a kijelölt raj megszakítja a harcot és 65%-os sebességbónusszal a saját hátországába fut |
| Hátországi gyógyulás | A bázis 14 méteres körzetében másodpercenként 14 életerő töltődik; a visszavonult raj 85%-nál válik újra bevethetővé |
| AI önvédelem | A 35% alatti átlagos életerejű ellenséges raj automatikusan visszavonul és regenerálódik |
| EMBER/XENON gyalogsági külső | A küldött látványterv alapján kék, felszereléses emberi páncélzat és vörös, tüskés-organikus XENON sziluett |
| Két könnyű jármű külső | EMBER lánctalpas, szögletes szállító; XENON vörös, organikus páncéltest a küldött terv alapján |
| Teljes 5–5 egységsor | Gyalogság, könnyű páncélozott jármű, tank, légi támogató egység és csapásmérő vadászgép mindkét oldalon |
| Új egységek állapota | A tank, helikopter és vadászgép működő, külön statisztikájú graybox prototípus; végleges látvány később készül |

## Rögzített tesztvisszajelzések – későbbi javítás

- A képernyőszéli kameramozgás érzékelési sávja 64 képpontra nőtt; felhasználói újrateszt szükséges.
- A kamera minimális zoomja 0,45-re csökkent; felhasználói újrateszt szükséges.
- Az elpusztult kijelölt egységek hivatkozása mozgási parancs előtt automatikusan törlődik.

## A környezetben végzett ellenőrzés

A PDF 17 oldalas szövegét mind az 58 fejezeten keresztül áttekintettük. A repository `main` ágának README-jét GitHubon ellenőriztük. A Godot 4.7.2 futtatható editor ebben a végrehajtási környezetben nem volt elérhető, ezért GDScript parse, import vagy játékindítás nem állítható igazoltnak. Kérjük, hogy a Windows-os Godot 4.7.2 teszteredménye alapján folytassuk a következő kis fejlesztési lépést.
