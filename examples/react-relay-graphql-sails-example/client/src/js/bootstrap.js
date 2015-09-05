import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import App from './components/App';
import AppHomeRoute from './routes/AppHomeRoute';


document.addEventListener('DOMContentLoaded', function() {
  React.render(
    <Relay.RootContainer
    Component={App}
    route={new AppHomeRoute()}
    />,
    document.getElementById('root')
  );
});