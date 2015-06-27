/**
 * Created by alex on 6/27/15.
 */

(function () {
    "use strict";

    angular.module('Gund.WaterMove', ['Gund.ColorUtils', 'Gund.ImageProcessor'])

        .controller('MainCtrl', ['$scope', 'ImageProcessor', function ($scope, ImageProcessor) {
            var imgUrl = 'http://87421a79fde09fda7e57-79445249ccb41a60f7b99c8ef6df8604.r12.cf3.rackcdn.com/4_async_wmarker/2015/6/9/63704369527c1aa30f88cb4c7169baf5cd992f7c/main.jpeg';

            var image = new ImageProcessor(imgUrl);

            image.load().then(function (img) {
                console.log(img);
            });
        }])

})();