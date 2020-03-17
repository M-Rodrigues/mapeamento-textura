const math = require('mathjs')

let img_to_texture

const arrayOfZeros = (n) => Array.apply(null, Array(n)).map(Number.prototype.valueOf,0);

const generateImgToTexture = (P, Q) => {
  
  img_to_texture = []
  const A = [
    [ ...P[0],                      ...arrayOfZeros(9) ],
    [ ...arrayOfZeros(3), ...P[0],  ...arrayOfZeros(6) ],
    [ ...arrayOfZeros(6),           ...P[0],            ...arrayOfZeros(3) ],
    
    [ ...P[1],                      ...arrayOfZeros(6),  -Q[1][0],        0, 0 ], 
    [ ...arrayOfZeros(3), ...P[1],  ...arrayOfZeros(3),  -Q[1][1],        0, 0 ],
    [ ...arrayOfZeros(6), ...P[1],                            -1,         0, 0 ],

    [ ...P[2],                      ...arrayOfZeros(6),         0, -Q[2][0], 0 ], 
    [ ...arrayOfZeros(3), ...P[2],  ...arrayOfZeros(3),         0, -Q[2][1], 0 ],
    [ ...arrayOfZeros(6), ...P[2],                              0,       -1, 0 ],

    [ ...P[3],                      ...arrayOfZeros(6),         0,        0,  -Q[3][0] ], 
    [ ...arrayOfZeros(3), ...P[3],  ...arrayOfZeros(3),         0,        0,  -Q[3][1] ],
    [ ...arrayOfZeros(6), ...P[3],                              0,        0,  -1       ],
  ]
  const b = [...Q[0], ...arrayOfZeros(9) ]
  
  const X = math.lusolve(A,b).map(row => row[0])

  const H = [
    [...X.slice(0, 3)], 
    [...X.slice(3, 6)],
    [...X.slice(6, 9)]
  ]

  img_to_texture = H
}

const imgToTexture = (p) => {
  const q = math.multiply(img_to_texture, p)
  return math.multiply(q, 1/q[2]).map(v => Math.round(v))
}

module.exports.applyTexture = (texture, img, region) => {
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

  generateImgToTexture(P, Q)

  const final = img.clone()
  for (const { x, y, idx } of final.scanIterator(
    0, 0, final.bitmap.width, final.bitmap.height)
  ) {
    const [tx, ty, s] = imgToTexture([x, y, 1])
    
    const insideTexture = tx >= 0 && tx <= w && ty >= 0 && ty <= h
    if (insideTexture) {
      final.setPixelColor(texture.getPixelColor(tx, ty), x, y)
    }
  }
  return final
}