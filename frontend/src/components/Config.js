import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Config = () => {
    const [models, setModels] = useState([]);
    const [newModelName, setNewModelName] = useState('');
    const [newModelDescription, setNewModelDescription] = useState('');
    const [updatedModelName, setUpdatedModelName] = useState('');
    const [updatedModelDescription, setUpdatedModelDescription] = useState('');
    const [updatingModel, setUpdatingModel] = useState(null);
    const [activeModelId, setActiveModelId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchModels();
        fetchActiveModelId();
    }, []);

    const fetchModels = async () => {
        try {
            const response = await axios.get('/api/models');
            setModels(response.data);
        } catch (error) {
            console.error('Error fetching models:', error);
        }
    };

    const fetchActiveModelId = async () => {
        try {
            const response = await axios.get('/api/models/active');
            setActiveModelId(response.data.id);
        } catch (error) {
            console.error('Error fetching active model:', error);
        }
    };

    const createModel = async () => {
        try {
            await axios.post('/api/models', { name: newModelName, description: newModelDescription });
            await fetchModels();
            // Reset new model fields to empty after creation
            setNewModelName('');
            setNewModelDescription('');
            // Clear error message upon success
            setErrorMessage('');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setErrorMessage('Invalid model name. Please provide a valid model name.');
            } else {
                console.error('Error creating model:', error);
            }
        }
    };

    const updateModel = async (id, updatedName, updatedDescription) => {
        try {
            await axios.put(`/api/models/${id}`, { name: updatedName, description: updatedDescription });
            await fetchModels();
            setUpdatingModel(null);
            // Clear error message upon success
            setErrorMessage('');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setErrorMessage('Invalid model name. Please provide a valid model name.');
            } else {
                console.error('Error updating model:', error);
            }
        }
    };

    const deleteModel = async (id) => {
        try {
            await axios.delete(`/api/models/${id}`);
            await fetchModels();
        } catch (error) {
            console.error('Error deleting model:', error);
        }
    };

    const handleUpdateModel = (id, name, description) => {
        setUpdatingModel(id);
        // Set new model fields to the current values if not already set
        if (!updatedModelName) setUpdatedModelName(name);
        if (!updatedModelDescription) setUpdatedModelDescription(description);
    };

    const cancelUpdateModel = () => {
        setUpdatingModel(null);
        // Reset new model fields to empty after canceling
        setUpdatedModelName('');
        setUpdatedModelDescription('');
    };

    const setActiveModel = async (id) => {
        try {
            await axios.put(`/api/models/${id}/set_active`);
            setActiveModelId(id);
        } catch (error) {
            console.error('Error setting active model:', error);
        }
    };

    return (
        <div>
            <h1>Model Configuration</h1>
            <div>
                <h2>Add New Model</h2>
                <input type="text" placeholder="Name" value={newModelName} onChange={(e) => setNewModelName(e.target.value)} />
                <input type="text" placeholder="Description" value={newModelDescription} onChange={(e) => setNewModelDescription(e.target.value)} />
                <button onClick={createModel}>Add Model</button>
                {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
            </div>
            <div>
                <h2>All Models</h2>
                {models.map((model) => (
                    <div key={model.id} style={{ backgroundColor: activeModelId === model.id ? '#f0f0f0' : 'inherit' }}>
                        <div>ID: {model.id}</div>
                        <input type="text" value={updatingModel === model.id ? updatedModelName : model.name} readOnly={updatingModel !== model.id} onChange={(e) => { if (updatingModel === model.id) setUpdatedModelName(e.target.value) }} />
                        <input type="text" value={updatingModel === model.id ? updatedModelDescription : model.description} readOnly={updatingModel !== model.id} onChange={(e) => { if (updatingModel === model.id) setUpdatedModelDescription(e.target.value) }} />
                        <div>Active: {activeModelId === model.id ? 'Yes' : 'No'}</div>
                        {updatingModel === model.id ?
                            <>
                                <button onClick={() => updateModel(model.id, updatedModelName, updatedModelDescription)}>Update</button>
                                <button onClick={cancelUpdateModel}>Cancel</button>
                                {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
                            </>
                            :
                            <>
                                <button onClick={() => handleUpdateModel(model.id, model.name, model.description)}>Edit</button>
                                {activeModelId !== model.id && <button onClick={() => setActiveModel(model.id)}>Set Active</button>}
                            </>
                        }
                        <button onClick={() => deleteModel(model.id)}>Delete</button>
                    </div>
                ))}
            </div>
            <div>
                <Link to="/">Back to Chat</Link>
                &nbsp;
                <Link to="/history">View History</Link>
            </div>
        </div>
    );
};

export default Config;
