import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { register, login, fetchProductos, addToCart, fetchCarrito } from '../lib/api'

export default function TestE2E(){
  const [logs, setLogs] = useState([])
  const push = (msg) => setLogs(s => [...s, `${new Date().toLocaleTimeString()} - ${msg}`])

  useEffect(()=>{
    let mounted = true
    const run = async () => {
      try{
        const suffix = Date.now()
        const user = {
          nombre: `Test User ${suffix}`,
          email: `testuser${suffix}@example.com`,
          username: `testuser${suffix}`,
          password: 'TestPass123!'
        }

        push(`Registering user ${user.email}`)
        const reg = await register(user)
        push(`Register response: ${JSON.stringify(reg)}`)

        push('Logging in (using email as username)')
        const lg = await login({ username: user.email, password: user.password })
        push(`Login response: ${JSON.stringify(lg)}`)

        if(lg && lg.access_token){
          try{ localStorage.setItem('authToken', lg.access_token); localStorage.setItem('token', lg.access_token) }catch(e){}
          push('Token stored in localStorage')
        } else {
          push('No token received after login, aborting')
          return
        }

        push('Fetching productos')
        const productos = await fetchProductos()
        push(`Productos count: ${Array.isArray(productos) ? productos.length : JSON.stringify(productos)}`)
        if(!Array.isArray(productos) || productos.length === 0){ push('No productos, aborting'); return }
        const pid = productos[0].id

        push(`Adding product id ${pid} to cart`)
        const added = await addToCart(pid, 1)
        push(`Add to cart response: ${JSON.stringify(added)}`)

        push('Fetching carrito')
        const cart = await fetchCarrito()
        push(`Carrito: ${JSON.stringify(cart)}`)

        push('E2E test finished')
      } catch (err){
        push('Error: ' + (err && err.message ? err.message : String(err)))
      }
    }

    run()
    return ()=>{ mounted = false }
  }, [])

  return (
    <div>
      <Navbar />
      <main className="container py-8">
        <h1 className="text-2xl font-bold mb-4">E2E test desde Frontend</h1>
        <p className="mb-4">Esta página intentará registrar un usuario único, iniciar sesión, añadir el primer producto al carrito y leer el carrito. Revisa los logs abajo.</p>
        <div className="bg-black text-white p-4 rounded max-w-3xl">
          {logs.length === 0 && <div>Corriendo prueba...</div>}
          <ul>
            {logs.map((l,i)=> <li key={i} className="text-sm font-mono">{l}</li>)}
          </ul>
        </div>
      </main>
    </div>
  )
}
