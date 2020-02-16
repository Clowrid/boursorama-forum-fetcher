import Topic from "./Topic.js";
export default class Societe {

    constructor(code) {
        this.name = 'Societe non définie';
        this.code = code;
        this.variation = 0;
        this.topics = [];
    }

    addTopic(topic) {
        this.topics.push(topic);
    }


}