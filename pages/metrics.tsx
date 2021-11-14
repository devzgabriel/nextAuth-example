import { Can } from '../components/Can'
import { setupAPIClient } from '../services/api'
import { witchSSRAuth } from '../utils/withSSRAuth'

export default function Dashboard() {
  return (
    <>
      <h1>Metrics</h1>

      <Can permissions={['metrics.list']}>
        <h2>Metrics</h2>
      </Can>
    </>
  )
}

export const getServerSideProps = witchSSRAuth(
  async (ctx) => {
    const apiClient = setupAPIClient(ctx)
    const response = await apiClient.get('/me')

    return {
      props: {},
    }
  },
  {
    permissions: ['metrics.list'],
    roles: ['administrator'],
  }
)
