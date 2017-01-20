/// <reference path="../../../minute/_all.d.ts" />
var Minute;
(function (Minute) {
    var AngularSearch = (function () {
        function AngularSearch() {
            this.$get = function ($rootScope, $q, $timeout, $http) {
                var service = {};
                var jsonp = function (url, timeout) {
                    if (timeout === void 0) { timeout = 2500; }
                    var deferred = $q.defer();
                    var cancel = $timeout(function () { return deferred.resolve([]); }, 2500);
                    $.ajax({
                        url: url + (/\?/.test(url) ? '&' : '?') + 'callback=?',
                        dataType: 'jsonp',
                        success: function (data) {
                            $timeout.cancel(cancel);
                            $timeout(function () { return 1; }, 1);
                            deferred.resolve(data);
                        }
                    });
                    return deferred.promise;
                };
                var suggest = function (query, youtube) {
                    var deferred = $q.defer();
                    var apiKey = 'AI39si7ZLU83bKtKd4MrdzqcjTVI3DK9FvwJR6a4kB_SW_Dbuskit-mEYqskkSsFLxN5DiG1OBzdHzYfW0zXWjxirQKyxJfdkg';
                    var yt = youtube ? '&ds=yt' : '';
                    var url = '//suggestqueries.google.com/complete/search?hl=en&client=youtube&hjson=t&cp=1&q=' + encodeURIComponent(query) + '&key=' + apiKey + '&format=5&alt=json' + yt;
                    jsonp(url).then(function (data) {
                        var results = $.map(data[1], function (item) { return item[0]; });
                        if (results && results.length > 2) {
                            deferred.resolve(results);
                        }
                        else if (youtube === true) {
                            var promise = suggest(query, false);
                            promise.then(function (results) { return deferred.resolve(results); });
                        }
                        else {
                            deferred.resolve([]);
                        }
                    });
                    return deferred.promise;
                };
                var stockSearch = function (type, query, params) {
                    if (params === void 0) { params = ''; }
                    var deferred = $q.defer();
                    jsonp('//www.stockutils.com/' + type + '/' + encodeURIComponent(query) + '?' + params, 5000).then(function (data) {
                        deferred.resolve(data);
                    });
                    return deferred.promise;
                };
                service.youtubeSuggest = function (query) {
                    return suggest(query, true);
                };
                service.googleSuggest = function (query) {
                    return suggest(query, false);
                };
                service.wikiSearch = function (query, len) {
                    if (len === void 0) { len = 0; }
                    var deferred = $q.defer();
                    var ucQuery = Minute.Utils.ucFirst(query);
                    jsonp('//en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=' + encodeURIComponent(ucQuery), 5000).then(function (data) {
                        for (var page in data.query.pages) {
                            if (data.query.pages.hasOwnProperty(page)) {
                                var text = data.query.pages[page].extract;
                                if (text && !/^Report generated based on a request/.test(text)) {
                                    var output = '';
                                    if (len > 0) {
                                        var sentences = text.split(/[.?!](?=\s+[0-9A-Z])/g);
                                        for (var i = 0; i < sentences.length; i++) {
                                            var sentence = $.trim(sentences[i].replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/, ' '));
                                            if ((output.length === 0) || ((output.length + sentence.length) < len + 20)) {
                                                output = output + sentence + '. ';
                                            }
                                            else {
                                                break;
                                            }
                                        }
                                    }
                                    else {
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
                service.youtubeSearch = function (query, cc, duration, type) {
                    if (cc === void 0) { cc = false; }
                    if (duration === void 0) { duration = 'any'; }
                    if (type === void 0) { type = 'video'; }
                    var deferred = $q.defer();
                    var cancel = $timeout(function () { return deferred.resolve(''); }, 5000);
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
                    }).then(function (obj) {
                        $timeout.cancel(cancel);
                        var results = [];
                        angular.forEach(obj.data.items, function (result) {
                            results.push({
                                src: 'http://www.youtube.com/watch?v=' + result.id.videoId,
                                title: result.snippet.title,
                                thumbnail: result.snippet.thumbnails.default.url,
                                description: result.snippet.description
                            });
                        });
                        deferred.resolve(results);
                    });
                    return deferred.promise;
                };
                service.googleSearch = function (query) {
                    return stockSearch('web-search', query);
                };
                service.imageSearch = function (query, cc) {
                    if (cc === void 0) { cc = true; }
                    return stockSearch('image-search', query, cc ? '&cc=true' : '');
                };
                service.init = function () {
                    return service;
                };
                return service.init();
            };
            this.$get.$inject = ['$rootScope', '$q', '$timeout', '$http', '$sce'];
        }
        return AngularSearch;
    }());
    Minute.AngularSearch = AngularSearch;
    angular.module('AngularSearch', [])
        .provider("$search", AngularSearch);
})(Minute || (Minute = {}));
