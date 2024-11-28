'use client'

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { 
    Trash2, 
    Edit2, 
    Save, 
    PlusCircle, 
    Copy, 
    CheckCircle2 
} from "lucide-react";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const contractABI =process.env.NEXT_PUBLIC_CONTRACT_ABI;


export default function Home() {
    const [currentAccount, setCurrentAccount] = useState(null);
    const [note, setNote] = useState("");
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingIndex, setEditingIndex] = useState(null);
    const [copiedNoteIndex, setCopiedNoteIndex] = useState(null);

    const connectWallet = async () => {
        if (!window.ethereum) {
            setError("MetaMask is required! Please install MetaMask.");
            return;
        }
        
        try {
            const accounts = await window.ethereum.request({ 
                method: "eth_requestAccounts" 
            });
            setCurrentAccount(accounts[0]);
            setError(null);
        } catch (error) {
            console.error("Wallet connection error:", error);
            setError("Failed to connect wallet. Please try again.");
        }
    };

    const fetchNotes = async () => {
        if (!currentAccount) return;

        try {
            if (!window.ethereum) {
                setError("MetaMask not detected");
                return;
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(contractAddress, contractABI, provider);

            const notesList = await contract.getNotes();
            setNotes(notesList);
            setError(null);
        } catch (error) {
            console.error("Detailed fetch error:", error);
            setError(`Fetch error: ${error.message}`);
        }
    };

    const addNote = async () => {
        if (!note.trim()) {
            setError("Note cannot be empty!");
            return;
        }
        if (!currentAccount) {
            setError("Connect wallet first!");
            return;
        }

        try {
            setLoading(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractABI, signer);

            const tx = await contract.addNote(note);
            await tx.wait();
            
            setNote("");
            await fetchNotes();
            setError(null);
        } catch (error) {
            console.error("Note addition error:", error);
            setError("Failed to add note. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    const copyNote = (noteText, index) => {
        navigator.clipboard.writeText(noteText);
        setCopiedNoteIndex(index);
        setTimeout(() => setCopiedNoteIndex(null), 2000);
    };

    // Network and account change listeners
    useEffect(() => {
        const handleAccountsChanged = (accounts) => {
            setCurrentAccount(accounts[0] || null);
        };

        const handleChainChanged = () => {
            window.location.reload();
        };

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            }
        };
    }, []);

    // Fetch notes when account changes
    useEffect(() => {
        if (currentAccount) {
            fetchNotes();
        }
    }, [currentAccount]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-white">Dapp Notes</h1>
                        {currentAccount && (
                            <div className="text-sm bg-white/20 text-white px-3 py-1 rounded-full">
                                {`${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6">
                    {!currentAccount ? (
                        <button 
                            onClick={connectWallet} 
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:opacity-90 transition-all flex items-center justify-center space-x-2"
                        >
                            <PlusCircle className="mr-2" /> Connect Wallet
                        </button>
                    ) : (
                        <>
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                                    {error}
                                </div>
                            )}

                            <div className="flex mb-4">
                                <input
                                    type="text"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Write your note here..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={addNote}
                                    disabled={loading}
                                    className={`px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-r-lg hover:opacity-90 transition-all ${
                                        loading ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                >
                                    {loading ? "Saving..." : <Save />}
                                </button>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                                <h2 className="text-xl font-semibold mb-2 text-gray-700">Saved Notes</h2>
                                {notes.length > 0 ? (
                                    notes.map((noteText, index) => (
                                        <div 
                                            key={index} 
                                            className="bg-white shadow-sm rounded-lg p-3 mb-2 flex items-center justify-between hover:bg-gray-100 transition-colors"
                                        >
                                            <span className="flex-1 mr-2">{noteText}</span>
                                            <div className="flex space-x-2">
                                                <button 
                                                    onClick={() => copyNote(noteText, index)}
                                                    className="text-gray-500 hover:text-blue-500 transition-colors"
                                                >
                                                    {copiedNoteIndex === index ? (
                                                        <CheckCircle2 className="text-green-500" />
                                                    ) : (
                                                        <Copy size={18} />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center">No notes yet.</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="mt-4 text-center text-gray-500 text-sm">
                Powered by Ethereum | Connected to {currentAccount ? 'Wallet' : 'No Wallet'}
            </div>
        </div>
    );
}