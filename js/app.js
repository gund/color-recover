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
            function Color(hexColor, alpha) {
                hexColor = hexColor || '#000000';
                alpha = alpha !== undefined ? alpha : 1;

                this.a = alpha;
                this.r = parseInt('0x' + hexColor.substr(1, 2));
                this.g = parseInt('0x' + hexColor.substr(3, 2));
                this.b = parseInt('0x' + hexColor.substr(5, 2));

                return this;
            }

            Color.fromRgba = function (r, g, b, a) {
                var c = new Color();
                c.a = a;
                c.r = r;
                c.g = g;
                c.b = b;
                return c;
            };

            Color.prototype.toHex = function () {
                return '#' + toHex(this.r) + toHex(this.g) + toHex(this.b);

                function toHex(n) {
                    return (n < 10 ? '0' : '') + n.toString(16).toUpperCase();
                }
            };

            Color.prototype.blendWith = function(color) {
                if (1 - color.a <= 1.0e-6) return null; // No result -- 'fg' is fully opaque
                if (this.a - color.a < -1.0e-6) return null; // No result -- 'fg' can't make the result more transparent
                if (this.a - color.a < 1.0e-6) return this; // Fully transparent -- R,G,B not important
                var a = Math.min(1 - (1 - this.a) / (1 - color.a), 1);
                var z = a * (1 - color.a);
                return Color.fromRgba(
                    Math.min(Math.round((this.r * this.a - color.r * color.a) / z), 255),
                    Math.min(Math.round((this.g * this.a - color.g * color.a) / z), 255),
                    Math.min(Math.round((this.b * this.a - color.b * color.a) / z), 255),
                    a.toPrecision(2)
                );
            };

            Color.prototype.toString = function () {
                return 'rgba(' + this.r + ', ' + this.g + ', ' + this.b + ', ' + this.a + ')';
            };

            return Color;
        });

})();