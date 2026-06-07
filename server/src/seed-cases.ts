import type { ZoneId } from '../../src/board/types.js';

export interface CaseSeedField {
  key: string;
  label: string;
  answer: string;
}

export interface CaseSeed {
  id: string;
  number: number;
  title: string;
  intro: string;
  solutionNarrative: string;
  fields: CaseSeedField[];
  clues: Partial<Record<ZoneId, string>>;
}

export const CASE_SEEDS: CaseSeed[] = [
  {
    id: '001',
    number: 1,
    title: 'O Homem Profano',
    intro: `Sherlock Holmes e eu (Dr. Watson) ficamos sabendo pelos jornais matutinos de que a Scotland Yard estava às voltas com um novo caso. Lestrade chegou cedo à Baker Street para nos dar detalhes e conseguir algum conselho do meu amigo.

Um estranho pregador havia chegado à Londres de navio há alguns dias. Ele trouxe de sua viagem uma grande Bíblia com bonita encadernação marroquina. A duquesa de Lacourt passou a apoiar as ideias dele, desagradando ao Bispo de Whittenfronth e ao duque.

A duquesa e o pregador, fãs da peça Hamlet, foram ao teatro na noite do crime. Durante o intervalo, a duquesa encontrou o corpo do pregador estirado no camarote. O corpo havia sido perfurado por um objeto pontugiado e comprido. A Bíblia do pregador não foi encontrada.

Ao lado do corpo havia um cigarro de marca alemã e uma caixinha de aspirinas. O grupo de teatro era do diretor Earl Akintern, que já namorou a filha da duquesa, a senhorita Kátia.

Lestrade declarou que o principal suspeito era o Bispo de Whittenfronth. Holmes, porém, decidiu investigar o caso por conta própria.`,
    solutionNarrative: `O pregador era um ladrão e roubou o manuscrito de Hamlet durante sua estadia na Riviera francesa. Ele disfarçou o manuscrito como se fosse uma Bíblia e convenceu Akintern a autenticá-lo. Akintern, em situação financeira desesperadora, planejou matar o pregador com uma espada pequena e roubar o manuscrito. Colocou o cigarro alemão ao lado do corpo para incriminar o Bispo, mas deixou cair sua caixa de aspirinas.`,
    fields: [
      { key: 'culprit', label: 'Quem matou o Pregador?', answer: 'Earl Akintern' },
      {
        key: 'motive',
        label: 'Qual foi o motivo do crime?',
        answer:
          'Earl Akintern tem uma divida com o Banco e roubou a Bíblia valiosa para levantar dinheiro',
      },
      { key: 'weapon', label: 'Qual foi a arma do crime?', answer: 'Uma pequena espada' },
      {
        key: 'stolen',
        label: 'Qual foi realmente o objeto roubado?',
        answer: 'Os manuscritos de Hamlet disfarçados numa Bíblia',
      },
    ],
    clues: {
      bank: 'O gerente do banco informou que Earl Akintern possui um empréstimo em aberto e devendo a mais de 60 dias.',
      bar: 'O barman declarou que viu dois dias atrás o Pregador e o diretor Earl Akintern conversando.',
      pawnshop:
        'Averiguamos que todas as pessoas envolvidas no caso não possuem qualquer dívida com a Casa de Penhores.',
      'cigar-shop':
        'O vendedor informou que o Bispo de Whittenfronth é cliente deles e que costuma fumar cigarro alemão.',
      locksmith:
        'O Bispo de Whittenfronth fez recentemente duas cópias de uma chave e disse ser de um armário pessoal.',
      docks:
        'O fiscal da alfândega confirmou que o Pregador chegou de navio há cinco dias. O navio fez parada na Riviera francesa.',
      'carriage-station':
        'Um cocheiro disse que um passageiro deixou cair um objeto parecido com uma pequena espada ao descer do cabriolé no Teatro.',
      drugstore:
        'O farmacêutico informou que Earl Akintern tem dores de cabeça constantes e compra Aspirinas toda semana.',
      hotel: 'Confirmamos que o Pregador ficou hospedado no Hotel desde que chegou à Londres.',
      'book-store':
        'O gerente disse que o manuscrito original de Hamlet havia sido roubado de uma exposição na Riviera francesa.',
      museum:
        'O diretor do museu declarou que Earl Akintern é diretor de teatro e especialista em manuscritos originais.',
      park: 'Um jardineiro viu o Bispo de Whittenfronth e a duquesa Lacourt conversando por longo tempo. O Bispo parecia irritado.',
      'scotland-yard':
        'Lestrade informou que a vítima possuía cor bronzeada, incomum em Londres, e que o Bispo já havia sido encontrado.',
      theater:
        'Funcionários indicaram que o Bispo de Whittenfronth estava no teatro na noite do crime.',
    },
  },
  {
    id: '002',
    number: 2,
    title: 'O inventor morto',
    intro: `Robert Foster chegou ao 221B da Baker Street para pedir ajuda a Holmes. Sua mãe estava presa na Scotland Yard por matar o marido, mas Robert acredita na inocência dela.

Os Foster estavam em Londres para a Convenção dos Inventores, hospedados no mesmo hotel. Na noite anterior foram ao teatro e retornaram tarde. Pela manhã, a Sra. Foster encontrou o marido morto aos pés da escrivaninha, esfaqueado no peito. As portas e janelas estavam trancadas por dentro.

Lestrade deteve a Sra. Foster como principal suspeita. Holmes, porém, acredita que o criminoso ainda está à solta.`,
    solutionNarrative: `O Sr. Walton, ao saber do caso da sua mulher com o Sr. Foster, planejou matar o melhor amigo. Enquanto os casais estavam no teatro, Walton entrou no quarto dos Foster, retirou uma mola do colchão e preparou um mecanismo na cigarreira que lançava uma faca ao ser aberta. Foster, ao acordar e abrir a cigarreira como de costume, caiu na armadilha.`,
    fields: [
      { key: 'culprit', label: 'Quem matou o Sr. Foster?', answer: 'Sr. T. Walton' },
      {
        key: 'method',
        label: 'Como ele foi morto?',
        answer:
          'Por uma cigarreira com mecanismo de mola que lançou uma faca contra o peito da vítima',
      },
      { key: 'motive', label: 'Qual foi o motivo do crime?', answer: 'Ciúme vingativo' },
    ],
    clues: {
      bank: 'Encontramos a Sra. Walton no banco. Ela disse que o marido a aguardava no hotel.',
      bar: 'O porteiro Dubby Wallingford viu o Sr. Walton irritado após flagrar a esposa com o Sr. Foster no saguão.',
      pawnshop: 'Não havia qualquer débito pendente das pessoas envolvidas no caso.',
      'cigar-shop':
        'O casal Southerington disse que Foster costumava fumar um cigarro ao acordar, fato conhecido por todos.',
      locksmith: 'O dono informou que não fez cópias de chave para o Hotel recentemente.',
      docks: 'Holmes disse que aqui não há pista alguma para elucidar o caso.',
      'carriage-station':
        'O cocheiro do Hotel disse que o Sr. e Sra. Walton discutiam muito ao entrar no cabriolé na noite do crime.',
      drugstore:
        'Lestrade não acredita na teoria de Holmes de que a arma foi uma cigarreira preparada com mola.',
      hotel: 'Funcionários viram Foster e a Sra. Walton cochichando e se abraçando no saguão.',
      'book-store':
        'Foi vendido um livro sobre invenções ao Sr. Walton, que também é inventor e muito criativo.',
      park: 'A criada Berenice Melbourne disse que Foster e a Sra. Walton tinham um caso e que Walton é muito ciumento.',
      'scotland-yard':
        'Robert Foster disse que o pai e a Sra. Walton haviam trabalhado juntos em várias invenções.',
      theater: 'O bilheteiro viu os Foster e os Southerington juntos no teatro.',
    },
  },
  {
    id: '003',
    number: 3,
    title: 'O Mecha Prateada',
    intro: `O famoso puro-sangue Mecha Prateada e seu treinador Oscar Switt foram encontrados mortos nos estábulos do Sr. Cosgrove. O cavalo foi envenenado e o treinador golpeado e retalhado.

Gregson pediu ajuda a Holmes. As pistas na cena incluíram estilhaços de garrafa e um recibo da Casa de Penhores. Foram interrogados Cosgrove, sua esposa Hilda, a cozinheira Maggie Donald, o pintor Henry Donald e o criador rival Archibald Baxter. A Scotland Yard suspeita de Bobby Jansen, tratador que abandonou os estábulos há 15 dias.`,
    solutionNarrative: `Cosgrove, precisando de dinheiro, tingiu a crina do Mecha Prateada de preto e a do Diabo Negro de cinza, trocou os cavalos de baia e envenenou o Diabo Negro para receber o seguro. Surpreendido por Switt, bateu-lhe na cabeça com uma garrafa de cerveja e estocou o corpo com os estilhaços.`,
    fields: [
      { key: 'culprit', label: 'Quem matou o cavalo e o treinador?', answer: 'Sr. Reginald Cosgrove' },
      { key: 'weapon', label: 'Qual a arma usada para matar o treinador?', answer: 'Uma garrafa quebrada' },
      { key: 'motive', label: 'Qual o motivo do crime?', answer: 'Prêmio do seguro do Mecha Prateada' },
    ],
    clues: {
      bank: 'O gerente informou que Cosgrove fez um seguro de valor expressivo para o Mecha Prateada.',
      bar: 'Gregson disse que Archibald Baxter havia comprado veneno para formigas alguns dias atrás.',
      pawnshop: 'O recibo do penhor encontrado na cena está em nome de Cosgrove e está atrasado.',
      'cigar-shop':
        'O pintor Henry Donald disse que Cosgrove pediu tinta cinza e preta para as baias, que são brancas.',
      locksmith: 'Bobby Jansen trabalha na loja e foi ao Museu fazer um serviço.',
      docks: 'Gregson contou que havia respingos de tinta preta no chão da baia do Mecha Prateada.',
      'carriage-station':
        'Um cocheiro que trabalhou para Baxter disse que Baxter é pessoa correta e não cometeu o crime.',
      drugstore: 'Gregson informou respingos de tinta cinza na baia do Diabo Negro.',
      hotel: 'Um funcionário da Chaveiro, Jansen, esteve no Hotel para abrir uma porta.',
      'book-store':
        'Baxter confirmou comprar veneno para formigas, mas estranhou que metade do quilo havia sumido.',
      museum: 'Bobby Jansen declarou que saiu dos estábulos Cosgrove por atraso nos salários.',
      park: 'Gregson recebeu dica de Holmes: a arma do crime é uma garrafa quebrada.',
      'scotland-yard': 'Gregson deixou bilhete informando que Jansen trabalha na loja de Chaveiros.',
      theater: 'O teatro apresentará "O fantasma da ópera" este mês.',
    },
  },
  {
    id: '004',
    number: 4,
    title: 'A vingança do Camaleão',
    intro: `Byron Chivers, amigo de infância de Holmes, visitou a Baker Street. Planejávamos assistir ao concerto de Alfredo Fetuchinni no Teatro quando Lestrade chegou com más notícias: o Camaleão, gênio do disfarce, escapou da prisão e jurou vingança contra Holmes.

Lestrade pediu que Holmes não saísse do apartamento, mas Holmes recusou-se a esperar. O jogo havia começado novamente.`,
    solutionNarrative: `O Camaleão prendeu Lestrade num armazém e assumiu sua identidade. Soube do dueto de Holmes com Fetuchinni, roubou nitroglicerina das Docas, colocou-a dentro de um violino e planejou detoná-la durante o concerto no Teatro. Holmes descobriu a trama e capturou-o após a troca dos violinos.`,
    fields: [
      {
        key: 'device',
        label: 'Que artifício o Camaleão planeja para se vingar de Holmes?',
        answer: 'Colocar nitroglicerina dentro do violino e fazê-la detonar',
      },
      { key: 'location', label: 'Onde será o ataque do Camaleão?', answer: 'No Teatro' },
      { key: 'disguise', label: 'Qual o disfarce do Camaleão?', answer: 'Está disfarçado de Lestrade' },
    ],
    clues: {
      bank: 'O gerente perguntou se vimos Lestrade buscar um documento importante que ainda não retirou.',
      bar: 'O barman viu Lestrade com uma maleta de violino, estranho porque ele não bebe no serviço.',
      pawnshop:
        'O diretor do Teatro convidou Holmes para tocar um dueto com Fetuchinni usando um violino do concertista.',
      'cigar-shop': 'Lestrade comprou cigarros apressado para ir ao Teatro, mas Holmes sabe que ele não fuma.',
      locksmith: 'Lestrade pediu abrir uma caixa de violino e fazer nova chave — Holmes não sabia que ele tocava violino.',
      docks: 'Lestrade recolheu um frasco de nitroglicerina confiscado de um navio com contrabando.',
      'carriage-station':
        'Um cocheiro levou alguém das Docas com uma maleta de violino, pedindo que não corresse.',
      drugstore: 'Holmes aconselhou Watson a tomar xarope para a tosse.',
      hotel: 'Nos registros das últimas 48 horas não havia pista sobre o Camaleão.',
      'book-store': 'Os jornais já estampavam a notícia da fuga do Camaleão.',
      park: 'Holmes comentou que o ataque provavelmente ocorrerá no Teatro.',
      'scotland-yard': 'Foi Lestrade quem conduzia o Camaleão quando ele escapou.',
      theater: 'O local do concerto de hoje à noite já está preparado.',
    },
  },
  {
    id: '005',
    number: 5,
    title: 'A mensagem em código',
    intro: `Gregson pediu ajuda a Holmes após encontrar Rafer Harmon, dono da loja de penhores, morto sobre a escrivaninha. Perto da vítima havia um envelope para Harry Blake na Suíça com a mensagem cifrada: "NHQZMZBNCNQSMDCQZGJN".

Harmon era na verdade Rodolph Hickel, ladrão procurado envolvido no roubo das pérolas gêmeas "Olhos de Lúcifer", avaliadas em mais de 50 mil libras. Hickel desapareceu com as pérolas após passar a perna nos comparsas.`,
    solutionNarrative: `Hickel fez o canário engolir as pérolas e tentou avisar seu amigo Blake com mensagem em código. Perdeu o livro de códigos, comprou outro na livraria, mas teve ataque cardíaco ao escrever a mensagem. A Sra. Trevors encontrou o livro de códigos que permitiu decifrar: olhar dentro do canário.`,
    fields: [
      { key: 'message', label: 'O que diz a mensagem cifrada?', answer: 'Olhar dentro do canário' },
      { key: 'pearls', label: 'Onde estão as pérolas roubadas?', answer: 'Dentro do canário' },
    ],
    clues: {
      bar: 'Paramos no bar para molhar a garganta.',
      bank: 'Não havia nada de Harmon ou Hickel no cofre do banco.',
      pawnshop: 'Holmes vasculhou a dependência acima da Casa de Penhores sem encontrar pistas.',
      'cigar-shop': 'Holmes comprou fumo para o cachimbo.',
      locksmith: 'A Sra. Trevors pediu desculpas e nos aguardava na porta do Hotel.',
      docks: 'Gregson não achou pistas nas docas.',
      'carriage-station': 'Pegamos um cabriolé — os pés de Watson estavam cansados.',
      drugstore: 'A Sra. Trevors marcou encontro no Parque às 14h com algo da escrivaninha.',
      hotel:
        'A Sra. Trevors mostrou um livro de códigos. Holmes decifrou parcialmente: OIRANACODORTNEDRAHLO.',
      'book-store': 'Harmon havia comprado um livro sobre códigos e enigmas.',
      museum: 'O curador acredita que as pérolas estão com alguém em Londres aguardando o caso esfriar.',
      park: 'Aguardamos a Sra. Trevors, mas ela não apareceu.',
      'scotland-yard': 'Gregson verificou envios para a Suíça sem sucesso.',
      theater: 'Holmes parou em frente ao Teatro e disse: a mensagem está escrita de trás para frente.',
    },
  },
  {
    id: '006',
    number: 6,
    title: 'O banqueiro assassinado',
    intro: `Lestrade contou que Walter Ostermann, auditor do banco, foi encontrado morto em seu escritório. A secretária Rita Frawley saiu às 9h30 para comprar ingressos e ao retornar às 10h encontrou Ostermann golpeado na cabeça. A fechadura dos arquivos estava quebrada.

Patrick Tomball, diretor de empréstimos, teve reunião das 9h30 às 10h e deixou-o são e salvo às 9h50. Wellington Bakman, tesoureiro, ouviu um barulho por volta das 9h50.`,
    solutionNarrative: `Ostermann descobriu que Bakman desviava dinheiro do banco. Ofereceu-lhe revelar os fatos na reunião com Tomball. Bakman matou o auditor por trás com um peso de papel, removeu provas do desfalque e sumiu com o peso. Bakman é canhoto, o que confirmou o sentido do ferimento.`,
    fields: [
      { key: 'culprit', label: 'Quem matou Walter Ostermann?', answer: 'Wellington Bakman' },
      { key: 'weapon', label: 'Qual foi a arma do crime?', answer: 'Peso de papel' },
      {
        key: 'motive',
        label: 'Qual foi o motivo do crime?',
        answer: 'Esconder o desfalque que estava ocorrendo no Banco',
      },
    ],
    clues: {
      bank: 'Holmes viu a agenda de Ostermann e a reunião com Tomball sobre lucros do banco.',
      bar: 'Bakman segurava o copo com a mão esquerda — era canhoto.',
      pawnshop: 'Nenhum envolvido possui pendências na Casa de Penhores.',
      'cigar-shop': 'O vendedor conhece Bakman, que só compra cigarros caros.',
      locksmith: 'Um funcionário foi ao banco consertar uma fechadura.',
      docks: 'Tomball encontrou rascunho de Ostermann na lixeira com anotações de possível desfalque.',
      'carriage-station': 'Um cocheiro disse que Bakman gosta de restaurantes finos.',
      hotel: 'O gerente confidenciou que Ostermann e Frawley passavam noites juntos no hotel.',
      'book-store':
        'Holmes reparou que faltava um peso de papel na mesa de Ostermann — possível arma do crime.',
      museum: 'Tomball confirmou que é destro.',
      park: 'Frawley confirmou que é destra.',
      'scotland-yard':
        'O legista disse que o ferimento provavelmente foi causado por uma pessoa canhota.',
      theater: 'Frawley comprou ingressos por volta das 9h40.',
    },
  },
  {
    id: '007',
    number: 7,
    title: 'Os ossos do Ofício',
    intro: `O arqueólogo Joseph Mactriton chegou afobado à Baker Street. Ele e o assistente Johann Getralt trouxeram de Sumatra dois pacotes com ossos do suposto Homem de Sumatra para o museu.

Após um acidente com um cabriolé no parque, os pacotes foram guardados no cofre do museu. Na manhã seguinte, ao abrir os pacotes na presença do expert Max Scribber, os ossos haviam desaparecido — havia apenas objetos e roupas.`,
    solutionNarrative: `Mactriton, debilitado pela malária e sem a descoberta da sua vida, simulou a ossada e planejou um falso roubo para ganhar fama mesmo sem apresentar os ossos à comunidade científica. Os ossos nunca existiram.`,
    fields: [
      { key: 'thief', label: 'Quem pegou os ossos do Homem de Sumatra?', answer: 'ninguém' },
      {
        key: 'location',
        label: 'Onde estão os ossos?',
        answer: 'em lugar nenhum porque os ossos não existem',
      },
    ],
    clues: {
      bank: 'Joe Steppran disse que nada de suspeito ocorreu no museu.',
      bar: 'O barman viu Matingale e Mactriton conversando, mas não ouviu o assunto.',
      pawnshop: 'Scribber comentou que Getralt não tem formação acadêmica em arqueologia.',
      'cigar-shop': 'Holmes acredita que o Homem de Sumatra não existe — Mactriton busca autopromoção.',
      locksmith: 'Scribber disse que Mactriton nunca fez descoberta importante antes.',
      docks: 'O fiscal ouviu Mactriton dizer que a malária não o impediria de ficar famoso.',
      'carriage-station': 'O cocheiro Prittnor disse que os pacotes não abriram nem foram trocados.',
      drugstore: 'Getralt comprou remédios para malária.',
      'book-store':
        'O jornal destacava que a descoberta tornaria Mactriton mundialmente conhecido.',
      museum: 'Matingale disse que o servente Steppran ajustava a tubulação onde os pacotes foram abertos.',
      'scotland-yard':
        'Lestrade informou que os pacotes não foram abertos na alfândega e investigam possível suborno.',
      theater: 'A peça em cartaz é "A múmia".',
    },
  },
];
