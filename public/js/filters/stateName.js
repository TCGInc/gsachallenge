app.filter('stateName', function(utilityService) {
    return function(input) {

        var names = [];

        angular.forEach(input, function(key) {
            angular.forEach(utilityService.stateNames, function(abbr, name) {
                if (key == abbr) {
                    names.push(name);
                    return false;
                }
            });
        });

        return names;
    };
})