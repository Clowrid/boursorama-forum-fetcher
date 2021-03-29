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

    /**
     * If company name can not be fetch, use the company code without prefix instead
     * @returns {String} name
     */
    getName() {
        if(!this.name) {
            return this.code.substring(1);
        }

        return this.name;
    }


}