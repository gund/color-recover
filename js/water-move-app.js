/**
 * Created by alex on 6/27/15.
 */

(function () {
    "use strict";

    angular.module('Gund.WaterMove', ['Gund.ColorUtils', 'Gund.ImageProcessor'])

        .controller('MainCtrl', ['$scope', 'ImageProcessor', 'WaterMove', '$q',
            function ($scope, ImageProcessor, WaterMove, $q) {
                $scope.originalImg = 'test3.jpeg';
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

                    $scope.toggleImage();
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
                var x = 0, y = 0, isTransparent = true, isLeft = false, isRight = false;
                for (var i = 0; i < this.water.imagePixels.length; i += 4) {
                    // Skip transparent water pixels
                    if (this.water.imagePixels[i + 3] !== 0) {
                        if (this.water.imagePixels[i + 7] === 0) {
                            isTransparent = true;
                            isRight = true;
                        }

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

                        var minColor = 255 * colorFilter.a;
                        var maxColor = 255 - minColor;

                        // If pixel is out of sensitive range make it lighter/darker
                        if ((colorMixed.r <= minColor && colorMixed.g <= minColor && colorMixed.b <= minColor) ||
                            (colorMixed.r >= maxColor && colorMixed.g >= maxColor && colorMixed.b >= maxColor)) {
                            //var k = colorMixed.r <= minColor,
                            //    kr = k ? (minColor / colorMixed.r) / 2 : (colorMixed.r / maxColor),
                            //    kg = k ? (minColor / colorMixed.g) / 2 : (colorMixed.g / maxColor),
                            //    kb = k ? (minColor / colorMixed.b) / 2 : (colorMixed.b / maxColor);

                            this.image.imagePixels[pixelOffset + i] = 255;
                                //Math.min(this.image.imagePixels[pixelOffset + i] * 1.05, 255);
                            this.image.imagePixels[pixelOffset + i + 1] = 0;
                                //Math.min(this.image.imagePixels[pixelOffset + i + 1] * 1.05, 255);
                            this.image.imagePixels[pixelOffset + i + 2] = 0;
                                //Math.min(this.image.imagePixels[pixelOffset + i + 2] * 1.05, 255);
                            //this.image.imagePixels[pixelOffset + i + 3] = 1;
                        } else {

                            // Move those pixels
                            var colorOriginal = colorMixed.unBlendWith(colorFilter);

                            // Update pixel data
                            if (isTransparent) {
                                this.image.imagePixels[pixelOffset + i] = 255;
                                this.image.imagePixels[pixelOffset + i + 1] = 0;
                                this.image.imagePixels[pixelOffset + i + 2] = 0;

                                var color = Color.fromColor(colorOriginal);
                                color.a = 1;

                                // Produce fast inpaint algorithm
                                if (isLeft) {
                                    //var leftColor = Color.fromRgba(
                                    //    this.image.imagePixels[pixelOffset + i - 4],
                                    //    this.image.imagePixels[pixelOffset + i - 3],
                                    //    this.image.imagePixels[pixelOffset + i - 2],
                                    //    1
                                    //);
                                    //var leftTopColor = Color.fromRgba(
                                    //    this.image.imagePixels[pixelOffset + i - 4 - waterImageOffset],
                                    //    this.image.imagePixels[pixelOffset + i - 3 - waterImageOffset],
                                    //    this.image.imagePixels[pixelOffset + i - 2 - waterImageOffset],
                                    //    1
                                    //);
                                    //var leftTopTopColor = Color.fromRgba(
                                    //    this.image.imagePixels[pixelOffset + i - 8 - waterImageOffset],
                                    //    this.image.imagePixels[pixelOffset + i - 7 - waterImageOffset],
                                    //    this.image.imagePixels[pixelOffset + i - 6 - waterImageOffset],
                                    //    1
                                    //);

                                    //color = color.blendWith(leftColor);

                                    //this.image.imagePixels[pixelOffset + i - 4] = color.r;
                                    //this.image.imagePixels[pixelOffset + i - 3] = color.g;
                                    //this.image.imagePixels[pixelOffset + i - 2] = color.b;
                                    this.image.imagePixels[pixelOffset + i + 4] = 255;
                                    this.image.imagePixels[pixelOffset + i + 5] = 0;
                                    this.image.imagePixels[pixelOffset + i + 6] = 0;
                                }
                                if (isRight) {
                                    //var rightColor = Color.fromRgba(
                                    //    this.image.imagePixels[pixelOffset + i + 4],
                                    //    this.image.imagePixels[pixelOffset + i + 5],
                                    //    this.image.imagePixels[pixelOffset + i + 6],
                                    //    1
                                    //);
                                    //var rightTopColor = Color.fromRgba(
                                    //    this.image.imagePixels[pixelOffset + i + 4 - waterImageOffset],
                                    //    this.image.imagePixels[pixelOffset + i + 5 - waterImageOffset],
                                    //    this.image.imagePixels[pixelOffset + i + 6 - waterImageOffset],
                                    //    1
                                    //);
                                    //var rightTopTopColor = Color.fromRgba(
                                    //    this.image.imagePixels[pixelOffset + i + 8 - waterImageOffset],
                                    //    this.image.imagePixels[pixelOffset + i + 9 - waterImageOffset],
                                    //    this.image.imagePixels[pixelOffset + i + 10 - waterImageOffset],
                                    //    1
                                    //);

                                    //color = color.blendWith(rightColor);
                                    //
                                    //this.image.imagePixels[pixelOffset + i + 4] = color.r;
                                    //this.image.imagePixels[pixelOffset + i + 5] = color.g;
                                    //this.image.imagePixels[pixelOffset + i + 6] = color.b;
                                    this.image.imagePixels[pixelOffset + i - 4] = 255;
                                    this.image.imagePixels[pixelOffset + i - 3] = 0;
                                    this.image.imagePixels[pixelOffset + i - 2] = 0;
                                }

                                // Apply blended color
                                //this.image.imagePixels[pixelOffset + i] = color.r;
                                //this.image.imagePixels[pixelOffset + i + 1] = color.g;
                                //this.image.imagePixels[pixelOffset + i + 2] = color.b;
                                //this.image.imagePixels[pixelOffset + i + 3] = 1;
                            } else {
                                // Detect red regions
                                if (this.water.imagePixels[i] > 250 &&
                                    this.water.imagePixels[i + 1] < 30 &&
                                    this.water.imagePixels[i + 2] < 30) {
                                    colorOriginal.r = 255;//Math.round(Math.min(colorOriginal.r * 1.15, 255));
                                    colorOriginal.g = 0;//Math.round(Math.min(colorOriginal.g * 0.8, 255));
                                    colorOriginal.b = 0;//Math.round(Math.min(colorOriginal.b * 1.005, 255));
                                }

                                this.image.imagePixels[pixelOffset + i] = colorOriginal.r;
                                this.image.imagePixels[pixelOffset + i + 1] = colorOriginal.g;
                                this.image.imagePixels[pixelOffset + i + 2] = colorOriginal.b;
                                this.image.imagePixels[pixelOffset + i + 3] = colorOriginal.a;
                            }
                        }

                        isTransparent = false;
                        isLeft = false;
                        isRight = false;
                    } else {
                        isTransparent = true;
                        isLeft = true;
                    }

                    // Move pixel by pixel
                    x++;
                    x = x % (waterW / 2);
                    if (x === 0) pixelOffset += waterImageOffset;
                }
            };

            return WaterMove; // Export
        }])

})();