import * as TemplateBuilder from "./TemplateBuilder.js";
import Societe from './Societe.js';
import Topic from "./Topic.js";


export {loadDataFromBoursorama};


function loadDataFromBoursorama(societe) {

    return new Promise(function (resolve) {
        // Configuration
        const baseUrl = "https://www.boursorama.com";
        const nombreDeResultatParSociete = 7;

        // Récupration des données depuis le site de boursorama
        $.get(baseUrl + "/bourse/forum/1r" + societe.code + "/", function (data) {

            let urlData = $.parseHTML(data);
            let datas = $(urlData);
            let topics = findTopics(datas);
            let dateLastMessage = findDateLastMessage(datas);
            let numeroMessage = 0;

            societe.name = findCompanyName(datas);
            societe.variation = findCompanyVariation(datas);

            $.each(topics, function (idx, item) {

                let newTopic = new Topic();
                let topic = $(item);
                $.each(topic.find('a[href]'), function (idx, link) {
                    if($(link).text() !== '1' && $(link).text() !== '2' && $(link).text() !== '3') {
                        newTopic.linkUrl = baseUrl + $(link).attr("href");
                        newTopic.title = $(link).text();
                        newTopic.date = getDateLastMessage(dateLastMessage, numeroMessage);
                    }
                });

                numeroMessage = numeroMessage + 2;
                societe.addTopic(newTopic);

                // On limite le nombre de résultat par société
                if (numeroMessage > (nombreDeResultatParSociete * 2)) {
                    return false;
                }

            })
        }).done(function () {
            TemplateBuilder.build(societe);
            resolve(societe);
        });
    })

}

function findCompanyName(datas) {
    return $(datas.find("a.c-faceplate__company-link")).text().trim();
}

function findCompanyVariation(datas) {
    return parseFloat($(datas.find("span.c-instrument.c-instrument--variation")).text());
}

function findTopics(datas) {
    return datas.find("div.c-table__date");
}

function findDateLastMessage(datas) {
    return datas.find("span.u-color-big-stone.c-table__last-message");
}

function getDateLastMessage(dateLastMessage, numeroMessage) {
    return $(dateLastMessage[numeroMessage]).text();
}
