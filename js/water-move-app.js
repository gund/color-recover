/**
 * Created by alex on 6/27/15.
 */

(function () {
    "use strict";

    angular.module('Gund.WaterMove', ['Gund.ColorUtils', 'Gund.ImageProcessor'])

        .controller('MainCtrl', ['$scope', 'ImageProcessor', 'WaterMove', '$q',
            function ($scope, ImageProcessor, WaterMove, $q) {
                $scope.originalImg = 'main.jpeg';
                $scope.waterImg = 'watermark.png';
                $scope.imgUrl = $scope.originalImg;
                $scope.ready = false;

                $scope.toggleImage = function () {
                    $scope.imgUrl = $scope.imgUrl === $scope.originalImg ? image.exportImage() : $scope.originalImg;
                };

                var image = new ImageProcessor($scope.originalImg);
                var water = new ImageProcessor($scope.waterImg);

                $q.all([image.load(), water.load()]).then(function () {
                    $scope.ready = true;

                    new WaterMove(image, water);
                });
            }])

        .factory('WaterMove', ['Color', function (Color) {
            /**
             * WaterMove class
             * @param {ImageProcessor} image
             * @param {ImageProcessor} water
             * @constructor
             */
            function WaterMove(image, water) {
                this.image = image;
                this.water = water;

                this.moveWater();

                return this;
            }

            WaterMove.prototype.moveWater = function () {
                var imageW = this.image.image.width,
                    imageH = this.image.image.height,
                    waterW = this.water.image.width,
                    waterH = this.water.image.height;

                // Coordinates of water
                var top = imageH / 2 - waterH / 2,
                    left = imageW / 2 - waterW / 2;

                // Pixels range for redrawing
                var pixelOffset = top * imageW * 4 + left * 4;
                var pixelEnd = pixelOffset + waterW * waterH;

                // Redraw pixels
                var x = left, y = top;
                for (var i = pixelOffset; i <= pixelEnd; i += 4) {
                    // Get mixed (source) pixel
                    var colorMixed = Color.fromRgba(
                        this.image.imagePixels[i],
                        this.image.imagePixels[i + 1],
                        this.image.imagePixels[i + 2],
                        this.image.imagePixels[i + 3]
                    );

                    // Get water pixel
                    var colorFilter = Color.fromRgba(
                        this.water.imagePixels[i],
                        this.water.imagePixels[i + 1],
                        this.water.imagePixels[i + 2],
                        this.water.imagePixels[i + 3]
                    );

                    // Move those pixels
                    var colorOriginal = colorMixed.unBlendWith(colorFilter);

                    // Update pixel data
                    this.image.imagePixels[i] = colorOriginal.r;
                    this.image.imagePixels[i + 1] = colorOriginal.g;
                    this.image.imagePixels[i + 2] = colorOriginal.b;
                    this.image.imagePixels[i + 3] = colorOriginal.a;

                    // Move pixel by pixel
                    x = x % this.image.image.width;
                    if (x === 0) y++;
                }

                //this.image.context.drawImage(
                //    this.water.image,
                //    imageW / 2 - waterW / 2,
                //    imageH / 2 - waterH / 2
                //);

                this.image.exportImage(true);
            };

            return WaterMove; // Export
        }])

})();