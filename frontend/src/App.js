import React from 'react';
import './App.css';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Slider';
import { IconButton, Input, CircularProgress, LinearProgress } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

const MAX_ELEMENTS = 40;
const MIN_ANIMATION_DELAY = 0.1; // in seconds

class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      state: 'idle', // 'idle' | 'edit' | 'animation'
      // editing
      array: [],
      selectedItem: -1,
      // animation
      lockScreen: false,
      paused: false,
      currentStep: 0,
      steps: null,
      i: -1,
      j: -1,
      a: -1,
      b: -1,
    };
    this.delay = MIN_ANIMATION_DELAY;
    App.app = this;
  }

  static app;

  // from Sequence
  select(index){
    if(this.state.state != 'animation' && index < this.state.array.length && index >= 0){
      this.setState({...this.state, selectedItem: index, state: 'edit'});
    }
  }

  // from Editor
  setValue(value){
    if(this.state.state == 'edit'){
      let arrayCopy = [...this.state.array];
      arrayCopy[this.state.selectedItem] = value;
      this.setState({...this.state, array: arrayCopy});
    }
  }

  moveForward(){
    if(this.state.state == 'edit' && this.state.selectedItem >= 1){
      let arrayCopy = [...this.state.array];
      // swap selectedItem and previous
      let temp = arrayCopy[this.state.selectedItem - 1];
      arrayCopy[this.state.selectedItem - 1] = arrayCopy[this.state.selectedItem];
      arrayCopy[this.state.selectedItem] = temp;
      this.setState({...this.state, array: arrayCopy, selectedItem: this.state.selectedItem - 1})
    }
  }

  moveBack(){
    if(this.state.state == 'edit' && this.state.selectedItem + 1 < this.state.array.length){
      let arrayCopy = [...this.state.array];
      // swap selectedItem and next
      let temp = arrayCopy[this.state.selectedItem + 1];
      arrayCopy[this.state.selectedItem + 1] = arrayCopy[this.state.selectedItem];
      arrayCopy[this.state.selectedItem] = temp;
      this.setState({...this.state, array: arrayCopy, selectedItem: this.state.selectedItem + 1});
    }
  }

  delete(){
    if(this.state.state == 'edit'){
      let arrayCopy = [...this.state.array];
      arrayCopy.splice(this.state.selectedItem, 1);
      this.setState({...this.state, array: arrayCopy, state: 'idle', selectedItem: -1});
    }
  }

  deselect(){
    if(this.state.state == 'edit'){
      this.setState({...this.state, state: 'idle', selectedItem: -1});
    }
  }

  // from settings
  addEmpty(){
    if(this.state.state != 'animation'){
      let arrayCopy = [...this.state.array];
      arrayCopy.push(0);
      this.setState({...this.state, state: 'edit', selectedItem: arrayCopy.length - 1, array: arrayCopy})
    }
  }

  fillRandom(){
    if(this.state.state != 'animation'){
      let newArray = new Array(MAX_ELEMENTS);
      for(let i = 0; i < newArray.length; i++){
        newArray[i] = Math.floor(Math.random() * 100);
      }
      this.setState({...this.state, state: 'idle', array: newArray, selectedItem: -1});
    }
  }

  setSpeed(speed){
    speed = Math.max(speed, MIN_ANIMATION_DELAY);
    this.speed = speed;
  }

  sort(){
    if(this.state.state == 'idle'){
      // lock screen to prevent changing array
      this.setState({...this.state, lockScreen: true});
      fetch('/sort-this', {
        method: 'POST', 
        body: JSON.stringify({data: this.array})
      }).then((response) => response.ok ? response.json() : response.text()).
      then((data) => {
        if(data == 'bad'){
          this.setState({...this.state, lockScreen: false});
        }
        else{
          this.setState({...this.state, lockScreen: false, state: 'animation', steps: data.data});
          this.play();
        }
      });
    }
  }

  quit(){
    if(this.state.state == 'animation'){
      this.setState({
        ...this.state,
        state: 'idle',
        paused: false,
        currentStep: 0,
        steps: null,
        i: -1,
        j: -1,
        a: -1,
        b: -1,
      })
    }
  }

  //for progress bar
  play(){
    if(this.state.state == 'animation'){
      this.setState({...this.state, paused: false});
      this.hop();
    }
  }

  pause(){
    if(this.state.state == 'animation'){
      this.setState({...this.state, paused: true})
    }
  }

  nextStep(delta = 1){
    if(this.state.state == 'animation' && this.state.currentStep + delta < this.state.steps.length && this.state.currentStep + delta >= 0){
      let currentStep = this.state.currentStep + delta;
      let stepData = this.state.steps[currentStep];
      switch(stepData[0]){
        case 'i': // set i
          this.setState({...this.state, i: stepData[1], currentStep: currentStep});
          break;
        case 'j': // set j
          this.setState({...this.state, j: stepData[1], currentStep: currentStep})
          break;
        case 'q': // recursion call
          this.setState({...this.state, a: stepData[1], b: stepData[2], i: -1, j: -1, currentStep: currentStep})
          break;
        case 's': // swap elements
          let arrayCopy = [...this.state.array];
          let i = stepData[1], j = stepData[2];
          let temp = arrayCopy[i];
          arrayCopy[i] = arrayCopy[j];
          arrayCopy[j] = temp;
          this.setState({...this.state, array: arrayCopy, currentStep: currentStep});
          break;
        case 'c': // sort complete
          this.setState({...this.state, a: -1, b: -1, i: -1, j: -1, currentStep: currentStep});
          break;
      }
    }
  }

  prevStep(){
    this.nextStep(-1);
  }

  hop(){
    if(!this.state.paused && this.state.state == 'animation' && this.state.currentStep + 1 < this.state.array.length){
      this.nextStep();
      setTimeout(() => {
        this.hop();
      }, this.delay * 1000);
    }
  }

  render(){
    return (
      <div className="app">
        <Sequence array={this.state.array} i={this.state.i} j={this.state.j} a={this.state.a} b={this.state.b}/>
        <div className="control-panel">
          <Settings/>
          <Editor/>
        </div>
        {this.state.state == 'animation' ? <ProgressBar currentStep={this.state.currentStep}/> : null}

      </div>
    )
  }
}

class Sequence extends React.Component{
  constructor(props){
    super(props);
  }

  render(){
    return(
      <div className='sequence'>
        {App.app.state.array.map((element) => <h6>{element}</h6>)}
      </div>
    )
  }
}

class ProgressBar extends React.Component{
  constructor(props){
    super(props);
  }

  render(){
    return(
      <div className='progress-bar'>
        <div className='progress-bar-container'>
          <LinearProgress variant="determinate" value={App.app.state.currentStep / App.app.state.steps.length * 100}/>
        </div>
        <div className='play-control inline-container'>
          <IconButton 
            disabled={!App.app.state.paused}
            onClick={App.app.prevStep}
          >
            <ChevronLeftRoundedIcon/>
          </IconButton>
          {App.state.paused ?
            <IconButton onClick={App.app.pause}>
              <PauseRoundedIcon/>
            </IconButton> :
            <IconButton onClick={App.app.play}>
              <PlayArrowRoundedIcon/>
            </IconButton>
          }
          <IconButton 
            disabled={!App.app.state.paused}
            onClick={App.app.nextStep}
          >
            <ChevronRightRoundedIcon/>
          </IconButton>
        </div>
      </div>
    )
  }
}

class Settings extends React.Component{
  constructor(props){
    super(props);
  }

  render(){
    return (
      <div className='settings'>
        <h1>Set animation delay</h1>
        <Slider min={MIN_ANIMATION_DELAY} max={15 * MIN_ANIMATION_DELAY} value={MIN_ANIMATION_DELAY}/>
        <Button 
          variant="outlined" 
          disabled={App.app.state.state == 'animation'}
          onClick={App.app.addEmpty}
        >Add element</Button>
        <Button 
          variant="outlined"
          disabled={App.app.state.state == 'animation'}
          onClick={App.app.fillRandom}
        >Fill random</Button>
        <Button 
          variant={App.app.state.state == 'ainmation' ? 'contained' : 'outlined'}
          onClick={App.app.state.state == 'animation' ? App.app.quit : App.app.sort}
          color={App.app.state.state == 'animation' ? 'error' : 'success'}
        >{App.app.state.state == 'animation' ? 'Quit' : 'Sort'}</Button>
      </div>
    )
  }
}

class Editor extends React.Component{
  constructor(props){
    super(props);
  }

  render(){
    return (
      <div className='editor'>
        <h1>Selected item: {App.app.state.selectedItem}</h1>
        <div className='inline-container'>
          <IconButton size='large' disabled={App.app.state.selectedItem == App.app.state.array.length - 1}>
            <ChevronLeftRoundedIcon/>
          </IconButton>
          <IconButton size='large' disabled={App.app.state.selectedItem == 0}>
            <ChevronRightRoundedIcon/>
          </IconButton>
        </div>
        <Input 
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          onChange={(e) => {App.app.setValue(Number.parseInt(e.target.value))}}
        ></Input>
        <Button color='error' variant="outlined" onClick={App.app.delete}>Delete</Button>
      </div>
    )
  }
}

class LockScreen extends React.Component{
  constructor(props){
    super(props);
  }

  render(){
    return (
      <div className='lock-screen'>
        <CircularProgress></CircularProgress>
      </div>
    )
  }
}

export default App;
