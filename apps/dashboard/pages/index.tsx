import { NextPage } from 'next';
import Head from 'next/head';

const HomePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>EchoForge Dashboard</title>
        <meta name="description" content="EchoForge monitoring and management dashboard" />
      </Head>
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center mb-8">
            🧠 EchoForge Dashboard
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">System Health</h2>
              <p className="text-green-400">✓ All systems operational</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Metrics</h2>
              <p className="text-blue-400">📊 Monitoring active</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Status</h2>
              <p className="text-yellow-400">⚡ Ready for operations</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;