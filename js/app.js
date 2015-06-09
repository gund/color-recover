/**
 * Created by alex on 5/22/15.
 */

(function () {
    "use strict";

    angular.module('MyApp', [])

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

        .factory('Color', function () {
            /**
             * Construct Color object from HEX and alpha
             * @param {string} hexColor
             * @param {number} alpha
             * @returns {Color}
             * @constructor
             */
            function Color(hexColor, alpha) {
                hexColor = hexColor || '#000000';
                alpha = alpha !== undefined ? alpha : 1;

                this.a = alpha;
                this.r = parseInt('0x' + hexColor.substr(1, 2));
                this.g = parseInt('0x' + hexColor.substr(3, 2));
                this.b = parseInt('0x' + hexColor.substr(5, 2));

                return this;
            }

            /**
             * Construct Color object from RGBA
             * @param {number} r
             * @param {number} g
             * @param {number} b
             * @param {number} a
             * @returns {Color}
             * @constructor
             */
            Color.fromRgba = function (r, g, b, a) {
                var c = new Color();
                c.a = a;
                c.r = r;
                c.g = g;
                c.b = b;
                return c;
            };

            /**
             * Get HEX representation of Color Object
             * @returns {string}
             */
            Color.prototype.toHex = function () {
                return '#' + toHex(this.r) + toHex(this.g) + toHex(this.b);

                function toHex(n) {
                    return (n < 10 ? '0' : '') + n.toString(16).toUpperCase();
                }
            };

            /**
             * Get blended Color object between original and passed in argument
             * @param {Color} color
             * @returns {Color}
             */
            Color.prototype.blendWith = function(color) {
                if (1 - color.a <= 1.0e-6) return new Color(); // Black - color is fully opaque
                if (this.a - color.a < -1.0e-6) return Color(); // Black - color can't make the result more transparent
                if (this.a - color.a < 1.0e-6) return this; // Result fully transparent

                var a = Math.min(1 - (1 - this.a) / (1 - color.a), 1);
                var z = a * (1 - color.a);

                return Color.fromRgba(
                    Math.min(Math.round((this.r * this.a - color.r * color.a) / z), 255),
                    Math.min(Math.round((this.g * this.a - color.g * color.a) / z), 255),
                    Math.min(Math.round((this.b * this.a - color.b * color.a) / z), 255),
                    a.toPrecision(2)
                );
            };

            /**
             * Returns Color object as RGBA string
             * @returns {string}
             */
            Color.prototype.toString = function () {
                return 'rgba(' + this.r + ', ' + this.g + ', ' + this.b + ', ' + this.a + ')';
            };

            return Color; // Export
        });

})();