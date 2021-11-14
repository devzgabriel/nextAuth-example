import { useContext, useEffect } from 'react'
import { Can } from '../components/Can'
import { AuthContext } from '../contexts/AuthContext'
import { setupAPIClient } from '../services/api'
import { api } from '../services/apiClient'

import { witchSSRAuth } from '../utils/withSSRAuth'

export default function Dashboard() {
  const { user, signOut } = useContext(AuthContext)

  useEffect(() => {
    api
      .get('/me')
      .then((response) => console.log(response))
      .catch((err) => console.log(err))
  }, [])

  return (
    <>
      <h1>Dashboard {user?.email}</h1>

      <button onClick={signOut}>Logout</button>

      <Can permissions={['metrics.list']}>
        <h2>Metrics</h2>
      </Can>
    </>
  )
}

export const getServerSideProps = witchSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx)
  const response = await apiClient.get('/me')

  console.log(response.data)

  return {
    props: {},
  }
})
