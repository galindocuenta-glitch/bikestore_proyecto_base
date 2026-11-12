import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import ts from 'typescript'
import { pool } from '../db.js'

interface SeedProduct {
  id: number
  name: string
  category: string
  price: number
  stock: number
  description: string
  badge: string | null
  imageUrl?: string
}

function literalValue(node: ts.Expression | undefined): string | number | null | undefined {
  if (!node) return undefined
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text
  if (ts.isNumericLiteral(node)) return Number(node.text)
  if (node.kind === ts.SyntaxKind.NullKeyword) return null
  return undefined
}

function imageValue(node: ts.Expression | undefined, sourceFile: ts.SourceFile): string | undefined {
  const directValue = literalValue(node)
  if (typeof directValue === 'string') return directValue
  if (!node || !ts.isPropertyAccessExpression(node) || !ts.isIdentifier(node.expression)) return undefined

  const constantName = node.expression.text
  let imageUrl: string | undefined
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== constantName || !declaration.initializer) continue
      const initializer = ts.isAsExpression(declaration.initializer)
        ? declaration.initializer.expression
        : declaration.initializer
      if (!ts.isObjectLiteralExpression(initializer)) continue
      const property = initializer.properties.find((candidate) =>
        ts.isPropertyAssignment(candidate) &&
        (ts.isIdentifier(candidate.name) || ts.isStringLiteral(candidate.name)) &&
        candidate.name.text === node.name.text,
      )
      if (property && ts.isPropertyAssignment(property)) {
        const value = literalValue(property.initializer)
        if (typeof value === 'string') imageUrl = value
      }
    }
  }
  return imageUrl
}

function readCatalog(source: string): SeedProduct[] {
  const file = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  let catalog: ts.ArrayLiteralExpression | undefined

  const findCatalog = (node: ts.Node): void => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === 'ALL_PRODUCTS' && node.initializer && ts.isArrayLiteralExpression(node.initializer)) {
      catalog = node.initializer
      return
    }
    ts.forEachChild(node, findCatalog)
  }
  findCatalog(file)
  if (!catalog) throw new Error('No se encontró ALL_PRODUCTS en Frontend/src/App.tsx.')

  return catalog.elements.map((element) => {
    if (!ts.isObjectLiteralExpression(element)) throw new Error('Entrada de producto no reconocida en ALL_PRODUCTS.')
    const values = new Map<string, string | number | null | undefined>()
    for (const property of element.properties) {
      if (ts.isPropertyAssignment(property) && (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name))) {
        values.set(property.name.text, literalValue(property.initializer))
      }
    }
    const imageProperty = element.properties.find((property) =>
      ts.isPropertyAssignment(property) &&
      (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) &&
      property.name.text === 'img',
    )
    const product = {
      id: values.get('id'),
      name: values.get('name'),
      category: values.get('category'),
      price: values.get('price'),
      stock: values.get('stock'),
      description: values.get('description'),
      badge: values.get('badge'),
    }
    if (typeof product.id !== 'number' || typeof product.name !== 'string' || typeof product.category !== 'string' || typeof product.price !== 'number' || typeof product.stock !== 'number') {
      throw new Error(`Producto incompleto en ALL_PRODUCTS: ${String(product.name ?? product.id)}.`)
    }
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      description: typeof product.description === 'string' ? product.description : '',
      badge: typeof product.badge === 'string' ? product.badge : null,
      imageUrl: imageProperty && ts.isPropertyAssignment(imageProperty)
        ? imageValue(imageProperty.initializer, file)
        : undefined,
    }
  })
}

try {
  const appFile = resolve(process.cwd(), '../Frontend/src/App.tsx')
  const products = readCatalog(await readFile(appFile, 'utf8'))
  const productIds = products.map((product) => product.id)
  if (new Set(productIds).size !== productIds.length) throw new Error('ALL_PRODUCTS contiene IDs duplicados; corrígelos antes de sembrar el catálogo.')
  const imageProducts = products.filter((product): product is SeedProduct & { imageUrl: string } => Boolean(product.imageUrl))
  for (const product of imageProducts) {
    if (!product.imageUrl.startsWith('/images/bikes/')) throw new Error(`Ruta de imagen no válida para ${product.name}: ${product.imageUrl}`)
    await readFile(resolve(process.cwd(), '../Frontend/public', product.imageUrl.slice(1)))
  }
  if (process.argv.includes('--dry-run')) {
    console.log(`Catálogo válido: ${products.length} productos, IDs únicos y ${imageProducts.length} imágenes locales. No se modificó MySQL.`)
  } else {
    for (const product of products) {
      await pool.execute(
        `INSERT INTO products (id, name, category, price, stock, description, image_url, gallery, specs, badge, active)
         VALUES (?, ?, ?, ?, ?, ?, ?, JSON_ARRAY(), JSON_ARRAY(), ?, TRUE)
         ON DUPLICATE KEY UPDATE name = VALUES(name), category = VALUES(category), price = VALUES(price),
           description = VALUES(description), image_url = COALESCE(VALUES(image_url), image_url), badge = VALUES(badge), active = TRUE`,
        [product.id, product.name, product.category, product.price, product.stock, product.description, product.imageUrl ?? null, product.badge],
      )
    }
    console.log(`Catálogo sincronizado: ${products.length} productos. El stock ya existente fue conservado.`)
  }
} finally {
  await pool.end()
}