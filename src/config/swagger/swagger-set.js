import fs from 'fs'
import path from 'node:path'
import swaggerUi from 'swagger-ui-express'

// Función para mostrar la documentación
export const setSwaggerDocs = (app) => {
  const pathToFile = path.resolve('./src/config/swagger/swagger-output.json')

  // Lee el archivo JSON de manera asíncrona
  fs.readFile(pathToFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading swagger file:', err)
      return
    }
    const swaggerFile = JSON.parse(data)

    // Definir la ruta para mostrar la documentación en Swagger UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile), () => console.log('jola'))
    console.log('Docs running on http://localhost:3000/api-docs')
  })
}
