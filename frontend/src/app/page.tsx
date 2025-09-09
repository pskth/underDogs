"use client"
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
    avatar: '/netwon.jpg',
  },
  {
    name: 'Marie Curie',
    description: 'Chemist, Radioactivity Pioneer',
    avatar: '/marie.jpg',
  },
];

export default function Home() {
  const [selected, setSelected] = useState<number | null>(null);
  const [chat, setChat] = useState<string[]>([]);
  const [input, setInput] = useState('');

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 p-8">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-white drop-shadow-lg">Chat with a Historical Figure</h1>
      <div className="flex flex-wrap gap-8 justify-center mb-12">
        {historicalFigures.map((fig, idx) => (
          <div
            key={fig.name}
            className={`cursor-pointer border-2 rounded-xl p-5 w-72 shadow-lg bg-gradient-to-br from-gray-800 to-blue-900 hover:from-blue-900 hover:to-gray-800 transition-colors duration-200 ${selected === idx ? 'border-blue-400' : 'border-gray-700'}`}
            onClick={() => { setSelected(idx); setChat([]); }}
          >
            <img src={fig.avatar} alt={fig.name} className="w-24 h-24 object-cover rounded-full mx-auto mb-3 border-4 border-blue-400 shadow" />
            <h2 className="text-2xl font-bold text-center text-blue-200 mb-1">{fig.name}</h2>
            <p className="text-blue-100 text-center text-base">{fig.description}</p>
          </div>
        ))}
      </div>
      {selected !== null && (
        <section className="max-w-xl mx-auto bg-gradient-to-br from-gray-800 to-blue-900 rounded-xl shadow-xl p-8 border-2 border-blue-400">
          <h3 className="text-xl font-bold mb-4 text-blue-200">Chat with {historicalFigures[selected].name}</h3>
          <div className="h-56 overflow-y-auto border rounded-lg mb-4 p-3 bg-gray-900 border-blue-400">
            {chat.length === 0 ? (
              <p className="text-blue-400 text-center">Start the conversation!</p>
            ) : (
              chat.map((msg, i) => (
                <div key={i} className={i % 2 === 0 ? 'text-white' : 'text-blue-300'}>
                  <span className="font-bold">{i % 2 === 0 ? 'You' : historicalFigures[selected].name}:</span> {msg}
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
              className="flex-1 border-2 border-blue-400 rounded-lg px-4 py-2 bg-gray-900 text-white placeholder-blue-300 focus:outline-none focus:border-blue-500"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={`Ask ${historicalFigures[selected].name} anything...`}
            />
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow">Send</button>
          </form>
        </section>
      )}
    </main>
  );
}
