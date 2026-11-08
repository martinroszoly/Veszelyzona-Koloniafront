# Veszélyzóna – Kolóniafront (új Godot projekt)

Ez a frissen létrehozott projekt a `Veszelyzona_Koloniafront_TELJES_TERV_2026-11-07.pdf` alapján indul. Célplatform: Windows PC. Motor: Godot 4.7.2, normál GDScript. A régi böngészős projekt és a `prototype-godot` könyvtár nem része ennek a projektnek, és nem módosult.

## 1. szakasz állapota

Elkészült az önálló Godot projekt, induló 3D jelenet, procedurálisan kirakott természetes terep graybox, erdőcsoportok, utak, sziklák, alap napfény/égbolt, valamint rögzített dőlésszögű, teljesen forgatható, mozgatható és nagyítható RTS kamera.

Ez az első indíthatósági szakasz. Még nincs benne egység, foglalható pont, gáztermelés, harc, AI, Fog of War, minimap, hátország menü vagy többjátékos mód. Ezeket a terv szerinti későbbi szakaszokban, a felhasználói teszteredmény után kell hozzáadni. Nem állítjuk, hogy ez a minimális jelenet már futtatva lett: az elkészítési környezetben ellenőrizni kell Godot 4.7.2 alatt.

## Indítás Windows alatt

1. Töltsd le az `veszelyzona-godot47-new` ág ZIP-jét, majd csomagold ki.
2. Telepítsd/indítsd el a Godot 4.7.2 normál szerkesztőjét.
3. A Project Managerben válaszd az **Import** gombot, majd jelöld ki a `godot47-fresh/project.godot` fájlt.
4. Nyisd meg a projektet, és nyomd meg az **F6**-ot az aktuális tesztjelenet futtatásához, vagy az **F5**-öt a főjelenethez.

## Kamera

- **WASD / nyilak:** kamera mozgatása
- **Shift:** gyorsabb mozgás
- **Középső egérgomb húzása:** 360°-os vízszintes forgatás
- **Egérgörgő:** nagyítás/kicsinyítés
- **Dőlésszög:** rögzített

## Licenc és eszközök

A terep és a látványelemek futás közben alap Godot mesh primitívekből jönnek létre. Külső játékassetet vagy fizetős szolgáltatást nem használ a projekt.
