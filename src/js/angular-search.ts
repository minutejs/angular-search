/// <reference path="../../../minute/_all.d.ts" />

module Minute {
    export class AngularSearch implements ng.IServiceProvider {
        constructor() {
            this.$get.$inject = ['$rootScope', '$q', '$timeout'];
        }

        $get = ($rootScope: ng.IRootScopeService, $q: ng.IQService, $timeout: ng.ITimeoutService) => {
            let service: any = {};
            let suggest = (query, youtube) => {
                var apiKey = 'AI39si7ZLU83bKtKd4MrdzqcjTVI3DK9FvwJR6a4kB_SW_Dbuskit-mEYqskkSsFLxN5DiG1OBzdHzYfW0zXWjxirQKyxJfdkg';
                var deferred = $q.defer();
                var cancel = $timeout(deferred.resolve, 2500);

                $.ajax({
                    url: "//suggestqueries.google.com/complete/search?hl=en&client=youtube&hjson=t&cp=1&q=" + encodeURIComponent(query) + "&key=" + apiKey + "&format=5&alt=json&callback=?" + (youtube ? '&ds=yt' : ''),
                    dataType: 'jsonp',
                    success: function (data) {
                        $timeout.cancel(cancel);

                        var results = $.map(data[1], function (item) {
                            return item[0]
                        });

                        if (results && results.length > 2) {
                            deferred.resolve(results);
                        } else if (youtube === true) { //return normal suggest results if youtube doesn't return anything
                            var promise = suggest(query, false);
                            promise.then(deferred.resolve);
                        } else {
                            deferred.resolve([]);
                        }
                    }
                });

                return deferred.promise;
            };

            service.youtubeSuggest = (query) => {
                return suggest(query, true);
            };

            service.googleSuggest = (query) => {
                return suggest(query, false);
            };

            service.wikiSearch = (query) => {
                let deferred = $q.defer();
                let cancel = $timeout(deferred.resolve, 2500);

                $.getJSON("//en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=" + encodeURIComponent(query) + "&callback=?", function (obj) {
                    if (obj && obj.query && obj.query.pages) {
                        let results = [];

                        $timeout.cancel(cancel);

                        for (var page in obj.query.pages) {
                            if (obj.query.pages.hasOwnProperty(page)) {
                                var text = obj.query.pages[page].extract;

                                results.push(text);
                            }
                        }

                        deferred.resolve(results);
                    }
                });

                return deferred.promise;
            };

            service.googleSearch = (query) => {

            };

            service.imageSearch = (query) => {

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