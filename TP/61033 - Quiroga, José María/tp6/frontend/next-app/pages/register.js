import { useState } from 'react'
import Navbar from '../components/Navbar'
import { register, login } from '../lib/api'

export default function Register(){
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e){
    e.preventDefault()
    try {
      const res = await register({ nombre, email, password })
      if(res && res.email){
        // intento autologin usando el email como username (backend lo espera así)
        try {
          const lg = await login({ username: email, password })
          if(lg && lg.access_token){
            try { localStorage.setItem('authToken', lg.access_token); localStorage.setItem('token', lg.access_token) } catch(e){}
            window.location.href = '/'
            return
          }
        } catch (e) {
          // si falla el autologin, seguimos y redirigimos a /login
        }
        alert('Registrado correctamente'); window.location.href='/login'
      } else {
        alert('Error al registrar')
      }
    } catch (err) {
      alert('Error al registrar: ' + (err && err.message ? err.message : String(err)))
    }
  }

  return (
    <div>
      <Navbar />
      <main className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Registrarse</h1>
        <form onSubmit={handleSubmit} className="max-w-md">
          <label className="block">Nombre</label>
          <input className="w-full border p-2 rounded mb-2" value={nombre} onChange={e=>setNombre(e.target.value)} />
          <label className="block">Email</label>
          <input className="w-full border p-2 rounded mb-2" value={email} onChange={e=>setEmail(e.target.value)} />
          <label className="block">Contraseña</label>
          <input type="password" className="w-full border p-2 rounded mb-4" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="px-4 py-2 bg-green-600 text-white rounded">Crear cuenta</button>
        </form>
      </main>
    </div>
  )
}
