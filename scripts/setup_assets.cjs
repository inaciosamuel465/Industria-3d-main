const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', err => fs.unlink(dest, () => reject(err)));
  });
}

async function setup() {
  // 1. Setup Mesa Madeira
  const mesaDir = path.resolve(__dirname, '../public/models/factory/mesamadeira');
  const mesaTexDir = path.join(mesaDir, 'textures');
  if (!fs.existsSync(mesaTexDir)) fs.mkdirSync(mesaTexDir, { recursive: true });

  execSync(`powershell -Command "Expand-Archive -Path 'C:\\Users\\inaci\\Downloads\\mesamadeira.zip' -DestinationPath '${mesaDir}' -Force"`);
  
  await download('https://dl.polyhaven.org/file/ph-assets/Models/gltf/4k/small_wooden_table_01/small_wooden_table_01_4k.gltf', path.join(mesaDir, 'small_wooden_table_01.gltf'));
  await download('https://dl.polyhaven.org/file/ph-assets/Models/gltf/4k/small_wooden_table_01/small_wooden_table_01.bin', path.join(mesaDir, 'small_wooden_table_01.bin'));
  
  // Clean mesa gltf
  const mesaGltfPath = path.join(mesaDir, 'small_wooden_table_01.gltf');
  const mesaGltf = JSON.parse(fs.readFileSync(mesaGltfPath, 'utf8'));
  mesaGltf.images = [{ mimeType: 'image/jpeg', name: 'small_wooden_table_01_diff', uri: 'textures/small_wooden_table_01_diff_4k.jpg' }];
  mesaGltf.textures = [{ sampler: 0, source: 0 }];
  if (mesaGltf.materials?.[0]?.pbrMetallicRoughness) {
    mesaGltf.materials[0].pbrMetallicRoughness.baseColorTexture = { index: 0 };
    delete mesaGltf.materials[0].pbrMetallicRoughness.metallicRoughnessTexture;
    delete mesaGltf.materials[0].normalTexture;
  }
  fs.writeFileSync(mesaGltfPath, JSON.stringify(mesaGltf, null, 2));
  console.log('Mesa Madeira setup complete!');

  // 2. Setup Carro Ferramenta
  const cartDir = path.resolve(__dirname, '../public/models/factory/carroferramenta');
  const cartTexDir = path.join(cartDir, 'textures');
  if (!fs.existsSync(cartTexDir)) fs.mkdirSync(cartTexDir, { recursive: true });

  execSync(`powershell -Command "Expand-Archive -Path 'C:\\Users\\inaci\\Downloads\\carroferramenta.zip' -DestinationPath '${cartDir}' -Force"`);

  await download('https://dl.polyhaven.org/file/ph-assets/Models/gltf/4k/tool_cart/tool_cart_4k.gltf', path.join(cartDir, 'tool_cart.gltf'));
  await download('https://dl.polyhaven.org/file/ph-assets/Models/gltf/4k/tool_cart/tool_cart.bin', path.join(cartDir, 'tool_cart.bin'));

  // Clean cart gltf
  const cartGltfPath = path.join(cartDir, 'tool_cart.gltf');
  const cartGltf = JSON.parse(fs.readFileSync(cartGltfPath, 'utf8'));
  cartGltf.images = [{ mimeType: 'image/jpeg', name: 'tool_cart_diff', uri: 'textures/tool_cart_diff_4k.jpg' }];
  cartGltf.textures = [{ sampler: 0, source: 0 }];
  if (cartGltf.materials?.[0]?.pbrMetallicRoughness) {
    cartGltf.materials[0].pbrMetallicRoughness.baseColorTexture = { index: 0 };
    delete cartGltf.materials[0].pbrMetallicRoughness.metallicRoughnessTexture;
    delete cartGltf.materials[0].normalTexture;
  }
  fs.writeFileSync(cartGltfPath, JSON.stringify(cartGltf, null, 2));
  console.log('Carro Ferramenta setup complete!');
}

setup().catch(console.error);
