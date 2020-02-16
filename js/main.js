import * as Fetcher from './Fetcher.js';
import * as TemplateBuilder from './TemplateBuilder.js'
import Societe from './Societe.js';


$(document).ready(async function() {

    let societeCodes = ['AURW','PFP','PLI','PICAD','PFLY','PCARM','PCOV', 'PCOVH','PINEA','EPCBOT','PMERY','PIMDA'];
    let listeSociete = [];
    let listePromesse = [];

    societeCodes.forEach(function(societeCode) {
        let societe = new Societe(societeCode);
        let newSociete = Fetcher.loadDataFromBoursorama(societe)
        listePromesse.push(newSociete);
    });

    listeSociete = await Promise.all(listePromesse);

    console.log(listeSociete);


});


