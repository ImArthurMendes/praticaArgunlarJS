angular.module("listaTelefonica").controller("listaTelefonicaCtrl", function($scope, $q, contatosAPI, operadorasAPI) {
    $scope.app = "LISTA TELEFÔNICA";
    $scope.contatos = [];
    $scope.operadoras = [];

    var carregarContatos = function() {
        contatosAPI.getContatos().then(function(response) {
            $scope.contatos = response.data;
            $scope.contatos.forEach(function(contato) {
                contato.data = new Date(contato.data || Date.now());
            });
        }).catch(function() {
            $scope.message = "Erro ao carregar contatos.";
        });
    };
    carregarContatos();

    var carregarOperadoras = function() {
        operadorasAPI.getOperadoras().then(function(response) {
            $scope.operadoras = response.data || [];
        }).catch(function() {
            $scope.message = "Erro ao carregar operadoras.";
        });
    };
    carregarOperadoras();

    $scope.adicionarContato = function(contato) {
        var novoContato = angular.copy(contato);
        novoContato.data = new Date();

        contatosAPI.saveContato(novoContato).then(function(response) {
            var salvo = response.data;
            salvo.data = new Date(salvo.data);
            $scope.contatos.push(salvo); 
            $scope.contato = {};
            $scope.contatoForm.$setPristine();
            $scope.contatoForm.$setUntouched();
        }).catch(function() {
            $scope.message = "Erro ao salvar contato.";
        });
    };

    $scope.apagarContatos = function(contatos) {
        var selecionados = contatos.filter(function(c) {
            return c.selecionado;
        });
        if (selecionados.length === 0) return;

        var idsParaRemover = selecionados.map(function(c) { return c.id; });

        var promises = selecionados.map(function(c) {
            return contatosAPI.deleteContato(c.id); // ← BUG 2 corrigido: era contato.id
        });

        $q.all(promises).then(function() {
            $scope.contatos = $scope.contatos.filter(function(c) {
                return idsParaRemover.indexOf(c.id) === -1;
            });
        }).catch(function() {
            $scope.message = "Erro ao apagar um ou mais contatos. Recarregue a lista.";
            carregarContatos();
        });
    };

    $scope.isContatoSelecionado = function(contatos) {
        return contatos.some(function(c) { return c.selecionado; });
    };

    $scope.ordenarPor = function(campo) {
        if ($scope.criterioDeOrdenacao === campo) {
            $scope.direcaoDaOrdenacao = !$scope.direcaoDaOrdenacao;
        } else {
            $scope.criterioDeOrdenacao = campo;
            $scope.direcaoDaOrdenacao = false;
        }
    };

    $scope.exportarJSON = function() {
        const json = JSON.stringify($scope.contatos, null, 2);
        const blob = new Blob([json], { type: "application/json" }); // ← BUG 4 corrigido: era Blod
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "contatos.json";
        a.click();
        URL.revokeObjectURL(url);
    };
});