import React from 'react';
import ReactDOM from 'react-dom';
import reactCSS from 'reactcss';
import dateformat from 'dateformat'; // https://www.npmjs.com/package/dateformat
import NotesMainView from './view/notes/NotesMainView';
import BrowserMainView from './view/browser/BrowserMainView';
import SettingsMainView from './view/settings/SettingsMainView';

const styles = reactCSS({
  default: {
    containerStyle: {
      display: 'flex',
    },
    sidebarStyle: {
      width: '150px',
      minWidth: '150px',
      backgroundColor: 'red',
    },
    sidebarMenuStyle: {
      display: 'flex',
      flexDirection: 'column',
    },
    contentStyle: {
      flex: '1 0 auto',
    },
  },
});

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      state: 'notes',
    };
  }

  render() {
    const title = dateformat(Date.now(), 'dd mmmm yyyy'); //  hh:MM:ss Z
    const { state } = this.state;
    let component = null;
    switch (state) {
      case 'notes':
        component = <NotesMainView />;
        break;
      case 'browser':
        component = <BrowserMainView />;
        break;
      case 'settings':
        component = <SettingsMainView />;
        break;
      default:
        break;
    }
    return (
      <div style={styles.containerStyle}>
        <div style={styles.sidebarStyle}>
          <h3>{title}</h3>
          <div style={styles.sidebarMenuStyle}>
            <button type="button" onClick={() => this.setState({ state: 'notes' })}>Notes</button>
            <button type="button" onClick={() => this.setState({ state: 'browser' })}>Browser</button>
            <hr style={{ width: '100%' }} />
            <button type="button" onClick={() => this.setState({ state: 'settings' })}>Settings</button>
          </div>
        </div>
        <div style={styles.contentStyle}>
          {component}
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Main />, document.getElementById('main'));
