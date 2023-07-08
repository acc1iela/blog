import { client } from './lib/sanity';

async function getDate() {
  const query = `*[_type == 'post']`;

  const data = await client.fetch(query);
  return data;
}

export default function IndexPage() {
  return <h1>hello from the index page</h1>;
}
