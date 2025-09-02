export default function Custom500() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>500 - Server-side error occurred</h1>
      <p>Something went wrong on our servers. Please try again later.</p>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {},
  };
}