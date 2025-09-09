import { useState } from 'react';

export default function Dashboard() {
    const [pdfName, setPdfName] = useState<string | null>(null);
    const [customChat, setCustomChat] = useState<string[]>([]);
    const [input, setInput] = useState('');

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 p-8">
            <h1 className="text-4xl font-extrabold mb-8 text-center text-white drop-shadow-lg">Custom Character Training</h1>
            <section className="max-w-xl mx-auto bg-gradient-to-br from-gray-800 to-purple-900 rounded-xl shadow-xl p-8 mb-10 border-2 border-purple-400">
                <h2 className="text-xl font-bold mb-4 text-purple-200">Upload PDF to Train Your Character</h2>
                <input
                    type="file"
                    accept="application/pdf"
                    className="mb-4 block w-full text-white bg-gray-900 border-2 border-purple-400 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                    onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) setPdfName(file.name);
                    }}
                />
                {pdfName && <p className="text-green-400 font-semibold">Uploaded: {pdfName}</p>}
                <p className="text-purple-100 text-sm mt-2">(PDF upload and training integration required)</p>
            </section>
            {pdfName && (
                <section className="max-w-xl mx-auto bg-gradient-to-br from-gray-800 to-purple-900 rounded-xl shadow-xl p-8 border-2 border-purple-400">
                    <h3 className="text-xl font-bold mb-4 text-purple-200">Chat with Your Custom Character</h3>
                    <div className="h-56 overflow-y-auto border rounded-lg mb-4 p-3 bg-gray-900 border-purple-400">
                        {customChat.length === 0 ? (
                            <p className="text-purple-400 text-center">Start the conversation!</p>
                        ) : (
                            customChat.map((msg, i) => (
                                <div key={i} className={i % 2 === 0 ? 'text-purple-300' : 'text-white'}>
                                    <span className="font-bold">{i % 2 === 0 ? 'Custom Character' : 'You'}:</span> {msg}
                                </div>
                            ))
                        )}
                    </div>
                    <form
                        className="flex gap-2"
                        onSubmit={e => {
                            e.preventDefault();
                            if (!input.trim()) return;
                            setCustomChat([...customChat, input, '(Custom Character responds with a placeholder answer)']);
                            setInput('');
                        }}
                    >
                        <input
                            className="flex-1 border-2 border-purple-400 rounded-lg px-4 py-2 bg-gray-900 text-white placeholder-purple-300 focus:outline-none focus:border-purple-500"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Ask your custom character anything..."
                        />
                        <button type="submit" className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-2 rounded-lg font-semibold shadow">Send</button>
                    </form>
                </section>
            )}
        </main>
    );
}
