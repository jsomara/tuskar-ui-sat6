angular.module('hz').directive({
    satelliteErrata: [ function () {

        return {
            restrict: 'A',
           // require: '^file',
            transclude: true,
            scope: {
                uuid: '='
            },
            controller: ['$scope', '$http', 'Base64', 'ngTableParams', '$filter',
                function ($scope, $http, Base64, ngTableParams, $filter) {

                    var baseUrl, getAuthToken, defaultParams, getErrata, payload;
		    baseUrl = 'https://sat-perf-05.idm.lab.bos.redhat.com';
		    
                    getAuthToken = function (username, password) {
                        var tokenize = username + ':' + password;
                        tokenize = Base64.encode(tokenize);
                        return "Basic " + tokenize;
                    };

		    getErrata = function (uuid) {
			var errataUrl, errata;
			errataUrl = baseUrl + "/katello/api/v2/systems/" + uuid + "/errata/";
			console.log('GET: ' + errataUrl);
			$http( { url: errataUrl, method: 'GET', headers: { 'Authorization': getAuthToken('admin', 'changeme') } } )
			    .success(function (e) {
				$scope.errata = e;
			        $scope.errataParams = defaultParams(e);
				errata = e;
			    }).error(function (e) {
				console.log("Error:");
				console.log(e);
			    });
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

		    getErrata($scope.uuid);
            }],
            template:
               '<table ng-table="errataParams" class="table">\n' +
                    '<tr ng-repeat="e in $data">\n' +
                        '<td data-title="\'Title\'" sortable="\'title\'">\n' +
                            '<a ng-href="{$errataLink(e)$}">{{e.title}}</a>\n' +
                        '</td>\n' +
                        '<td data-title="\'Type\'" sortable="\'type\'">{{ e.type }}</td>\n' +
                        '<td data-title="\'Errata ID\'" sortable="\'type\'">{{ e.errata_id }}</td>\n' +
                        '<td data-title="\'Date Issued\'" sortable="\'issued\'">{{ e.issued }}</td>\n' +
                    '</tr>\n'+
               '</table>\n',
            link: function (scope, element, attrs, modelCtrl, transclude)    {
                scope.modelCtrl = modelCtrl;
                scope.$transcludeFn = transclude;
            }
        };
    }]
});

angular.module('hz').controller({
    ErrataController: ['$scope',
        function ($scope ) {

        }]});
