import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './History.css';

const History = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await axios.get('/api/history');
            setHistory(response.data);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const deleteMessage = async (id) => {
        try {
            await axios.delete(`/api/history/${id}`);
            const updatedHistory = history.filter(message => message.id !== id);
            setHistory(updatedHistory);
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    return (
        <div className="history-container">
            <h1>Chat History</h1>
            <div className="message-container">
                {history.map((message, index) => (
                    <div key={index} className="history-item">
                        <div className="history-prompt">{message.request_text}</div>
                        <div className="history-response">{message.response_text}</div>
                        <button onClick={() => deleteMessage(message.id)}>Delete</button>
                    </div>
                ))}
            </div>
            <div>
                <Link to="/">Back to Chat</Link>
                &nbsp;
                <Link to="/config">Model Configuration</Link>
            </div>
        </div>
    );
};

export default History;
