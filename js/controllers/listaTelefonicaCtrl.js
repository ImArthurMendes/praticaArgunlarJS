angular.module("listaTelefonica").controller("listaTelefonicaCtrl", function($scope, $q, contatosAPI, operadorasAPI, serialGenerator) {
    console.log(serialGenerator.generate());
    $scope.app = "LISTA TELEFÔNICA";
    $scope.contatos = [];
    $scope.operadoras = [];
    
    // variavel criada para carregar os contatos do Service "contatosAPI", se der erro (cacth) ao carregar, mostrar a mensagem "Erro ao carregar contatos."
    var carregarContatos = function() {
        contatosAPI.getContatos().then(function(response) {
            $scope.contatos = response.data;
            $scope.contatos.forEach(function(contato) {
                contato.data = new Date(contato.data || Date.now());
            });
        }).catch(function() {
            $scope.messageError = "Não foi possível carregar os dados!";
        });
    };
    carregarContatos();

    // variavel criada para carregar as operadoras do Service "operadorasAPI", se der erro (cacth) ao carregar, retornar a mensagem "Erro ao carregar operadoras."
    var carregarOperadoras = function() {
        operadorasAPI.getOperadoras().then(function(response) {
            $scope.operadoras = response.data || [];
        }).catch(function() {
            $scope.message = "Erro ao carregar operadoras.";
        });
    };
    carregarOperadoras();

    $scope.adicionarContato = function(contato) { //essa função é exposta pelo $scope e a view (html) consegue chama-la. O parâmetro "contato" vem do ng-model do formulário que o usuário preencher no "html". 
        contato.serial = serialGenerator.generate();
        var novoContato = angular.copy(contato); //essa função foi criada para o angular fazer uma cópia profunda do objeto, evitando que ele seja "sobrecarregado" por uma nova chamada
        novoContato.data = new Date(); //como o formulário não tem campo de data, essa função adiciona a data atual no objeto "novoContato".

        contatosAPI.saveContato(novoContato).then(function(response) { //aqui o Controller delega ao Service a responsabilidade de salvar. A função só continua se a promise (.then) confirmar que o servidor salvou. Seria basicamente um "quando o servidor responder com sucesso, execute isso"
            var salvo = response.data; //o servidor retorna o contato salvo (agora com o ID geado pelo banco). O response.data é o objet que veio do back-end.
            salvo.data = new Date(salvo.data); //A data vem como string do servidor, então  new.date(salvo.data) converte de volta apra objeto DATE, essa conversão é necessária para o filtro "date" do AngularJS funcionar na View.
            $scope.contatos.push(salvo); //empurra o contato retornado pelo servidor para o array local, não é o "novoContato" que entra na lista, é o "salvo" que veio do servidor já com o ID. Isso acontece porque é o backend que cria o ID, não o frontend.
            //as operações abaixo são operações de limpeza no frontend, sem essas três linhas, o formulário ficaria com os dados anteriores e com as validações visiveis.
            $scope.contato = {}; //esvazia os campos do formulário.
            $scope.contatoForm.$setPristine(); //diz ao AngularJS que o formulário está "limpo", como se nunca tivesse sido editado.
            $scope.contatoForm.$setUntouched(); //diz que nenhum campo foi tocado, o que faz as mensagens de validação desaparecerem.
        // se o .then falhar, a função cai aqui.
        }).catch(function() {
            $scope.message = "Erro ao salvar contato."; //O $scope.message é atribuído mas não existe no HTML, o erro é capturado mas nunca exibido ao usuário.
        });
    };

    $scope.apagarContatos = function(contatos) {
        var selecionados = contatos.filter(function(c) { //recebe o array completo de contatos e filtra apenas os que tem "selecionado == true", ou seja, os que o usuário marcou o checkbox
            return c.selecionado;
        });
        if (selecionados.length === 0) return; //linha de segurança. se nenhum estiver selecionado, a função para imediatamente. Apenas uma boa prática defensiva.

        var idsParaRemover = selecionados.map(function(c) { return c.id; }); //extrai apenas os IDs dos contatos selecionados em um array separado. Esse array será usado depois para saber quais contatos remover da lista local. O "map()" transforma cada objeto contato em apenas seu ID.

        var promises = selecionados.map(function(c) { //para cada contato selecionado, dispara uma requisição DELETE no servidor. Como são múltiplos contatos, são múltiplas requisições, cada uma retorna uma Promise.
            return contatosAPI.deleteContato(c.id);
        });

        $q.all(promises).then(function() { //o "$q.all()" recebe o array de variável "promises" e espera todas terminarem, só entra no ".then" quando 100% das requisições tiverem sucesso, se qualquer uma falhar, vai direto para o ".catch()"
            $scope.contatos = $scope.contatos.filter(function(c) { //aqui a lógica é invertida propositalmente. Em vez de remover os selecioandos, ele mantém apenas os que NÃO estão na lista de IDs para remover. 
                return idsParaRemover.indexOf(c.id) === -1; //"indexOf" retorna -1 quando o ID não está na lista, ou seja, quem não está na lista de remoção fica. Isso só acontece após a confirmação do servidor, nunca antes. 
            });
        }).catch(function() { //se qualquer DELETE falhar, ele recarrega a lista do servidor, isso é importante porque o estado local pode ter ficado inconsistente (alguns deletados, outros não). Recarregar garante que a View reflita a realidade do banco.
            $scope.message = "Erro ao apagar um ou mais contatos. Recarregue a lista."; 
            carregarContatos();
        });
    };

    $scope.isContatoSelecionado = function(contatos) { //retorna "true" se pelo menos um contato estiver selecionado. O ".some()" para na primeira ocorrência verdadeira. Na view ela é usada assim "ng-if="isContatoSelecionado(contatos)"". O botão "apagar" só aparece enquanto essa função retornar "true".
        return contatos.some(function(c) { return c.selecionado; });
    };

    $scope.ordenarPor = function(campo) {
        if ($scope.criterioDeOrdenacao === campo) { //se o campo clicado já é o critério atual, inverte a posição. "!$scope.direcaoDaOrdenacao" alterna entre "true" (decrecente) e "false" (crescente).
            $scope.direcaoDaOrdenacao = !$scope.direcaoDaOrdenacao;
        } else { //se não, define o novo critério e reseta a direção para crescente.
            $scope.criterioDeOrdenacao = campo;
            $scope.direcaoDaOrdenacao = false;
        }
    };

    $scope.exportarJSON = function() {
        const json = JSON.stringify($scope.contatos, null, 2); //converte o array de contatos em string JSON formatada. O null e o 2 são parâmetros de formatação, o "2" define 2 espaços de identação, tornando o arquivo legível.
        const blob = new Blob([json], { type: "application/json" }); //um blod é um objeto binário que representa um arquivo em memória, aqui ele empacota o JSON como se fosse um arquivo .json real, mas sem salvar nada em disco ainda.
        const url = URL.createObjectURL(blob); //gera uma URL temporária que aponta para esse Blod na memória do navegador. Essa URL existe apenas enquato a URL estiver aberta
        const a = document.createElement("a"); //cria um link invisível apontando para aquela URL, define o nome do arquivo para download e simula um clique nele.
        a.href = url;
        a.download = "contatos.json"; //o navegador interpreta cmo se o usuário tivesse clicado em um link de download.
        a.click();
        URL.revokeObjectURL(url); //Libera a URL temporária da memória. Sem isso, o Blod ficaria ocupando memória até a página ser fechada. É o equivalente a limpar o lixo após terminar de usar.
    };
});