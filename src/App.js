import React, { Component } from 'react';
import './App.css';
import EditorComponent from './containers/EditorContainer';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-intro">
          <EditorComponent />
        </div>
      </div>
    );
  }
}

export default App;
