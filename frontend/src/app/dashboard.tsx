import { useState } from 'react';

export default function Dashboard() {
    const [pdfName, setPdfName] = useState<string | null>(null);
    const [customChat, setCustomChat] = useState<string[]>([]);
    const [input, setInput] = useState('');

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Custom Character Training</h1>
            <section className="max-w-xl mx-auto bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4">Upload PDF to Train Your Character</h2>
                <input
                    type="file"
                    accept="application/pdf"
                    className="mb-4"
                    onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) setPdfName(file.name);
                    }}
                />
                {pdfName && <p className="text-green-600">Uploaded: {pdfName}</p>}
                <p className="text-gray-500 text-sm mt-2">(PDF upload and training integration required)</p>
            </section>
            {pdfName && (
                <section className="max-w-xl mx-auto bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold mb-4">Chat with Your Custom Character</h3>
                    <div className="h-48 overflow-y-auto border rounded mb-4 p-2 bg-gray-50">
                        {customChat.length === 0 ? (
                            <p className="text-gray-400">Start the conversation!</p>
                        ) : (
                            customChat.map((msg, i) => (
                                <div key={i} className={i % 2 === 0 ? 'text-purple-700' : 'text-gray-800'}>
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
                            className="flex-1 border rounded px-3 py-2"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Ask your custom character anything..."
                        />
                        <button type="submit" className="bg-purple-500 text-white px-4 py-2 rounded">Send</button>
                    </form>
                </section>
            )}
        </main>
    );
}
