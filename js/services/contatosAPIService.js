angular.module("listaTelefonica").factory("contatosAPI", function($http) {
    var _getContatos = function() {
        return $http.get('http://localhost:3000/contatos');
    };

    var _saveContato = function(contato) {
        return $http.post('http://localhost:3000/contatos', contato);
    };

    var _deleteContato = function(id) {
        return $http.delete('http://localhost:3000/contatos/' + id);
    };
    return {
        getContatos: _getContatos,
        saveContato: _saveContato,
        deleteContato: _deleteContato
    };
});