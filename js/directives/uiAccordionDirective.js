angular.module("listaTelefonica").directive("uiAccordion", function () {
    return {
        restrict: "A",
        scope: {
            items: "="
        },
        template:
            "<div class='accordion-item' ng-repeat='item in items track by $index'>" +
                "<h2>" +
                    "<button class='accordion-button' " +
                            "ng-class=\"{'active': isOpen($index)}\" " +
                            "ng-click='toggle($index)'>" +
                        "{{item.titulo}}" +
                    "</button>" +
                "</h2>" +
                "<div class='accordion-body' ng-show='isOpen($index)'>" +
                    "{{item.conteudo}}" +
                "</div>" +
            "</div>",
        link: function (scope) {

            scope.activeIndex = null;

            scope.toggle = function (index) {
                scope.activeIndex = (scope.activeIndex === index) ? null : index;
            };

            scope.isOpen = function (index) {
                return scope.activeIndex === index;
            };
        }
    };
});