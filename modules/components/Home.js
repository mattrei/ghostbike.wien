import React from 'react'
import Title from 'react-title-component'


export default class Home extends React.Component {
  componentDidMount() {

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
