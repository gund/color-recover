/**
 * Created by alex on 6/10/15.
 */

(function () {
    "use strict";

    angular.module('Gund.ImageProcessor', ['Gund.ColorUtils'])

        .factory('ImageProcessor', ['$q', function ($q) {

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
                this.imageReady = false;

                if (forceLoad) {
                    this._loadImage();
                }

                return this;
            }

            /**
             * Start image loading
             * @returns {Promise}
             */
            ImageProcessor.prototype.load = function () {
                return this._loadImage();
            };

            ImageProcessor.prototype._loadImage = function () {
                var dfd = $q.defer(), me = this;

                if (!this.imageReady) {
                    try {
                        this.image = new Image();

                        this.image.onload = function () {
                            me.imageReady = true;
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

            return ImageProcessor; // Export
        }])

})();