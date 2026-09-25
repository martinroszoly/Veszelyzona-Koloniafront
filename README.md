# Veszélyzóna: Kolóniafront

Böngészőben futó stratégiai prototípus.

## Indítás

Nyisd meg az `index.html` fájlt böngészőben, vagy használd a VS Code Live Server bővítményt.

## Prototípus funkciók

- két választható, képpel előnézhető 65 szektoros hadszíntér: Zöld front és Jégfront;
- emberi és idegen frakció;
- gyakorló, easy, medium és hard AI;
- kék emberi, piros idegen, szürke semleges szektorok;
- egymezős látótávolság és ködösítés;
- saját egység kijelölése és szomszédos szektor elfoglalása;
- alakulatlétszám és morál: a harci veszteség a tényleges egységszámot csökkenti;
- több egységtípus és alap szektorfoglalási állapot.
- a csata elején mindkét fél pontosan egy védett főszektorról indul;
- egységenként körönként legfeljebb egy lépés vagy támadás, választható összevonással;
- a kijelölt egység mellett irányjelzők mutatják az elérhető szomszédos szektorokat;
- a főszektor saját parancsnoki ablaka: építkezés, képzés, gyártás, telepítés és fejlesztés;
- laktanya, járműgyár és légibázis nélkül nem képezhető megfelelő egység;
- kör végén elkészülő gyártási sor, majd külön telepítés saját szektorba;
- helyi szektorfejlesztések a nyersanyagtermeléshez;
- az AI a játékos köre után, egyesével és látható útvonaljelzéssel hajtja végre a lépéseit.
- a mozgási nyíl önálló parancs: üres mezőre áthelyez, ellenségesre támad, baráti őrségnél összevonást kér;
- a térképen minden látható szektor neve és nyersanyaga megjelenik;
- az ellenfél teljes kiesésekor VICTORY képernyő jelenik meg, majd a játék visszatér a főmenübe.
- a két főváros a térkép átellenes oldalán áll, mindkét fél 1000 fős gyalogsággal kezd;
- minden semleges szektort zsoldos őrség véd, ezért az előrenyomulásért harcolni kell;
- az AI nehézségtől függően laktanyát, járműgyárat és légibázist épít, eltérő ütemben képez és telepít egységeket.
- a megtámadott alakulat létszámvesztesége a mező felett külön jelzéssel is látszik;
- rövid, frakció- és egységtípus-függő mozgás- és támadáshangok, valamint kapcsolható szintetizált háttérzene;
- a szektorok széles, rendezett stratégiai elrendezést, külön ikont, létszámot és nyersanyagjelölést kaptak.


V23: elfogadott EMBER/XENON főmenüháttér; a képbe égetett menü teljes fedése; 3 db 3584x1800 ultra csatatér; valódi régióalakot követő kék/piros/zöld/lila határvonalak; enyhébb területfestés és torzításmentes renderelés.

V25: erősebb kék/lila területfestés; teljes pályát mutató 3. és többi pályaelőnézet; CSATA gomb állandó piros állapotának megszüntetése; főmenü takarópanel lefelé meghosszabbítva.

V26: valóban különböző kontinens/jég/ipari pályaképek; lila alienAlly területfestés javítva és erősítve; egységképek szorosabb transzparens kivágással és élesítéssel; térképi ikonok enyhén kisebbek.

V28: kizárólag a hiányzó legnagyobb grandfront/2v2 pálya visszaállítása a harmadik pályahelyre, 3584×1800 HQ képpel. Az első két pálya és a többi rendszer változatlan.

V29: egységlétszám lejjebb helyezve; teljes csata-HUD modernizálva; nyersanyagkártyák és termelési sorok ikonokat kaptak; finom EMBER/XENON paneldekoráció. Pályák és játékmenet változatlan.

V30: kék és lila főfrakciós mezők enyhén erősebbek; a teljes csata HUD újratervezve Colony Front Command Deck stílusra (EMBER cián/XENON vörös, új felső konzol, oldalpanelek, taktikai térképkeret, alsó parancssáv, nyersanyagmodulok). Funkciók és pályák változatlanok.

V31: kék/lila területkitöltés erőssége a zöld/piros szintjére állítva; AI gyártás és telepítés külön körre választva; az első két pálya ugyanaz maradt, de új 3584×1800 HQ részletkiemelt assetet kapott, hogy a falvak/utak/terep jobban látszódjon.

V32: egységikonok fehér/majdnem-fehér és világos semleges háttere alfa-csatornára tisztítva; világos perem-halo csökkentve; egységkép konténerek háttere kényszerítetten átlátszó.
