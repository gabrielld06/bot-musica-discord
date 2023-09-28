const axios = require('axios');
const fs = require('node:fs');
const json5 = require('json5');

function formateInput(input) {
    return input.replace(' ', '+');
}

function getSection(html){
    const itemSectionRenderer = html.indexOf('itemSectionRenderer')+21;
    const continuationItemRenderer = html.indexOf('continuationItemRenderer')-4;

    return html.substring(itemSectionRenderer, continuationItemRenderer);
}


module.exports = async function ytSearch(search) {
    return new Promise((resolve, reject) => {
        const baseURL = "https://www.youtube.com/results?search_query=";

        axios({
            method: "get",
            url: baseURL + formateInput(search),
        }).then((response) => {
            resolve(json5.parse(getSection(response.data)));
        }).catch((err) => {
            reject(err);
        });
      });
}