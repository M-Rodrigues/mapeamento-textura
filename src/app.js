(async () => {
  const Jimp = require('jimp')
  const math = require('mathjs')

  /**
   * Calcula a transformacao projetiva que leva o espaco definido 
   * pelos pontos P para os espaco definido pelos pontos Q.
   * 
   * @param {*} P Lista de 4 pontos em RP2 do espaco original
   * @param {*} Q Lista de 4 pontos em RP2 do espaco de destino
   */
  const generateH = (P, Q) => {
    // Matriz dos coeficientes do sistema contendo [tij] e lambda_i
    const A = [
      [ ...P[0], 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, ...P[0], 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, ...P[0], 0, 0, 0,],
      
      [ ...P[1], 0, 0, 0, 0, 0, 0, -Q[1][0], 0, 0 ], 
      [ 0, 0, 0, ...P[1], 0, 0, 0, -Q[1][1], 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, ...P[1], -1, 0, 0 ],

      [ ...P[2], 0, 0, 0, 0, 0, 0, 0, -Q[2][0], 0 ], 
      [ 0, 0, 0, ...P[2], 0, 0, 0, 0, -Q[2][1], 0 ],
      [ 0, 0, 0, 0, 0, 0, ...P[2], 0, -1, 0 ],

      [ ...P[3], 0, 0, 0, 0, 0, 0, 0, 0, -Q[3][0] ], 
      [ 0, 0, 0, ...P[3], 0, 0, 0, 0, 0, -Q[3][1] ],
      [ 0, 0, 0, 0, 0, 0, ...P[3], 0, 0, -1],
    ]

    // Possui apenas os valores do primeiro ponto pois tomou-se lambda_1 = 1
    const b = [ ...Q[0], 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
    
    // Resolvendo o sistema para encontrar os valores de [tij] e lambda_i
    // Esse sistema sempre tem solucao pelo Teorema fundamental da geometria projetiva plana
    const X = math.lusolve(A,b).map(row => row[0])

    // Construindo a matriz que representa a transformacao projetiva
    return [
      [...X.slice(0, 3)], 
      [...X.slice(3, 6)],
      [...X.slice(6, 9)]
    ]
  }

  /**
   * Aplica a transformacao H no ponto p
   * 
   * @param {*} H Matriz da transformacao projetiva de RP2 em RP2
   * @param {*} p Ponto de RP2
   */
  const imgToTexture = (H, p) => {
    const q = math.multiply(H, p)
    return math.multiply(q, 1/q[2]).map(v => Math.round(v))
  }
  
  /**
   * Aplica uma textura em uma imagem na regiao determinada
   * @param {*} texture imagem referente a textura
   * @param {*} img imagem referente a figura original
   * @param {*} region regiao onde a textura deve ser inserida na imagem original
   */
  const applyTexture = (texture, img, region) => {
    // Dimensoes da imagem de textura
    const w = texture.bitmap.width
    const h = texture.bitmap.height
    
    const P = [
      [...region[0], 1],
      [...region[1], 1],
      [...region[2], 1],
      [...region[3], 1],
    ]
    const Q = [
      [0, 0, 1],
      [w, 0, 1],
      [w, h, 1],
      [0, h, 1]
    ]

    const H = generateH(P, Q)

    const final = img.clone()

    // Realiza uma varredura por todos os pontos da imagem original
    for (const { x, y } of final.scanIterator(
      0, 0, final.bitmap.width, final.bitmap.height)
    ) {
      // Aplica a transformacao
      const [tx, ty, s] = imgToTexture(H, [x, y, 1])
      
      // Verifica se o ponto esta dentro da textura
      const insideTexture = tx >= 0 && tx <= w && ty >= 0 && ty <= h
      if (insideTexture) {

        // Caso esteja, substitua cor na imagem original pela cor do pixel mapeado na textura
        final.setPixelColor(texture.getPixelColor(tx, ty), x, y)
      }
    }
    return final
  }

  const config = require('./ex1.json')

  const original = await Jimp.read(config.image_url)  
  const texture  = await Jimp.read(config.texture_url) 

  const final = applyTexture(texture, original, config.region)
  
  await final.writeAsync(`assets/${config.name}.jpeg`)
})()
