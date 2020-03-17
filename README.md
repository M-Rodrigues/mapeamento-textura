# Mapeamento Projetivo de Texturas
Projeto da cadeira de Computacao Grafica do IME de 2020

## Requisitos
- ```node 12.16.0```
- ```npm 6.13.4```

## Instalacao
Basta rodar o comando ```npm i``` na raiz do projeto.

## Como usar
A passagem dos parametros de entrada e feita por um aquivo json (como o arquivo ```ex1.json```).
Este deve conter os seguintes atributos:
- **name**: Nome do arquivo final com a textura
- **image_url**: caminho para o arquivo da imagem original que levara a textura
- **texture_url**: caminho para o arquivo da imagem que sera a textura
- **region**: Um array com 4 elementos representando os vertices da imagem origem que levaram a textura. 
A orientacao desses pontos importa, de forma que o primeiro deve ser o do canto superior esquerdo e devem se seguir no sentido horario.

Criado seu arquivo json de configuracao, alterer o arquivo ```app.js``` para que ele carregue o arquivo de configuracao desejado.
``` js
...
const config = require('./ex2.json') // Linha 104
...
```

Feito isso, basta executar o commando ```npm run start``` e verificar a imagem modificada dentro da pasta ```assets```
