import { getApiDocs } from '../lib/swagger';
import ReactSwagger from './react-swagger'; 

export default async function IndexPage() {
  const spec = await getApiDocs();
  return (
    <section className="container" style={{ backgroundColor: '#fff', color: '#000', minHeight: '100vh' }}>
      <ReactSwagger spec={spec} />
    </section>
  );
}