const ytSearch = require('./ytSearch.js');

module.exports = async function getIDs(audioName) {
    return new Promise((resolve, reject) => {
        ytSearch(audioName).then((results) => {
            const ids = [];
            if(results.contents) {
                for(let r of results.contents) {
                    if(r.videoRenderer) {
                        ids.push(r.videoRenderer.videoId);
                    }
                }

                resolve(ids);
            } else {
                reject('Not found');
            }
        });
    });
}