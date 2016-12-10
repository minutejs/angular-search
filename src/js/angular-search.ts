/// <reference path="../../../minute/_all.d.ts" />

module Minute {
    export class AngularSearch implements ng.IServiceProvider {
        constructor() {
            this.$get.$inject = ['$rootScope', '$q', '$timeout', '$http'];
        }

        $get = ($rootScope: ng.IRootScopeService, $q: ng.IQService, $timeout: ng.ITimeoutService, $http: ng.IHttpService) => {
            let service: any = {};
            let suggest = (query, youtube) => {
                let deferred = $q.defer();
                let cancel = $timeout(() => deferred.resolve([]), 2500);

                let apiKey = 'AI39si7ZLU83bKtKd4MrdzqcjTVI3DK9FvwJR6a4kB_SW_Dbuskit-mEYqskkSsFLxN5DiG1OBzdHzYfW0zXWjxirQKyxJfdkg';
                let yt = youtube ? '&ds=yt' : '';
                let url = '//suggestqueries.google.com/complete/search?hl=en&client=youtube&hjson=t&cp=1&q=' + encodeURIComponent(query) + '&key=' + apiKey + '&format=5&alt=json&callback=JSON_CALLBACK' + yt;

                $http.jsonp(url).then((obj) => {
                    $timeout.cancel(cancel);

                    let results = $.map(obj.data[1], (item) => item[0]);

                    if (results && results.length > 2) {
                        deferred.resolve(results);
                    } else if (youtube === true) { //return normal suggest results if youtube doesn't return anything
                        var promise = suggest(query, false);
                        promise.then((results) => deferred.resolve(results));
                    } else {
                        deferred.resolve([]);
                    }
                });

                return deferred.promise;
            };

            let stockSearch = (type, query, params = '') => {
                let deferred = $q.defer();
                let cancel = $timeout(() => deferred.resolve([]), 5000);

                $http.jsonp('//www.stockutils.com/' + type + '/' + encodeURIComponent(query) + '?callback=JSON_CALLBACK' + params).then((results) => {
                    $timeout.cancel(cancel);
                    deferred.resolve(results.data);
                });

                return deferred.promise;
            };

            service.youtubeSuggest = (query) => {
                return suggest(query, true);
            };

            service.googleSuggest = (query) => {
                return suggest(query, false);
            };

            service.wikiSearch = (query, len = 0) => {
                let deferred = $q.defer();
                let cancel = $timeout(() => deferred.resolve(''), 5000);
                let ucQuery = (query || '').replace(/\b\w/g, l => l.toUpperCase());

                $http.jsonp('//en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=' + encodeURIComponent(ucQuery) + '&callback=JSON_CALLBACK').then((obj: any) => {
                    $timeout.cancel(cancel);

                    for (let page in obj.data.query.pages) {
                        if (obj.data.query.pages.hasOwnProperty(page)) {
                            let text = obj.data.query.pages[page].extract;

                            if (text && !/^Report generated based on a request/.test(text)) {
                                let output = '';

                                if (len > 0) {
                                    let sentences = text.split(/[\.?!](?=\s+[0-9A-Z])/g);

                                    for (let i = 0; i < sentences.length; i++) {
                                        let sentence = $.trim(sentences[i].replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/, ' '));

                                        if ((output.length === 0) || ((output.length + sentence.length) < len + 20)) {
                                            output = output + sentence + '. ';
                                        } else {
                                            break;
                                        }
                                    }
                                } else {
                                    output = text;
                                }

                                deferred.resolve((output || '').replace(/\W+$/, '.'));
                                break;
                            }
                        }
                    }
                });

                return deferred.promise;
            };

            service.youtubeSearch = (query, cc = false, duration = 'any', type = 'video') => {
                let deferred = $q.defer();
                let cancel = $timeout(() => deferred.resolve(''), 5000);

                $http.get('https://www.googleapis.com/youtube/v3/search', {
                    params: {
                        q: query,
                        key: 'AIzaSyCBdyG0mb-kaxrHkY3bH3LmPGqigFrEtVg',
                        type: type,
                        part: 'id,snippet',
                        duration: duration,
                        maxResults: '24',
                        videoLicense: cc ? 'creativeCommon' : 'any',
                        videoCategoryId: '10',
                        videoEmbeddable: true
                    }
                }).then(function (obj: any) {
                    $timeout.cancel(cancel);

                    let results = [];

                    angular.forEach(obj.data.items, function (result) {
                        results.push({
                            src: 'http://www.youtube.com/watch?v=' + result.id.videoId,
                            title: result.snippet.title,
                            thumbnail: result.snippet.thumbnails.default.url,
                            description: result.snippet.description,
                        });
                    });

                    deferred.resolve(results);
                });


                return deferred.promise;
            };

            service.googleSearch = (query) => {
                return stockSearch('web-search', query);
            };

            service.imageSearch = (query, cc = true) => {
                return stockSearch('image-search', query, cc ? '&cc=true' : '');
            };

            service.init = () => {
                return service;
            };

            return service.init();
        }
    }

    angular.module('AngularSearch', [])
        .provider("$search", AngularSearch);

}