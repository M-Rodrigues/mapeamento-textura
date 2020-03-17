(async () => {
  const Jimp = require('jimp')
  const math = require('mathjs')

  const generateH = (P, Q) => {
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
    const b = [ ...Q[0], 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
    
    const X = math.lusolve(A,b).map(row => row[0])

    return [
      [...X.slice(0, 3)], 
      [...X.slice(3, 6)],
      [...X.slice(6, 9)]
    ]
  }

  const imgToTexture = (H, p) => {
    const q = math.multiply(H, p)
    return math.multiply(q, 1/q[2]).map(v => Math.round(v))
  }

  const applyTexture = (texture, img, region) => {
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
    for (const { x, y } of final.scanIterator(
      0, 0, final.bitmap.width, final.bitmap.height)
    ) {
      const [tx, ty, s] = imgToTexture(H, [x, y, 1])
      
      const insideTexture = tx >= 0 && tx <= w && ty >= 0 && ty <= h
      if (insideTexture) {
        final.setPixelColor(texture.getPixelColor(tx, ty), x, y)
      }
    }
    return final
  }

  const config = require('./ex2.json')

  const original = await Jimp.read(config.image_url)  
  const texture  = await Jimp.read(config.texture_url) 

  const final = applyTexture(texture, original, config.region)
  
  await final.writeAsync(`assets/${config.name}.jpeg`)
})()
