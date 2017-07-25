TO DO:
- Show user that data is loading (loading bar or so)
- Update climate data (maybe even a script that automates that?)

-------------------------------------------------------------------------------

Hallo Pierre,

vielen Dank für deine vielen Anmerkungen, Fehler und Wünsche. Ich hoffe, dass ich die meisten davon erfüllen kann. Bei manchen habe ich aber noch Fragen. Ich gehe mal Punkt für Punkt durch.


> 1) Wenn man bei den Rasterdatensätzen zum Beispiel 1970-1999 (30 Jahre) als Zeitraum eingibt, geht die Datenverfügbarkeitstabelle nur bis 1998.

Fehler gefunden und behoben!


> 2) Das gleiche gilt für die Überschriften in den Diagrammen. Es stellt sich die Frage welche/wieviele Werte werden dann im Hintergrund zum Rechnen genutzt? Durch wieviel Jahre teilst du bei der Bildung der Mittelwerte?

Es ist ein normales Problem in der Informatik: Nimmt man das letzte Jahr mit in die Rechnung rein oder nicht? Am Ende war es im Quellcode dreimal ein "+1", was die Lösung des Problems war. Ich hoffe, dass jetzt nicht nur die Daten in der Datenverfügbarkeitstabelle und in den Überschriften stimmen, sondern auch die Berechnungen. Kannst du vielleicht mal drei, vier Stichproben bei Klimazellen und bei Wetterstationen ziehen und schauen, ob das rechnerisch richtig ist? Bei mir sieht es so aus, aber es kann sein, dass ich mich vertan habe.


> 3) Beim Laden der Seite ist der Timeslider bei 1970-1999... bitte "schiebe" den ganz nach rechts auf den jeweils aktuellsten Teil des Datensatzes.

Erledigt.


> 4) wenn ich für einen beliebigen Ort in der Mitte des Timesliders anfasse und an verschiedene Stellen verschiebe, würde ich erwarten, dass das Zeitintervall konstant bleibt... macht es aber nicht! Mit jeder Verschiebung wird das Intervall kleiner

Fehler behoben.


> 5) Gab es nicht schonmal eine Funktionalität die automatisch in die Karte gezoomt hat, wenn ich in einem sehr kleinen Maßstab einen Punkt gesetzt habe. Im umgedrehten Fall... wenn der Maßstab sehr groß ist funktioniert das ja schon.

Möchtest du das wirklich so haben? Das würde bedeuten, dass bei jedem Klick in die Karte die aktuelle Klimazelle vergrößert dargestellt wird. Wenn du hin und her klicken möchtest, müsstest du vorher immer noch herauszoomen. Wenn das das gewünscht Verhalten ist, kann ich das gern so einbauen, aber ich bin diesbezüglich etwas unsicher. Wenn ich Donnerstag oder Freitag wieder da bin, können wir uns das ja mal gemeinsam anschauen.


> 6 ) Das bei der Auswahl einer Station sich der rechte Frame ändert ist gut. Allerdings sollte sich in dem Frame auch der Titel der Datenquelle befinden (wie zum Beispiel auch beim CRU-Datensatz)

Ist eingebaut.


> 7) Wenn ich die Station in Koltzsche auswähle (1942-2013) wird ein Diagramm erzeugt von 1951-2021... incl. Einer Datenverfügbarkeitstabelle, die mir sagt, dass im November 2020 keine Niederschlagsdaten vorliegen werden. Wenn ich dann den Zeitbalken in der Mitte anfasse und verschiebe, werden plötzlich auch die Daten angezeigt, die der eingestellten Periode entsprechen. Dieser Effekt tritt nicht immer auf! Ich habe nicht rausbekommen woran das liegt. Anbei eine Screenshot für die Antarktisstation Molodeznaja (climatecharts_4.png). Es scheint so zu sein, wenn ich bei einer Station die vordere Grenze des Intervalls zeitlich ganz nach vorn verschiebe entsteht dieser Effekt.

Hier wollte ich einmal besonders schlau sein, war aber besonders doof: Ich wollte automatisch berechnen, in welchem Jahr des ausgewählten Zeitraums das erste und letzte Mal Daten vorliegen und so den ausgewählten Zeitraum anpassen. Das ist mir etwas misslungen. Außerdem habe ich festgestellt, dass das für den/die Nutzer/in recht unübersichtlich sein kann, wenn in der ausgewählten Periode etwas anderes steht als in den Diagrammtiteln und der Datenverfügbarkeitstabelle. Also habe ich jetzt den ganz naiven Ansatz wieder genommen: Für den Zeitraum, der in der Zeitleiste eingestellt ist, werden die Daten angezeigt - egal, ob welche da sind oder nicht. Ist das so in Ordnung? Wünschst du dir hierbei mehr?


> 8) Das Umstellen der Rasterdatensätze geht heute Morgen eigentlich recht fix. Wäre es möglich dem Nutzer zu zeigen, dass ein neuer Datensatz geladen wird. Sanduhr oder was vergleichbares modernes?

Ja, das wäre es. Aber das schaffe ich heute nicht mehr. Ich versuche es morgen.


> 9) Die Stationsdaten gehen derzeit nur bis Ende 2012. Ist das der aktuellste Datensatz?

Stimmt nicht ganz, die Stationsdaten, z.B. von DD-Klotzsche, reichen momentan bis Ende 2014. Ich habe gerade mal im GHCN geschaut, dort dauert es immer eine Weile, bis neue Daten drin sind. Ich könnte, wenn du magst, die Daten mal aktualisieren. Das kann aber ein bisschen dauern, da ich das lange nicht mehr gemacht habe. Soll ich das mal in Angriff nehmen?


> 10) Rasterdatensätze für 50.623/15.331 ... wenn ich vom Cru auf GHCN umstelle geht das schnell... stelle ich weiter auf Delaware um geht das auch noch recht fix... will ich dann zurück zu GHCN passiert nix mehr.

Kann ich leider nicht reproduzieren. Bei mir funktioniert es. Ich weiß leider nicht, woran es liegt, aber ich habe das Gefühl. hier ganz tief in die Serverkomponenten reinbohren zu müssen, um zu verstehen, warum es manchmal lange dauert und manchmal nicht. Das wird bis Freitag aber auch eng.


> 11) Niederschlagssummen und mittlere Temperaturen bitte nur mit einer Nachkommastelle.

Erledigt.


> Link der Datenquelle zeigt ins nichts!
> 12) Station Legnica BArto: Wenn ich als Periode 1948.1982 angebe, werden mir Daten bis 1984 angezeigt. Irgendwas scheint zwischen dem Zeitbalken und der Anzeige in den Diagrammen noch nicht richtig zu funktionieren. Hier scheint aber auch keine Systematik erkennbar zu sein. Wichtig ist vor allem auch, dass sichergestellt ist, dass die Rechnungen die im Hintergrund erfolgen richtig sind und nicht nur das die Jahreszahlen die angezeigt werden, stimmen. Im Anhang ein Beispiel einer Station in London.
> 13) Überschriften (Orte) in den Boxplots/Datentabelle fehlen (bei Rasterdaten) --> das Problem tritt aber nicht immer auf. Am Gazetteer kann es eigentlich nicht liegen, da der Ort im Klimadiagramm angezeigt wurde
> 14) Datenverfügbarkeitstabelle bräuchte noch eine Überschrift (Availability of Data ???) und evtl ganz unten eine Legende (Temperature Available / Precepitation Available / Not Available)
> 15) lässt es sich noch irgendwie einrichten, dass die Diagramme zum download zur Verfügung stehen. Als einfache Rasterdaten.
> 16) Die beiden Menüs Dataset und About sind nicht verfügbar.
> 17) In der derzeitigen online-Version findet sich rechts immer noch ein frame der kurz auf den jeweils ausgewählten Datensatz hinweist. Das finde ich eigentlich ganz gut und würde es gern beibehalten
> 18) im Norden von Russland gibt es Orte (climatecharts_3.png) die haben Nordkoordinaten von >90°   ---> sowas gibt’s nicht. Wenn ich das gleiche im Norden Nordamerikas mache, bekomm ich eine Angabe von -73°S ?!?! (climatecharts_5.png) Außerdem ist das Koordinatenpaar verdreht. Erst N/S dann E/W. Ich vermute, dass hier auch der Fehler liegt. Ich vermute es soll -73°E sein, was aber eigentlich 73°W sind.
>
> Soweit erstmal...
>
> Grüße
> Pierre
