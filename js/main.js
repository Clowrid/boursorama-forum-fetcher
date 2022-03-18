import * as Fetcher from './Fetcher.js';
import * as TemplateBuilder from './TemplateBuilder.js'
import Societe from './Societe.js';
require('dotenv').config()

$(document).ready(async function() {

    let societeCodes = process.env.SOCIETES.split('');
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


