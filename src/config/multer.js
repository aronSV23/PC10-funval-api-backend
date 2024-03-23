import multer from 'multer'

// Configurar el almacenamiento de archivos en el servidor
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

// Configurar la carga de archivos
export const uploadImage = multer({
  storage,
  limits: { fileSize: 100000000 }, // Limitar el tamaño de archivo a 100MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Solo se permiten imágenes'))
    }
  }
})

// Función para manejar el error
export const handleError = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ error: 'El archivo debe pesar menos de 100mbs' })
  } else {
    res.status(400).json({ error: 'Solo se admiten imagenes' })
  }
}
