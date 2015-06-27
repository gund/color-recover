/**
 * Created by alex on 6/27/15.
 */

(function () {
    "use strict";

    angular.module('Gund.WaterMove', ['Gund.ColorUtils', 'Gund.ImageProcessor'])

        .controller('MainCtrl', ['$scope', 'ImageProcessor', function ($scope, ImageProcessor) {
            $scope.originalImg = 'main.jpeg';
            $scope.imgUrl = $scope.originalImg;
            $scope.ready = false;

            $scope.toggleImage = function () {
                $scope.imgUrl = $scope.imgUrl === $scope.originalImg ? image.newImage : $scope.originalImg;
            };

            var image = new ImageProcessor($scope.originalImg);

            image.load().then(function () {
                $scope.ready = true;
                $scope.$apply();
            });
        }])

})();