const input = require('../config.json')
const { loadImage } = require('./utils')
const { applyTexture } = require('./image')

async function main() {
  // Load original image and texture image
  const [image_original, image_texture] = await Promise.all([
    loadImage(input.image_url, 'original'),
    loadImage(input.texture_url, 'texture')
  ])

  // Apply texture to the original image
  const image_final = await applyTexture(image_texture, image_original, input.region)
  
  // Save images
  await Promise.all([
    image_original.writeAsync('../assets/original.jpeg'),
    image_texture.writeAsync('../assets/texture.jpeg'),
    image_final.writeAsync('../assets/final.jpeg'),
  ])
}

main()