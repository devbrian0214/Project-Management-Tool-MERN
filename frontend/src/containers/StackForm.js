/* eslint-disable react/forbid-prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable no-plusplus */
import React from "react";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Container, Form, Alert } from 'react-bootstrap';
import { UpdateCall, CreateCall, DeleteCall } from '../helpers/apiCalls';
import style from '../style/StackForm.module.css';

class StackForm extends React.Component{
  constructor(props) {
    super(props);
    this.state= {
      name: '',
      description: '',
      link: '',
      released_year: 1950,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  componentDidMount() {
    const { location} = this.props;
    const { type } = location.state;
    if (type === 'update') {
      const { stack } = location.state;
      this.setState(stack)
    }
  }

  handleChange = (event) => {
    this.setState({[event.target.name]: event.target.value})
  }

  async handleSubmit (event) {
    event.preventDefault();
    const { location, createStack, updateStack } = this.props;
    const { type } = location.state;
    const token = this.getCookie('csrftoken');
    try {
      if(type === 'create') {
        const data = await createStack('stacks', token, this.state);
        console.log(data)
        this.props.history.push({
          pathname:`/stack/${data.stack.name}`,
          state: {
            id: data.stack._id,
          },
        });
      } else if (type === 'update') {
        const { stack } = location.state;
        const data = await updateStack('stacks', token, this.state, stack._id);
        this.setState({})
        this.props.history.push({
          pathname:`/stack/${data.stack.name}`,
          state: {
            id: data.stack._id,
          },
        });
      }
    } catch (error) {
      console.log(error)
    }
  }  

  async handleDelete (e) {
    const { location, deleteStack } = this.props;
    const { stack } = location.state;
    const token = this.getCookie('csrftoken');
    try {
      await deleteStack('stacks', token, stack._id)
      this.props.history.push('/stacks');
    } catch(error) {
      console.log(error)
    }
  }

  getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (`${name  }=`)) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
  }

  render() {
    const { location} = this.props;
    const { type } = location.state;
    return (
      <Container>
        <h1>
          {type === 'create' ? 'Create' : 'Update'}
          {' '}
          Stack
        </h1>
        <Form onSubmit={this.handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Stack Name</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Enter stack name" 
              value={this.state.name}
              name="name"
              onChange={this.handleChange} 
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label>Stack Description</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={5}
              value={this.state.description}
              name="description"
              onChange={this.handleChange} 
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Stack Released Year (1950-2100)</Form.Label>
            <Form.Control 
              type="number" 
              min="1950" 
              max="2100" 
              value={this.state.released_year}
              name="released_year"
              onChange={this.handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Link to official website</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Enter stack link"
              value={this.state.link}
              name="link"
              onChange={this.handleChange}             
            />
          </Form.Group>
          <Button variant="primary" type="submit" className='mr-3'>
            {type === 'create' ? 'Create' : 'Update'}
          </Button>
          {type === 'update' ? (
            <Button
              variant="primary"
              type="submit"
              className='mr-3'
              onClick={e =>
                window.confirm("Are you sure you want to delete this stack?") &&
                this.handleDelete()
            }
            >
              Delete
            </Button>
            )
            : (<></>)}
        </Form>
      </Container>
    );
  };
};

StackForm.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({ 
      stack: PropTypes.object.isRequired, 
      type: PropTypes.string.isRequired 
    }),
  }).isRequired,  
  createStack: PropTypes.func.isRequired,
  updateStack: PropTypes.func.isRequired,
  deleteStack: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => bindActionCreators({
  createStack: CreateCall,
  updateStack: UpdateCall,
  deleteStack: DeleteCall,
}, dispatch);

export default connect(null, mapDispatchToProps)(StackForm);