/**
 * Created by alex on 6/10/15.
 */

(function () {
    "use strict";

    angular.module('Gund.ImageProcessor', ['Gund.ColorUtils'])

        .factory('ImageProcessor', ['$q', 'Color', function ($q, Color) {
            var internalHash = hashCode(Math.round(Math.random() * 1000) * Date.now());
            var allowedImageTypes = ['png', 'jpeg'];

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
                /**
                 * @type {HTMLImageElement}
                 */
                this.image = null;
                /**
                 * @type {CanvasRenderingContext2D}
                 */
                this.context = document.createElement('canvas').getContext('2d');
                this.imagePixels = null;
                this._imageExportType = 'png';
                this._imageExportQuality = 1;
                this._imageLoaded = false;
                this._imageRendered = null;

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
                internal.call(this, '_updateImageData');

                this._imageRendered = null;

                // Render for the first time
                internal.call(this, '_renderImage');
            };

            ImageProcessor.prototype._resizeCanvas = function (hash) {
                if (internalHash !== hash) throw SecurityException();
                this.context.canvas.width = this.image.width;
                this.context.canvas.height = this.image.height;
                this._imageRendered = null;
            };

            ImageProcessor.prototype._renderImage = function (hash) {
                if (internalHash !== hash) throw SecurityException();

                // If image was already rendered return
                if (this._imageRendered !== null) return;

                // Get image pixels
                //internal.call(this, '_updateImageData');

                // Clear viewport before rendering
                this.context.clearRect(0, 0, this.image.width, this.image.height);

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

                this._imageRendered = this.context.canvas.toDataURL(this._imageExportType, this._imageExportQuality);
            };

            ImageProcessor.prototype._updateImageData = function (hash) {
                if (internalHash !== hash) throw SecurityException();

                this.imagePixels = this.context.getImageData(0, 0, this.image.width, this.image.height).data;
            };

            ImageProcessor.prototype.exportImage = function (forceRender) {
                forceRender = forceRender || false;
                if (forceRender) this._imageRendered = null;

                internal.call(this, '_renderImage');

                return this._imageRendered;
            };

            ImageProcessor.prototype.setImageExportType = function (type, quality) {
                type = type || '';
                quality = quality || 1;

                if (allowedImageTypes.indexOf(type) === -1) throw Error('Unsupported image type: ' + type);

                this._imageExportType = type;
                this._imageExportQuality = Math.max(Math.min(quality, 1), 0);
                this._imageRendered = null;

                return this;
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