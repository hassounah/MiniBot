import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './ChatApp.css';

// Define a simple spinner component using CSS animation
const Spinner = () => (
    <div className="spinner"></div>
);

const ChatApp = () => {
    const [history, setHistory] = useState([]);
    const [input, setInput] = useState('');
    const [warning, setWarning] = useState('');
    const [loading, setLoading] = useState(false);
    const messageContainerRef = useRef(null);

    useEffect(() => {
        fetchHistory(); // Fetch history when component mounts
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await axios.get('/api/history');
            const historyData = response.data.slice(0,10).map(message => ({
                id: message.id,
                prompt: message.request_text,
                response: message.response_text,
            })).reverse();
            setHistory(historyData);
            scrollToBottom();
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const sendMessage = async () => {
        if (!input.trim()) {
            setWarning('Please enter a message.');
            return;
        }
        try {
            setLoading(true);
            const response = await axios.post('/api/messages', { prompt: input });
            setHistory(prevHistory => [...prevHistory, { prompt: input }, { response: response.data.text }]);
            setInput('');
            setWarning('');
            scrollToBottom();
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    const scrollToBottom = () => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    };

    return (
        <div className="chat-container">
            <h1>Chat App</h1>
            <div className="message-container" ref={messageContainerRef}>
                {history.map((message, index) => (
                    <div key={index}>
                        {message.prompt && <div className="right-bubble">{message.prompt}</div>}
                        {message.response && <div className="left-bubble">{message.response}</div>}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
            />
            <button onClick={sendMessage}>Send</button>
            {loading && <Spinner />} {/* Display spinner when loading */}
            {warning && <div>{warning}</div>}
            <div>
                <Link to="/config">Model Configuration</Link>
                &nbsp;
                <Link to="/history">View History</Link>
            </div>
        </div>
    );
};

export default ChatApp;
