import { useState } from 'react'
import Navbar from '../components/Navbar'
import { login } from '../lib/api'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e){
    e.preventDefault()
    const res = await login({ username: email, password })
    if(res.access_token){
      // Store token under both keys for compatibility with different components
      localStorage.setItem('authToken', res.access_token)
      try { localStorage.setItem('token', res.access_token) } catch (e) {}
      window.location.href = '/'
    } else {
      alert('Credenciales inválidas')
    }
  }

  return (
    <div>
      <Navbar />
      <main className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Ingresar</h1>
        <form onSubmit={handleSubmit} className="max-w-md">
          <label className="block">Email</label>
          <input className="w-full border p-2 rounded mb-2" value={email} onChange={e=>setEmail(e.target.value)} />
          <label className="block">Contraseña</label>
          <input type="password" className="w-full border p-2 rounded mb-4" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Ingresar</button>
        </form>
      </main>
    </div>
  )
}
