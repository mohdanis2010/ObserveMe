module.exports = function(config) {
    config.set({
        basePath: '../',
        frameworks: [ 'jasmine' ],
        files: [
            'src/components/angular/angular.js',
            'src/components/angular/angular-mocks.js',
            'src/components/angular-ui-router/release/angular-ui-router.js',
            'src/js/app.js',
            'src/js/controller/homeController.js',
            'src/spec/homeControllerSpec.js',
        ],
        preprocessors: {
            'app/templates/*.html': 'ng-html2js'
        },
        reporters: [ 'progress' ],
        colors: true,
        autoWatch: false,
        browsers: [ 'PhantomJS' ],
        singleRun: true,
        plugins: [
            'karma-phantomjs-launcher',
            'karma-jasmine',
            'karma-ng-html2js-preprocessor'
        ]
    });
};