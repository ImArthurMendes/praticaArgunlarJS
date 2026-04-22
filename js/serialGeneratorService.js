angular.module("listaTelefonica").factory("serialGenerator", function() {
    return {
        generate: function() {
            return Math.random().toString(36).substring(2, 10).toUpperCase();
        }
    };
});