import * as Fetcher from './Fetcher.js';
import * as TemplateBuilder from './TemplateBuilder.js'
import Societe from './Societe.js';

$(document).ready(async function() {

    // call config url to get env variables into a json
    let configPromise = Fetcher.loadConfig();
    let config = await Promise.resolve(configPromise);
    let societeCodes = config.SOCIETES.split(',');
    let corsProxyURL = config.CORSREMOVEURL;
    let listeSociete = [];
    let listePromesse = [];

    societeCodes.forEach(function(societeCode) {
        let societe = new Societe(societeCode);
        let newSociete = Fetcher.loadDataFromBoursorama(societe,corsProxyURL)
        listePromesse.push(newSociete);
    });

    listeSociete = await Promise.all(listePromesse);
    $('.loader').remove();
    console.log(listeSociete);
});


