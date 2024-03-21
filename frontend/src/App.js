import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ChatApp from './components/ChatApp';
import History from './components/History';
import Config from './components/Config';

const App = () => {
    return (
        <Router>
            <div>
                <Switch>
                    <Route path="/" exact component={ChatApp} />
                    <Route path="/history" component={History} />
                    <Route path="/config" component={Config} />
                </Switch>
            </div>
        </Router>
    );
};

export default App;
