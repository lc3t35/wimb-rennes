wimb-rennes
===========

Where is my bus in Rennes ? (Breizhcamp 2013 lab)
-----------
Available live at wimb-rennes.meteor.com
-----------

ATTENTION :

Modifier la clé d'API KEOLIS dans le fichier server/credentials.js

Modifier la clé googlemaps API dans le fichier wimb.html

----------------------

Chaque commit correspond à une étape du lab :

setup : mise en place de l'environnement

routes : meteor add d3 -> ajout de la liste des routes à droite

stops : meteor add http -> affichage de la ligne sélectionnée et des arrêts sur le bandeau et sur la carte sous forme de marqueurs

infowindow : ajout des infobulles pour chaque arrêt

destination : traitement du sens inverse de la ligne

subscribe : suppression de l'autopublish

Pour activer chaque étape : git checkout nom_de_l_etape
