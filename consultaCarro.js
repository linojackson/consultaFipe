async function carregaMeses() {
    let options = '';
    let optionPadrao = "<option value='%v'>%t</option>\n";
  
    const response = await fetch("https://brasilapi.com.br/api/fipe/tabelas/v1");
    const jsonMeses = await response.json();

    jsonMeses.forEach((mes) => {
        const novaOption = optionPadrao.replace("%v", mes.codigo).replace("%t", mes.mes);
        options += novaOption;
    });

    return options;
}

async function buscaAsParada(codigoFipe, arrMeses) {
    const valorMes = [];
  
    await Promise.all(arrMeses.map(async (mes) => {
        const response = await fetch("https://brasilapi.com.br/api/fipe/preco/v1/" + codigoFipe + "?tabela_referencia=" + mes);
        const jsonCarros = await response.json();
    
        jsonCarros.forEach((anoModelo) => {
            if (anoModelo.anoModelo === 2007) {
                const infosCarro = {};
        
                infosCarro.valor = anoModelo.valor;
                infosCarro.mesReferencia = anoModelo.mesReferencia;
        
                valorMes.push(infosCarro);
            }
        });
    }));

    return valorMes;
}

async function mostraAsParada(codigoFipe, arrMeses) {
    const ValoresPorMes = await buscaAsParada(codigoFipe, arrMeses);

    const csvHeader =  "Valor;MesReferencia";
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += csvHeader + "\r\n";
    
    ValoresPorMes.forEach((rowArray) => {
        const row = rowArray.valor + ';' + substituirTexto(rowArray.mesReferencia);
        csvContent += row + "\r\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
}

function substituirTexto(texto) {
    const substituicoes = {
        'janeiro de ': 'jan/',
        'fevereiro de ': 'fev/',
        'março de ': 'mar/',
        'abril de ': 'abr/',
        'maio de ': 'mai/',
        'junho de ': 'jun/',
        'julho de ': 'jul/',
        'agosto de ': 'ago/',
        'setembro de ': 'set/',
        'outubro de ': 'out/',
        'novembro de ': 'nov/',
        'dezembro de ': 'dez/'
    };

    for (const chave in substituicoes) {
        if (substituicoes.hasOwnProperty(chave)) {
            texto = texto.replace(chave, substituicoes[chave]);
        }
    }

    return texto;
}

function pegaAsParadaPraMostar() {
    const codigoFipe = document.getElementById('codigoFipe');
    const mesesFiltrados = document.getElementById('mesesFiltrados');

    const valorCodigoFipe = codigoFipe.value;
    const valoresMesesFiltrados = [...mesesFiltrados.selectedOptions].map(option => option.value);

    console.log('Código fipe:', valorCodigoFipe);
    console.log('Meses a gerar:', valoresMesesFiltrados);

    mostraAsParada(valorCodigoFipe, valoresMesesFiltrados);
}

const mesesFiltrados = document.getElementById('mesesFiltrados');

let options = '';
let optionPadrao = "<option value='%v'>%t</option>\n";

fetch("https://brasilapi.com.br/api/fipe/tabelas/v1")
    .then(response => response.json())
    .then(jsonMeses => {
        jsonMeses.forEach(mes => {
            const novaOption = optionPadrao.replace("%v", mes.codigo).replace("%t", mes.mes);
            options += novaOption;
        });

        const mesesFiltrados = document.getElementById('mesesFiltrados');
        mesesFiltrados.innerHTML = options;
    })
    .catch(error => {
        console.error("Erro ao carregar os meses:", error);
    });