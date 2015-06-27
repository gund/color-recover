/**
 * Created by alex on 6/10/15.
 */

(function () {
    "use strict";

    angular.module('Gund.ImageProcessor', ['Gund.ColorUtils'])

        .factory('ImageProcessor', ['$q', function ($q) {
            var internalHash = Math.round(Math.random()*1000);

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
                this._imageReady = false;
                this._context = document.createElement('canvas').getContext('2d');

                if (forceLoad) {
                    this._loadImage(internalHash);
                }

                return this;
            }

            /**
             * Start image loading
             * @returns {Promise}
             */
            ImageProcessor.prototype.load = function () {
                return this._loadImage(internalHash);
            };

            ImageProcessor.prototype._loadImage = function (hash) {
                if (internalHash !== hash) throw SecurityException();
                var dfd = $q.defer(), me = this;

                if (!this._imageReady) {
                    try {
                        this.image = new Image();

                        this.image.onload = function () {
                            me._imageReady = true;
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

            ImageProcessor.prototype._proccessImage = function (hash) {
                if (internalHash !== hash) throw SecurityException();


            };

            function SecurityException() {
                return Error('Security Violation: tried to execute internal method');
            }

            return ImageProcessor; // Export
        }])

})();