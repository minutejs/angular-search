/// <reference path="../../../minute/_all.d.ts" />
var Minute;
(function (Minute) {
    var AngularSearch = (function () {
        function AngularSearch() {
            this.$get = function ($rootScope, $q, $timeout) {
                var service = {};
                var suggest = function (query, youtube) {
                    var apiKey = 'AI39si7ZLU83bKtKd4MrdzqcjTVI3DK9FvwJR6a4kB_SW_Dbuskit-mEYqskkSsFLxN5DiG1OBzdHzYfW0zXWjxirQKyxJfdkg';
                    var deferred = $q.defer();
                    var cancel = $timeout(deferred.resolve, 2500);
                    $.ajax({
                        url: "//suggestqueries.google.com/complete/search?hl=en&client=youtube&hjson=t&cp=1&q=" + encodeURIComponent(query) + "&key=" + apiKey + "&format=5&alt=json&callback=?" + (youtube ? '&ds=yt' : ''),
                        dataType: 'jsonp',
                        success: function (data) {
                            $timeout.cancel(cancel);
                            var results = $.map(data[1], function (item) {
                                return item[0];
                            });
                            if (results && results.length > 2) {
                                deferred.resolve(results);
                            }
                            else if (youtube === true) {
                                var promise = suggest(query, false);
                                promise.then(deferred.resolve);
                            }
                            else {
                                deferred.resolve([]);
                            }
                        }
                    });
                    return deferred.promise;
                };
                service.youtubeSuggest = function (query) {
                    return suggest(query, true);
                };
                service.googleSuggest = function (query) {
                    return suggest(query, false);
                };
                service.wikiSearch = function (query) {
                    var deferred = $q.defer();
                    var cancel = $timeout(deferred.resolve, 2500);
                    $.getJSON("//en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=" + encodeURIComponent(query) + "&callback=?", function (obj) {
                        if (obj && obj.query && obj.query.pages) {
                            var results = [];
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
                service.googleSearch = function (query) {
                };
                service.imageSearch = function (query) {
                };
                service.init = function () {
                    return service;
                };
                return service.init();
            };
            this.$get.$inject = ['$rootScope', '$q', '$timeout'];
        }
        return AngularSearch;
    }());
    Minute.AngularSearch = AngularSearch;
    angular.module('AngularSearch', [])
        .provider("$search", AngularSearch);
})(Minute || (Minute = {}));
