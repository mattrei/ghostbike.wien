import React from 'react'
import Title from 'react-title-component'
import io from 'socket.io-client'

export default class Home extends React.Component {
  componentDidMount() {
    const socket = io('//localhost:8080')
  }

  render() {
    return (
      <div>
        <Title render={prev => `${prev} | Home`}/>
        <p>Home!</p>
      </div>
    )
  }
}
