
import { useState } from 'react';

const historicalFigures = [
  {
    name: 'Albert Einstein',
    description: 'Physicist, Theory of Relativity',
    avatar: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Albert_Einstein_Head.jpg',
  },
  {
    name: 'Isaac Newton',
    description: 'Mathematician, Laws of Motion',
    avatar: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Isaac_Newton_1689.jpg',
  },
  {
    name: 'Marie Curie',
    description: 'Chemist, Radioactivity Pioneer',
    avatar: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Marie_Curie_c1920.jpg',
  },
];

export default function Home() {
  const [selected, setSelected] = useState<number | null>(null);
  const [chat, setChat] = useState<string[]>([]);
  const [input, setInput] = useState('');

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Chat with a Historical Figure</h1>
      <div className="flex flex-wrap gap-8 justify-center mb-10">
        {historicalFigures.map((fig, idx) => (
          <div
            key={fig.name}
            className={`cursor-pointer border rounded-lg p-4 w-64 shadow-md bg-white hover:border-blue-500 transition ${selected === idx ? 'border-blue-500' : ''}`}
            onClick={() => { setSelected(idx); setChat([]); }}
          >
            <img src={fig.avatar} alt={fig.name} className="w-24 h-24 object-cover rounded-full mx-auto mb-2" />
            <h2 className="text-xl font-semibold text-center">{fig.name}</h2>
            <p className="text-gray-600 text-center">{fig.description}</p>
          </div>
        ))}
      </div>
      {selected !== null && (
        <section className="max-w-xl mx-auto bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Chat with {historicalFigures[selected].name}</h3>
          <div className="h-48 overflow-y-auto border rounded mb-4 p-2 bg-gray-50">
            {chat.length === 0 ? (
              <p className="text-gray-400">Start the conversation!</p>
            ) : (
              chat.map((msg, i) => (
                <div key={i} className={i % 2 === 0 ? 'text-blue-700' : 'text-gray-800'}>
                  <span className="font-bold">{i % 2 === 0 ? historicalFigures[selected].name : 'You'}:</span> {msg}
                </div>
              ))
            )}
          </div>
          <form
            className="flex gap-2"
            onSubmit={e => {
              e.preventDefault();
              if (!input.trim()) return;
              setChat([...chat, input, `(${historicalFigures[selected].name} responds with a placeholder answer)`]);
              setInput('');
            }}
          >
            <input
              className="flex-1 border rounded px-3 py-2"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={`Ask ${historicalFigures[selected].name} anything...`}
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Send</button>
          </form>
        </section>
      )}
    </main>
  );
}
