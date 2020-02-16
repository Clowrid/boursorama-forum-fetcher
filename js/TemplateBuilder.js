import Topic from "./Topic.js";
import Societe from "./Societe.js";

export {build};


function build(societe) {
    // Ajout d'un bloc dédiée à la société dans l'interface
    let blocSociete = '<div class="bloc-societe bloc-societe-'+societe.code+'"><h3>'+societe.name+' '+formatCompanyVariation(societe.variation)+'</h3>'+'<div>';
    $(blocSociete).appendTo($('#links'));

    for(let topic of societe.topics) {
        let lnk = '<div><a target="_blank" href="' + topic.linkUrl + '">' + topic.title + '</a> (' + formatDateLastMessage(topic.date) + ')<div>';
        $(lnk).appendTo($("#links").find('.bloc-societe-' + societe.code).first());
    }
}


function formatDateLastMessage(dateMessage) {
    return (dateMessage.length > 8) ? dateMessage : "<span class='new'> /!\\ " + dateMessage + "</span>";
}

function formatCompanyVariation(variation) {
    return (variation > 0) ? '<span class="up">' + variation + '%</span>' : '<span class="down">' + variation + '%</span>';
}
