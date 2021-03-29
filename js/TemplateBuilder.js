import Topic from "./Topic.js";
import Societe from "./Societe.js";

export {build};


function build(societe) {
    // Ajout d'un bloc dédiée à la société dans l'interface
    let blocSociete = '<div class="col-xl-4 bloc-societe bloc-societe-'+societe.code+'"><div class="content"><h3>'+societe.getName()+' '+formatCompanyVariation(societe.variation)+'</h3>'+'</div></div>';
    $(blocSociete).appendTo($('#links'));

    for(let topic of societe.topics) {
        let lnk = '<div><a target="_blank" href="' + topic.linkUrl + '">' + topic.title + '</a> (' + formatDateLastMessage(topic.date) + ')<div>';
        $(lnk).appendTo($("#links").find('.bloc-societe-' + societe.code + " .content"));
    }
}


function formatDateLastMessage(dateMessage) {
    return (dateMessage.length > 8) ? dateMessage : "<span class='new'> /!\\ " + dateMessage + "</span>";
}

function formatCompanyVariation(variation) {
    if (isNaN(variation)) {
        return '<span></span>';
    }
    
    return (variation > 0) ? '<span class="up">' + variation + '%</span>' : '<span class="down">' + variation + '%</span>';
}
