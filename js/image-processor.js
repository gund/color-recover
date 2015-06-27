/**
 * Created by alex on 6/10/15.
 */

(function () {
    "use strict";

    angular.module('Gund.ImageProcessor', ['Gund.ColorUtils'])

        .factory('ImageProcessor', ['$q', 'Color', function ($q, Color) {
            var internalHash = hashCode(Math.round(Math.random() * 1000) * Date.now());

            /**
             * ImageProcessor Class
             * @param {String} imgUrl
             * @param {Boolean} forceLoad
             * @returns {ImageProcessor}
             * @constructor
             */
            function ImageProcessor(imgUrl, forceLoad) {
                imgUrl = imgUrl || null;
                forceLoad = forceLoad || false;

                if (!angular.isString(imgUrl)) throw Error('Image url must be string');

                this.url = imgUrl;
                this.image = null;
                this.context = document.createElement('canvas').getContext('2d');
                this.imagePixels = null;
                this._imageLoaded = false;
                this._imageRendered = false;

                if (forceLoad) internal.call(this, '_loadImage');

                return this;
            }

            /**
             * Start image loading
             * @returns {Promise}
             */
            ImageProcessor.prototype.load = function () {
                return internal.call(this, '_loadImage');
            };

            ImageProcessor.prototype._loadImage = function (hash) {
                if (internalHash !== hash) throw SecurityException();
                var dfd = $q.defer(), me = this;

                if (!this._imageLoaded) {
                    try {
                        this.image = new Image();

                        this.image.onload = function () {
                            me._imageLoaded = true;
                            internal.call(me, '_processImage');
                            dfd.resolve(me.image);
                        };

                        this.image.onerror = function (e) {
                            dfd.reject(e);
                            console.log(e);
                        };

                        this.image.src = this.url;
                    } catch (e) {
                        dfd.reject(e);
                    }
                } else dfd.resolve(this.image);

                return dfd.promise;
            };

            ImageProcessor.prototype._processImage = function (hash) {
                if (internalHash !== hash) throw SecurityException();

                // Resize viewport first
                internal.call(this, '_resizeCanvas');

                // Copy image to viewport
                this.context.drawImage(this.image, 0, 0);

                // Get image pixels
                this.imagePixels = this.context.getImageData(0, 0, this.image.width, this.image.height).data;

                // Clear viewport to perform further operations
                this.context.clearRect(0, 0, this.image.width, this.image.height);
                this._imageRendered = false;
            };

            ImageProcessor.prototype._resizeCanvas = function (hash) {
                if (internalHash !== hash) throw SecurityException();
                this.context.canvas.width = this.image.width;
                this.context.canvas.height = this.image.height;
                this._imageRendered = false;
            };

            ImageProcessor.prototype._renderImage = function (hash) {
                if (internalHash !== hash) throw SecurityException();

                // If image was already rendered return
                if (this._imageRendered) return;

                var x = 0, y = 0;
                for (var i = 0; i < this.imagePixels.length; i += 4) {
                    // Compute color
                    this.context.fillStyle = Color.fromRgba(
                        this.imagePixels[i],
                        this.imagePixels[i + 1],
                        this.imagePixels[i + 2],
                        this.imagePixels[i + 3]
                    ).toString();

                    // Draw color
                    this.context.fillRect(x++, y, 1, 1);

                    // Move pixel by pixel
                    x = x % this.image.width;
                    if (x === 0) y++;
                }
                this._imageRendered = true;
            };

            ImageProcessor.prototype.getNewImage = function () {
                internal.call(this, '_renderImage');
                return this.context.canvas.toDataURL('image/png');
            };

            function SecurityException() {
                return Error('Security Violation: tried to execute internal method');
            }

            function internal(method) {
                return this[method](internalHash);
            }

            function hashCode(s) {
                return s.toString().split("").reduce(function (a, b) {
                    a = ((a << 5) - a) + b.charCodeAt(0);
                    return a & a
                }, 0);
            }

            return ImageProcessor; // Export
        }])

})();