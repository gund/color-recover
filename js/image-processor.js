/**
 * Created by alex on 6/10/15.
 */

(function () {
    "use strict";

    angular.module('Gund.ImageProcessor', ['Gund.ImageUtils'])

        .factory('ImageProcessor', ['$q', function ($q) {

            function ImageProcessor(imgUrl) {
                imgUrl = imgUrl || null;

                if (!angular.isString(imgUrl)) throw Error('Image url must be string');

                this.url = imgUrl;

                return this;
            }

            ImageProcessor.prototype._loadImage = function () {
                var dfd = $q.defer(), me = this;

                try {
                    this.image = new Image(this.url);

                    this.image.onload = function () {
                        dfd.resolve(me.image);
                    };

                    this.image.onerror = function (e) {
                        dfd.reject(e);
                        console.log(e);
                    };
                } catch (e) {
                    dfd.reject(e);
                }

                return dfd.promise;
            };

            return ImageProcessor; // Export
        }])

})();