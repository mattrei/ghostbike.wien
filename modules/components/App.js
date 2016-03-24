import React from 'react'
import { IndexLink, Link } from 'react-router'
import Title from 'react-title-component'

import injectTapEventPlugin from 'react-tap-event-plugin'
//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin()


import AppBar from 'material-ui/lib/app-bar'
import LeftNav from 'material-ui/lib/left-nav'
import Divider from 'material-ui/lib/divider'
import MenuItem from 'material-ui/lib/menus/menu-item'
import spacing from 'material-ui/lib/styles/spacing'
import getMuiTheme from 'material-ui/lib/styles/getMuiTheme'
import {darkWhite, lightWhite, grey900} from 'material-ui/lib/styles/colors'
import Dialog from 'material-ui/lib/dialog'
import FlatButton from 'material-ui/lib/flat-button'
import RaisedButton from 'material-ui/lib/raised-button'
import Checkbox from 'material-ui/lib/checkbox'
import Toggle from 'material-ui/lib/toggle'


export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      leftNavOpen: false,
      aboutOpen: false,
      follow: true,
      muiTheme: getMuiTheme()
    }
  }

  handleToggle = () => this.setState({leftNavOpen: !this.state.leftNavOpen})

  handleClose = () => this.setState({leftNavOpen: false})

  handleAboutOpen = () => this.setState({aboutOpen: true, leftNavOpen: false})

  handleAboutClose = () => this.setState({aboutOpen: false})

  handleToggleFollow = () => this.setState({follow: !this.state.follow})

  getStyles() {
    const styles = {
      appBar: {
        position: 'fixed',
        // Needed to overlap the examples
        zIndex: this.state.muiTheme.zIndex.appBar + 1,
        top: 0,
      },
      root: {
        paddingTop: spacing.desktopKeylineIncrement,
        minHeight: 400,
      },
      content: {
        margin: spacing.desktopGutter,
      },
      contentWhenMedium: {
        margin: `${spacing.desktopGutter * 2}px ${spacing.desktopGutter * 3}px`,
      },
      footer: {
        backgroundColor: grey900,
        textAlign: 'center',
      },
      a: {
        color: darkWhite,
      },
      p: {
        margin: '0 auto',
        padding: 0,
        color: lightWhite,
        maxWidth: 356,
      },
      iconButton: {
        color: darkWhite,
      },
    };

    return styles;
  }

  render() {
    const styles = this.getStyles()

    const actions = [
      <FlatButton
        label="Cancel"
        secondary={true}
        onTouchTap={this.handleAboutClose}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        disabled={true}
        onTouchTap={this.handleAboutClose}
      />,
    ];

    return (
      <div>
        <Title render="Ghostbike.Wien"/>

          <AppBar
            title=""
            onLeftIconButtonTouchTap={this.handleToggle}
            style={styles.appBar}
            zDepth={0}
            showMenuIconButton={true}
            iconElementRight={<Toggle
              label="Follow"
              labelPosition="right"
              onToggle={this.handleToggleFollow}
            />}
          />

          <LeftNav
            docked={false}
            width={200}
            open={this.state.leftNavOpen}
            onRequestChange={leftNavOpen => this.setState({leftNavOpen})}
          >
            <MenuItem onTouchTap={this.handleClose}>Add Point</MenuItem>
            <Divider />
            <MenuItem onTouchTap={this.handleAboutOpen}>About</MenuItem>
          </LeftNav>


            <Dialog
              title="Dialog With Actions"
              actions={actions}
              modal={true}
              open={this.state.aboutOpen}
            >
              Only actions can close this dialog.
            </Dialog>

        <ul>
          <li><IndexLink to="/">Home</IndexLink></li>
          <li><Link to="/dragon">A DRAGON!</Link></li>
          <li><Link to="/not-dragon">An old URL to a DRAGON!</Link></li>
        </ul>
        {this.props.children}
      </div>
    )
  }
}
