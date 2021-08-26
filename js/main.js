import * as Fetcher from './Fetcher.js';
import * as TemplateBuilder from './TemplateBuilder.js'
import Societe from './Societe.js';


$(document).ready(async function() {

    let societeCodes = ['AURW','PTTE','PORA','PCOFA','APRX','PAI','PEN','PSCR','PCNP','PNK'];
    let listeSociete = [];
    let listePromesse = [];

    societeCodes.forEach(function(societeCode) {
        let societe = new Societe(societeCode);
        let newSociete = Fetcher.loadDataFromBoursorama(societe)
        listePromesse.push(newSociete);
    });

    listeSociete = await Promise.all(listePromesse);
    $('.loader').remove();
    console.log(listeSociete);
});


