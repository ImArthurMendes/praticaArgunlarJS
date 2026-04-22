angular.module("listaTelefonica").factory("contatosAPI", function($http, config) {
    var _getContatos = function() {
        return $http.get(config.baseUrl + "/contatos");
    };

    var _saveContato = function(contato) {
        return $http.post(config.baseUrl + "/contatos", contato);
    };

    var _deleteContato = function(id) {
        return $http.delete(config.baseUrl + "/contatos/" + id);
    };
    return {
        getContatos: _getContatos,
        saveContato: _saveContato,
        deleteContato: _deleteContato
    };
});