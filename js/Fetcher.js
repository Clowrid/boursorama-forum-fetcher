import * as TemplateBuilder from "./TemplateBuilder.js";
import Societe from './Societe.js';
import Topic from "./Topic.js";


export {loadDataFromBoursorama};


function loadDataFromBoursorama(societe) {

    return new Promise(function (resolve) {
        // Configuration
        const corsRemoverUrl = "https://cors-anywhere-clow.herokuapp.com/";
        const baseUrl = "https://www.boursorama.com";
        const nombreDeResultatParSociete = 7;

        // Récupration des données depuis le site de boursorama

        $.ajax({
            headers: {'X-Requested-With': 'XMLHttpRequest'},
            type: 'GET',
            url: corsRemoverUrl+baseUrl + "/bourse/forum/1r" + societe.code + "/",
            crossDomain: true,
            beforeSend: function(xhr){
                xhr.withCredentials = true;
            },
            success: function(data, textStatus, request){
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
            }
        }).done(function () {
            TemplateBuilder.build(societe);
            resolve(societe);
        });
    })

}

function findCompanyName(datas) {
    let companyNameData = $(datas.find("a.c-faceplate__company-link"));
    let companyName = companyNameData.text().trim();
    if (!companyNameData) {
        console.log('Error while loading company name : '+companyNameData);
    }
}

function findCompanyVariation(datas) {
    let companyVariationData = $(datas.find("span.c-instrument.c-instrument--variation")).text();
    let companyVariation = parseFloat(companyVariationData);
    if (isNaN(companyVariation)) {
        console.log('Error while loading company variation : '+companyVariationData);
    }
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
