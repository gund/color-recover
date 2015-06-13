/**
 * Created by alex on 5/22/15.
 */

(function () {
    "use strict";

    angular.module('MyApp', ['Gund.ImageUtils', 'Gund.ImageProcessor'])

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
            $scope.imgUrl = 'http://87421a79fde09fda7e57-79445249ccb41a60f7b99c8ef6df8604.r12.cf3.rackcdn.com/4_async_wmarker/2015/6/9/63704369527c1aa30f88cb4c7169baf5cd992f7c/main.jpeg';

            $scope.computeOriginalColor = function () {
                $scope.filter.limit = $scope.mixed.percent - 1;
                $scope.mixed.limit = $scope.filter.percent;

                $scope.mixedRgba = new Color($scope.mixed.color, $scope.mixed.percent / 100);
                $scope.filterRgba = new Color($scope.filter.color, $scope.filter.percent / 100);

                $scope.originalColor = $scope.mixedRgba.unBlendWith($scope.filterRgba);
            };

            $scope.$watch('[mixed, filter]', function () {
                $scope.computeOriginalColor();
            }, true);
        }])

})();