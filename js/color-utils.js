/**
 * Created by alex on 6/10/15.
 */

(function () {
    "use strict";

    angular.module('Gund.ImageUtils', [''])

        .factory('Color', [function () {
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
            Color.prototype.blendWith = function (color) {
                var a = 1 - (1 - color.a) * (1 - this.a);
                var z = color.a * (1 - color.a) / a;

                if (a < 1.0e-6) return new Color(); // Result fully transparent

                return Color.fromRgba(
                    Math.min(Math.round(color.r * color.a / a + this.r * z), 255),
                    Math.min(Math.round(color.g * color.a / a + this.g * z), 255),
                    Math.min(Math.round(color.b * color.a / a + this.b * z), 255),
                    parseFloat(a.toPrecision(2))
                );
            };

            /**
             * Get reverse blended Color object between original and passed in argument
             * @param {Color} color
             * @returns {Color}
             */
            Color.prototype.unBlendWith = function(color) {
                if (1 - color.a <= 1.0e-6) return new Color(); // Black - color is fully opaque
                if (this.a - color.a < -1.0e-6) return new Color(); // Black - color can't make the result more transparent
                if (this.a - color.a < 1.0e-6) return this; // Result fully transparent

                var a = Math.min(1 - (1 - this.a) / (1 - color.a), 1);
                var z = a * (1 - color.a);

                return Color.fromRgba(
                    Math.min(Math.round((this.r * this.a - color.r * color.a) / z), 255),
                    Math.min(Math.round((this.g * this.a - color.g * color.a) / z), 255),
                    Math.min(Math.round((this.b * this.a - color.b * color.a) / z), 255),
                    parseFloat(a.toPrecision(2))
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
        }])

})();