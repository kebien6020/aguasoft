import Layout from '../components/Layout'

const Error404 = () => {
  return (
    <Layout title='Error 404'>
      <h1>Error 404</h1>
      <p>Pagina no encontrada: {location.pathname}</p>
      <p>Regresa al <a href='/'>Inicio</a></p>
    </Layout>
  )
}

export default Error404
