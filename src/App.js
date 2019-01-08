import React, { Component } from 'react';

import Mobius from './modules/Mobius/Mobius';
import MobiusInteractive from './modules/MobiusInteractive/MobiusInteractive';

class App extends Component {
  
  render() {
    return (
      <div className="App">
        <MobiusInteractive/>
      </div>
    );
  }
}

export default App;
