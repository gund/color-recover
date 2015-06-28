/**
 * Created by alex on 6/27/15.
 */

(function () {
    "use strict";

    angular.module('Gund.WaterMove', ['Gund.ColorUtils', 'Gund.ImageProcessor'])

        .controller('MainCtrl', ['$scope', 'ImageProcessor', 'WaterMove', '$q',
            function ($scope, ImageProcessor, WaterMove, $q) {
                $scope.originalImg = 'main.jpeg';
                $scope.waterImg = 'watermark_v6.png';
                $scope.imgUrl = $scope.originalImg;
                $scope.ready = false;

                $scope.toggleImage = function () {
                    $scope.imgUrl = $scope.imgUrl === $scope.originalImg ? image.exportImage() : $scope.originalImg;
                };

                var image = new ImageProcessor($scope.originalImg);
                var water = new ImageProcessor($scope.waterImg);

                $q.all([image.load(), water.load()]).then(function () {
                    $scope.ready = true;

                    new WaterMove(image, water, 1);
                });
            }])

        .factory('WaterMove', ['Color', function (Color) {
            /**
             * WaterMove class
             * @param {ImageProcessor} image
             * @param {ImageProcessor} water
             * @param {Number} cycleCount
             * @constructor
             */
            function WaterMove(image, water, cycleCount) {
                cycleCount = Math.min(parseInt(cycleCount), 10) || 1;
                this.image = image;
                this.water = water;

                for (var i = 0; i < cycleCount; ++i) {
                    this.moveWater();
                }

                this.image.exportImage(true);

                return this;
            }

            WaterMove.prototype.moveWater = function () {
                var imageW = this.image.image.width,
                    imageH = this.image.image.height,
                    waterW = this.water.image.width,
                    waterH = this.water.image.height;

                // Coordinates of water
                var top = Math.ceil(imageH / 2 - waterH / 2) - 1,
                    left = Math.ceil(imageW / 2 - waterW / 2) - 2;

                // Pixels range for redrawing
                var pixelOffset = (top * imageW + left) * 4,
                    pixelEnd = pixelOffset + waterW * waterH * 4,
                    waterImageOffset = ((imageW - (left + waterW)) + left) * 4;

                // Redraw pixels
                var x = 0, y = 0, isTransparent = true;
                for (var i = 0; i < this.water.imagePixels.length; i += 4) {
                    // Skip transparent water pixels
                    if (this.water.imagePixels[i + 3] !== 0) {
                        if (this.water.imagePixels[i + 7] === 0) isTransparent = true;

                        // Get mixed (source) pixel
                        var colorMixed = Color.fromRgba(
                            this.image.imagePixels[pixelOffset + i],
                            this.image.imagePixels[pixelOffset + i + 1],
                            this.image.imagePixels[pixelOffset + i + 2],
                            1
                        );

                        // Get water pixel
                        var colorFilter = Color.fromRgba(
                            this.water.imagePixels[i],
                            this.water.imagePixels[i + 1],
                            this.water.imagePixels[i + 2],
                            isTransparent ? 0.05 : 0.17
                        );

                        // Move those pixels
                        var colorOriginal = colorMixed.unBlendWith(colorFilter);

                        // Update pixel data
                        //if (isTransparent) {
                        //    this.image.imagePixels[pixelOffset + i] = 255;
                        //    this.image.imagePixels[pixelOffset + i + 1] = 0;
                        //    this.image.imagePixels[pixelOffset + i + 2] = 0;
                        //    this.image.imagePixels[pixelOffset + i + 3] = 1;
                        //} else {
                            this.image.imagePixels[pixelOffset + i] = colorOriginal.r;
                            this.image.imagePixels[pixelOffset + i + 1] = colorOriginal.g;
                            this.image.imagePixels[pixelOffset + i + 2] = colorOriginal.b;
                            this.image.imagePixels[pixelOffset + i + 3] = colorOriginal.a;
                        //}

                        isTransparent = false;
                    } else isTransparent = true;

                    // Move pixel by pixel
                    x++;
                    x = x % (waterW / 2);
                    if (x === 0) pixelOffset += waterImageOffset;
                }
            };

            return WaterMove; // Export
        }])

})();