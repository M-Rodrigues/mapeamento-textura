const Jimp = require('jimp')

module.exports.loadImage = async (url, name) => {
  console.log(`Loading ${name} image`)
  const img = await Jimp.read(url)
  console.log(`${name} image loaded`)
  return img
}