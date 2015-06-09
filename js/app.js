/**
 * Created by alex on 5/22/15.
 */

(function () {
    "use strict";

    angular.module('MyApp', ['Gund.ColorRecover'])

        .controller('MainCtrl', ['$scope', 'Color', function ($scope, Color) {
            $scope.mixed = {
                color: '#ff0000',
                percent: 100,
                limit: 0
            };
            $scope.filter = {
                color: '#000000',
                percent: 18,
                limit: 0
            };
            $scope.mixedRgba = null;
            $scope.filterRgba = null;
            $scope.originalColor = null;

            $scope.computeOriginalColor = function () {
                $scope.filter.limit = $scope.mixed.percent - 1;
                $scope.mixed.limit = $scope.filter.percent;

                $scope.mixedRgba = new Color($scope.mixed.color, $scope.mixed.percent / 100);
                $scope.filterRgba = new Color($scope.filter.color, $scope.filter.percent / 100);

                $scope.originalColor = $scope.mixedRgba.blendWith($scope.filterRgba);
            };

            $scope.$watch('[mixed, filter]', function () {
                $scope.computeOriginalColor();
            }, true);
        }])

})();