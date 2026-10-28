# Veszélyzóna – Kolóniafront: Windows 3D prototípus

Godot 4-es, offline játszható, AI elleni valós idejű stratégiai tesztpálya. A projekt jelenleg eredeti, futás közben létrehozott Godot mesh-eket használ; nem igényel vásárolt vagy külső játék-assetet.

## Követelmény

- Windows 10 vagy 11, 64 bites
- Godot Engine 4.3 vagy újabb (ingyenes)

## Indítás szerkesztőből

1. Töltsd le a repository `codex/windows-godot3d-pve-prototype` ágának ZIP-fájlját, és csomagold ki.
2. A Godot Project Managerben válaszd az **Import** lehetőséget, majd jelöld ki a `prototype-godot/project.godot` fájlt.
3. Nyisd meg a projektet, majd nyomd meg az **F5** gombot (Run Project).

## Irányítás

- **Bal egérgomb:** egység kijelölése (Ctrl-lal több egység hozzáadható)
- **Jobb egérgomb:** kijelölt egységek mozgatása, pont elfoglalása vagy ellenség támadása
- **WASD:** kamera mozgatása
- **Középső egérgomb húzása:** kamera forgatása
- **Q / E:** kamera forgatása
- **R / F:** kamera döntése
- **Egérgörgő:** nagyítás/kicsinyítés
- **B:** laktanya építése
- **T:** gyalogosraj képzése
- **V:** járműtelep építése
- **Y:** harckocsi képzése

A pontfoglaláshoz gyalogos egységnek kell a jelölt körzetben tartózkodnia. Ellenséges jelenlét vitatottá teszi a foglalást. A pontok nyersanyagot, utánpótlást vagy győzelmi pontot adnak; a kapcsolat megszakítása ellátási hátrányt okoz. A teljes meccs helyi folyamatban fut, internet és fiók nélkül.

## Windows futtatható fájl készítése

Godotban: **Project → Export → Add… → Windows Desktop → Export Project**. Ehhez szükség esetén telepítsd a Godot Export Templates csomagot a szerkesztő **Editor → Manage Export Templates** menüjéből. A prototípus forrásként a projektbe importálható; előre lefordított EXE-t csak exportált buildből lehet készíteni.

## Projekt felépítése

- `project.godot` – Godot projektbeállítás
- `scenes/main.tscn` – induló jelenet
- `scripts/main.gd` – pálya, gazdaság, foglalás, harc, UI és helyi meccsszimuláció
- `scripts/strategy_unit.gd` – gyalogos/jármű egységek
- `scripts/capture_point.gd` – stratégiai pont foglalási állapota
- `scripts/camera_rig.gd` – RTS kamera
- `scripts/ai_controller.gd` – a foglalást, gazdaságot, építést, képzést, utánpótlás-védelmet és támadást ugyanazokon a parancsokon keresztül végző AI
- `ASSET_LICENSES.md` – a prototípus eszközeinek és licencének jegyzéke

Ez korai graybox prototípus. A teljes négy AI-nehézség választható; a mérkőzés közös AI- és játékszabály-motorja későbbi kooperatív PvE-hez és 1v1/2v2/3v3 multiplayerhez bővíthető. A prototípus önmagában offline fut, fiók vagy hálózati kapcsolat nélkül. A mentés, végleges 3D modellek, animációk és hangok későbbi fejlesztési mérföldkövek.
