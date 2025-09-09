"use client"
import { useState } from 'react';

export default function Dashboard() {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfName, setPdfName] = useState<string | null>(null);
    const [characterName, setCharacterName] = useState('');
    const [characterCreated, setCharacterCreated] = useState(false);
    const [customChat, setCustomChat] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPdfFile(e.target.files[0]);
            setPdfName(e.target.files[0].name);
            setCharacterCreated(false);
            setError('');
        }
    };

    const handleCreateCharacter = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pdfFile || !characterName.trim()) {
            setError('Please provide a character name and select a PDF.');
            return;
        }
        setUploading(true);
        setError('');
        setTimeout(() => {
            setUploading(false);
            setCharacterCreated(true);
            setCustomChat([]);
        }, 1200);
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 p-8 flex flex-col items-center justify-center">
            <section className="w-full max-w-lg bg-gradient-to-br from-gray-800 to-purple-900 rounded-xl shadow-xl p-8 border-2 border-purple-400 mb-10">
                <h2 className="text-2xl font-bold mb-6 text-purple-200 text-center">Create a Custom Character</h2>
                <form onSubmit={handleCreateCharacter} className="flex flex-col gap-4">
                    <input
                        type="text"
                        className="border-2 border-purple-400 rounded-lg px-4 py-2 bg-gray-900 text-white placeholder-purple-300 focus:outline-none focus:border-purple-500"
                        placeholder="Character Name"
                        value={characterName}
                        onChange={e => setCharacterName(e.target.value)}
                        disabled={uploading}
                    />
                    <input
                        type="file"
                        accept="application/pdf"
                        className="border-2 border-purple-400 rounded-lg px-4 py-2 bg-gray-900 text-white focus:outline-none focus:border-purple-500"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                    {pdfName && <div className="text-green-400 font-semibold">Uploaded: {pdfName}</div>}
                    <button
                        type="submit"
                        className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-2 rounded-lg font-semibold shadow"
                        disabled={uploading}
                    >
                        {uploading ? 'Creating...' : 'Create Character'}
                    </button>
                    {error && <div className="text-red-400 text-center">{error}</div>}
                    {characterCreated && <div className="text-green-400 text-center">Character created successfully!</div>}
                </form>
                <p className="text-purple-100 text-sm mt-2 text-center">(PDF upload and training integration required)</p>
            </section>
            {characterCreated && (
                <section className="w-full max-w-lg bg-gradient-to-br from-gray-800 to-purple-900 rounded-xl shadow-xl p-8 border-2 border-purple-400">
                    <h3 className="text-xl font-bold mb-4 text-purple-200 text-center">Chat with {characterName}</h3>
                    <div className="h-56 overflow-y-auto border rounded-lg mb-4 p-3 bg-gray-900 border-purple-400">
                        {customChat.length === 0 ? (
                            <p className="text-purple-400 text-center">Start the conversation!</p>
                        ) : (
                            customChat.map((msg, i) => (
                                <div key={i} className={i % 2 === 0 ? 'text-white' : 'text-purple-300'}>
                                    <span className="font-bold">{i % 2 === 0 ? 'You' : characterName}:</span> {msg}
                                </div>
                            ))
                        )}
                    </div>
                    <form
                        className="flex gap-2"
                        onSubmit={e => {
                            e.preventDefault();
                            if (!input.trim()) return;
                            setCustomChat([...customChat, input, `(${characterName} responds with a placeholder answer)`]);
                            setInput('');
                        }}
                    >
                        <input
                            className="flex-1 border-2 border-purple-400 rounded-lg px-4 py-2 bg-gray-900 text-white placeholder-purple-300 focus:outline-none focus:border-purple-500"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder={`Ask ${characterName} anything...`}
                        />
                        <button type="submit" className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-2 rounded-lg font-semibold shadow">Send</button>
                    </form>
                </section>
            )}
        </main>
    );
}
