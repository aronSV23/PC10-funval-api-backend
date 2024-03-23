import fs from 'node:fs/promises'
import path from 'node:path'
import { pool } from '../config/db.js'

export const getUsers = async (req, res) => {
  try {
    // Obtenemos los datos de los usuarios de la base de datos
    const [rows] = await pool.query('SELECT id, name, email, role, profile_picture FROM users')
    res.json(rows)
  } catch (error) {
    return res.status(500).json({ message: 'Someting goes wrong' })
  }
}

export const getUser = async (req, res) => {
  try {
    const { id } = req.params

    // Validamos el id
    if (isNaN(parseInt(id))) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Obtenemos los datos de usuario de la base de datos
    const [rows] = await pool.execute('SELECT id, name, email, role, profile_picture FROM users WHERE id = ?', [id])
    if (rows.length <= 0) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json(rows[0])
  } catch (error) {
    return res.status(500).json({ message: 'Someting goes wrong' })
  }
}

export const getUserImageProfile = async (req, res) => {
  try {
    const { filename } = req.params
    const absolutePath = path.resolve(path.normalize(`./uploads/${filename}`))

    await fs.access(absolutePath, fs.constants.F_OK)

    // Si no hay error al acceder al archivo, significa que existe
    return res.sendFile(absolutePath)
  } catch (error) {
    // Si hay error, significa que no existe
    return res.status(404).json({ message: 'Imagen no encontrada' })
  }
}

export const createUser = async (req, res) => {
  try {
    // Extraer los datos enviados desde POST
    const { name, email, password, role } = req.body
    const { filename } = req.file

    // Validación de los datos
    if (!name || !email?.includes('@') || !password || !role || !filename) {
      await fs.unlink(path.normalize(`uploads/${filename}`))
      return res.status(400).json({ message: 'Faltan datos.' })
    }

    // Ingresar los datos a la db
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role, profile_picture) VALUES (?, ?, ?, ?, ?)', [name, email, password, role, filename])

    // Validar el id del registro insertado
    if (!result.insertId) {
      await fs.unlink(path.normalize(`uploads/${filename}`))
      return res.status(500).json({ message: 'Error al crear el usuario.' })
    }

    // Traer el usuario insertado
    const [user] = await pool.execute(
      'SELECT name, email, role, profile_picture FROM users WHERE id = ?',
      [result.insertId]
    )

    // Mensaje al cliente
    res.status(201).json({ message: 'Usuario creado.', user })
  } catch (error) {
    console.log(error)
    let message = 'Error interno'
    let statusCode = 500

    // Validar si el error es por un email duplicado. Si es así, borrar la imagen y cambiar el mensaje y código de error.
    if (error?.errno === 1062) {
      message = 'El email ya existe'
      statusCode = 400
      await fs.unlink(path.normalize(`uploads/${req.file.filename}`))
    }

    res.status(statusCode).json({ message })
  }
}

export const updateUser = async (req, res) => {
  try {
    // Extraer los datos enviados
    const { id } = req.params
    const { name, email, password, role } = req.body
    let filename = null
    if (!(req.file === undefined)) {
      filename = req.file.filename
    }

    // Validamos el id
    if (isNaN(parseInt(id))) {
      await fs.unlink(path.normalize(`uploads/${filename}`))
      return res.status(404).json({ message: 'User not found' })
    }

    // Validación de los datos
    if (!email?.includes('@')) {
      await fs.unlink(path.normalize(`uploads/${filename}`))
      return res.status(400).json({ message: 'Email no valido.' })
    }

    // Actualizamos los datos a la db
    const [result] = await pool.execute('UPDATE users SET name = IFNULL(?, name), email = IFNULL(?, email), password = IFNULL(?, password), role = IFNULL(?, role), profile_picture = IFNULL(?, profile_picture) WHERE id = ?', [name, email, password, role, filename, id])

    if (result.affectedRows <= 0) {
      await fs.unlink(path.normalize(`uploads/${filename}`))
      return res.status(500).json({ message: 'Error al actualizar los datos del usuario.' })
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id])
    res.send(rows[0])
  } catch (error) {
    console.log(error)
    let message = 'Error interno'
    let statusCode = 500

    // Validar si el error es por un email duplicado. Si es así, borrar la imagen y cambiar el mensaje y código de error.
    if (error?.errno === 1062) {
      message = 'El email ya existe'
      statusCode = 400
      await fs.unlink(path.normalize(`uploads/${req.file.filename}`))
    }

    res.status(statusCode).json({ message })
  }
}

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    // Obtenemos el filename de usuario de la base de datos
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id])
    const fileName = rows[0].profile_picture

    // Validamos el id
    if (isNaN(parseInt(id))) {
      return res.status(404).json({ message: 'User not found' })
    }

    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id])
    if (result.affectedRows <= 0) {
      return res.status(500).json({ message: 'Error al eliminar al usuario de la db.' })
    }

    await fs.unlink(path.normalize(`uploads/${fileName}`))

    res.sendStatus(204)
  } catch (error) {
    return res.status(500).json({ message: 'Someting goes wrong' })
  }
}
