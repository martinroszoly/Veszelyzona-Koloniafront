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
| Öt stratégiai pont | A–E pontok elhelyezve a tesztpályán |
| Időzített pontfoglalás | Körön belüli, 6 másodperces foglalás és vizuális állapot elkészült |
| Gázalapú gazdaság | 100 kezdőgáz, pontonként +2 gáz/mp és élő HUD-kijelzés elkészült |
| HÁTORSZÁG alapváltozat | 120 gázért 3 fős EMBER gyalogsági raj behívható az indulási területre |
| Rajalapú irányítás | Egy katonára kattintva a teljes raj kijelölődik és együtt kap parancsot |
| Mozgási céljelző | Jobb kattintáskor kék, animált parancsjelző jelenik meg |
| Érkezési irány megadása | Jobb gombos húzásnál iránynyíl, érkezéskor a raj a megadott irányba fordul |

## Rögzített tesztvisszajelzések – későbbi javítás

- A képernyőszéli kameramozgás érzékelési sávja 64 képpontra nőtt; felhasználói újrateszt szükséges.
- A kamera minimális zoomja 0,45-re csökkent; felhasználói újrateszt szükséges.

## A környezetben végzett ellenőrzés

A PDF 17 oldalas szövegét mind az 58 fejezeten keresztül áttekintettük. A repository `main` ágának README-jét GitHubon ellenőriztük. A Godot 4.7.2 futtatható editor ebben a végrehajtási környezetben nem volt elérhető, ezért GDScript parse, import vagy játékindítás nem állítható igazoltnak. Kérjük, hogy a Windows-os Godot 4.7.2 teszteredménye alapján folytassuk a következő kis fejlesztési lépést.
