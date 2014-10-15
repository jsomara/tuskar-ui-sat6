//Tuskar.directive({
horizonApp.directive({
    satelliteErrata: [ function () {

        return {
            restrict: 'A',
           // require: '^file',
            transclude: true,
            scope: {
                address: '='
            },
            controller: ['$scope', 'Base64', '$http', 'Base64', 'ngTableParams', '$filter',
                function ($scope, Base64, $http, Base64, ngTableParams, $filter) {

                    var baseUrl, getAuthToken, defaultParams, getErrataForUuid, findBestUuid, findUuidByAddress, username, password;

                    baseUrl = 'https://sat-perf-04.idm.lab.bos.redhat.com';
                    username = 'admin';
                    password = 'changeme';

                    getAuthToken = function() {
                        var tokenize = username + ':' + password;
                        tokenize = Base64.encode(tokenize);
                        return "Basic " + tokenize;
                    };

                    defaultParams = function (data) {
                        var params = new ngTableParams({
                            page: 1,            // show first page
                            count: 10           // count per page

                        }, {
                             total: data.length, // length of data
                             getData: function($defer, params) {
                                 var filteredData = params.filter() ?
                                     $filter('filter')(data, params.filter()) :
                                     data;
                                 var orderedData = params.sorting() ?
                                     $filter('orderBy')(filteredData, params.orderBy()) :
                                     data;
                                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                             }
                        });

                        return params;
                    };

                    $scope.errataLink = function (errata) {
                        return baseUrl + '/content_hosts/' + $scope.uuid + '/errata/' + errata.errata_id;
                    };

                    getErrataForUuid = function (uuid) {
                        return $http({
                            method: 'GET',
                            url: baseUrl + '/katello/api/v2/systems/' + uuid + '/errata',
                            headers: { 'Authorization': getAuthToken() }});
                    };

                    findSystemsByMacAddress = function (mac, iface) {
                        return $http({
                            method: 'GET',
                            url: baseUrl + '/katello/api/v2/systems?search=facts.net.interface.' + iface + '.mac_address:' + mac,
                            headers: { 'Authorization': getAuthToken() }});
                    };

                    // find the first sat6 UUID for a given MAC
                    findBestUuidAndErrata = function (address) {
                        var interfaces = ['eth0', 'eth1', 'en0', 'en1'];
                        var uuid;
                        var a = '\"52:54:00:4F:D8:65\"';
                        angular.forEach(interfaces, function (i) {
                            var payload = findSystemsByMacAddress(address, i);
                            payload.then(function (d) {
                                if (d.data.results.length > 0) {
                                    uuid = d.data.results[0].uuid;
                                    if (uuid !== '' && uuid !== undefined) {
                                        payload = getErrataForUuid(uuid);
                                        payload.then(function (dd) {
                                            $scope.errata = dd.data.results
                                            $scope.errataParams = defaultParams($scope.errata);
                                            $scope.foundErrata = true;
                                        });
                                        return true;
                                    }
                                }
                            });
                        });
                        if (uuid === undefined) {
                            return false;
                        };
                    };

                    findBestUuidAndErrata($scope.address);
            }],
            template:
               '<div ng-show=\'foundErrata\'>\n' +
                '<table ng-table="errataParams" class="table">\n' +
                        '<tr ng-repeat="e in $data">\n' +
                            '<td data-title="\'Title\'" sortable="\'title\'">\n' +
                                '<a ng-href="{$errataLink(e)$}">{{e.title}}</a>\n' +
                            '</td>\n' +
                            '<td data-title="\'Type\'" sortable="\'type\'">{{ e.type }}</td>\n' +
                            '<td data-title="\'Errata ID\'" sortable="\'type\'">{{ e.errata_id }}</td>\n' +
                            '<td data-title="\'Date Issued\'" sortable="\'issued\'">{{ e.issued }}</td>\n' +
                        '</tr>\n'+
                '</table>\n' +
               '</div>\n' +
               '</div ng-show=\'!foundErrata\'>No errata found for this node.</div>\n',
            link: function (scope, element, attrs, modelCtrl, transclude)    {
                scope.modelCtrl = modelCtrl;
                scope.$transcludeFn = transclude;
            }
        };
    }]
});

//Tuskar.controller( 'ErrataController', ['$scope'], function ($scope) {} );
horizonApp.controller({ ErrataController: ['$scope', function ($scope) {} ]});
