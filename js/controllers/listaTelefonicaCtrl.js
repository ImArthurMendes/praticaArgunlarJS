angular.module("listaTelefonica").controller("listaTelefonicaCtrl", function($scope, $http) { //$scope é um objeto que atua como a ponte entre a lógica do JavaScript (controller) e a visualização do HTML (view).
    $scope.app = "LISTA TELEFÔNICA";
 
    //Operadoras (necessário para o select)
    $scope.operadoras = [
        {nome: "Claro", codigo: 41, categoria: "Celular", preco: 2},
        {nome: "Tim", codigo: 171, categoria: "Celular", preco: 1},
        {nome: "Vivo", codigo: 777, categoria: "Celular", preco: 1},
        {nome: "Claro Home", codigo: 411, categoria: "Fixo", preco: 2},
        {nome: "Tim Fibra", codigo: 1711, categoria: "Fixo", preco: 3},
        {nome: "Vivo Fibra", codigo: 7771, categoria: "Fixo", preco: 5}
    ];
    $scope.contatos = []; // Aqui eu criei uma array de contatos, onde cada contato é um objeto com as propriedades nome, telefone e cor.

    //Carregar dados do JSON
    $http.get('http://localhost:3000/contatos').then(function(response) { // Aqui eu usei o serviço $http para fazer uma requisição GET para o arquivo "dados.json". O método "then" é usado para lidar com a resposta da requisição. Se a requisição for bem-sucedida, a função de callback será executada, e a resposta será passada como um argumento para essa função.
        $scope.contatos = response.data; // Aqui eu atribuo os dados obtidos da resposta da requisição à variável $scope.contatos. Isso significa que os contatos obtidos do arquivo "dados.json" serão armazenados na variável $scope.contatos, e essa variável pode ser usada posteriormente para exibir os contatos na interface do usuário.
        // garante que todos tenham data
        $scope.contatos.forEach(function(contato) {
                contato.data = new Date(contato.data || Date.now());
        });
    });

    //Adicionar contato
    $scope.adicionarContato = function(contato) {
        var novoContato = angular.copy(contato);
        novoContato.data = new Date();

        $http.post('http://localhost:3000/contatos', novoContato).then(function() {
            $scope.contatos.push(novoContato);
        }).catch(function(data, status) {
            $scope.message = "Aconteceu um problema: " + data;
        });
        $scope.contato = {};
        $scope.contatoForm.$setPristine();
        $scope.contatoForm.$setUntouched();
    };

    //Remover contatos
    $scope.apagarContatos = function(contatos) {
        $scope.contatos = contatos.filter(function(contato) {
            return !contato.selecionado;
        });
    };

    $scope.isContatoSelecionado = function(contatos) {
        return contatos.some(function(contato) {
            return contato.selecionado;
        });
    };

    $scope.ordenarPor = function(campo) {
        $scope.criterioDeOrdenacao = campo;
        $scope.direcaoDaOrdenacao = !$scope.direcaoDaOrdenacao;
    };

    $scope.exportarJSON = function() {
        const json = JSON.stringify($scope.contatos, null, 2);

        const blob = new Blob([json], { type: "application/json"});
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "contatos.json";
        a.click();

        URL.revokeObjectURL(url);
    };
});