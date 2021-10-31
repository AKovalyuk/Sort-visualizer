import React from 'react';
import './App.css';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import { IconButton, Input, CircularProgress, LinearProgress, TextField } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

const MAX_ELEMENTS = 40;
const MIN_ANIMATION_DELAY = 0.01; // in seconds

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
    this.select = this.select.bind(this);
    this.setValue = this.setValue.bind(this);
    this.moveForward = this.moveForward.bind(this);
    this.moveBack = this.moveBack.bind(this);
    this.delete = this.delete.bind(this);
    this.deselect = this.deselect.bind(this);
    this.addEmpty = this.addEmpty.bind(this);
    this.fillRandom = this.fillRandom.bind(this);
    this.setSpeed = this.setSpeed.bind(this);
    this.sort = this.sort.bind(this);
    this.quit = this.quit.bind(this);
    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.nextStep = this.nextStep.bind(this);
    this.prevStep = this.prevStep.bind(this);
    this.hop = this.hop.bind(this);
    this.nextStep1 = this.nextStep1.bind(this);
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
    if(this.state.state == 'edit' && typeof(value) == 'number' && value >= 0){
      let arrayCopy = [...this.state.array];
      arrayCopy[this.state.selectedItem] = value;
      this.setState({...this.state, array: arrayCopy});
    }
  }

  moveForward(){
    console.log(this.state);
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
    console.log(this.state);
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

  setSpeed(delay){
    delay = Math.max(delay, MIN_ANIMATION_DELAY);
    this.delay = delay;
  }

  sort(){
    if(this.state.state == 'idle'){
      // lock screen to prevent changing array
      this.setState({...this.state, lockScreen: true});
      fetch('/sort-this', {
        method: 'POST', 
        body: JSON.stringify({data: this.state.array})
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
      this.setState({...this.state, paused: false}, () => {this.hop();});
    }
  }

  pause(){
    if(this.state.state == 'animation'){
      this.setState({...this.state, paused: true})
    }
  }

  nextStep(delta = 1){
    console.log(delta);
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

  nextStep1(){
    this.nextStep();
  }

  hop(){
    if(!this.state.paused && this.state.state == 'animation' && this.state.currentStep + 1 < this.state.steps.length){
      this.nextStep1();
      setTimeout(() => {
        this.hop();
      }, this.delay * 1000);
    }
    else{
      this.setState({...this.state, paused: true})
    }
  }

  render(){
    return (
      <div className="app">
        <Sequence array={this.state.array} i={this.state.i} j={this.state.j} a={this.state.a} b={this.state.b}/>
        <div className="control-panel">
          <Settings/>
          {this.state.state == 'edit' ? <Editor/> : null}
        </div>
        {this.state.state == 'animation' ? <ProgressBar currentStep={this.state.currentStep}/> : null}
        {this.state.lockScreen ? <LockScreen/> : null}
      </div>
    )
  }
}

class Sequence extends React.Component{
  constructor(props){
    super(props);
  }

  render(){
    let maxElement = Math.max.apply(null, App.app.state.array);
    return(
      <div className='sequence'>
        {App.app.state.array.map((element, index) => {
          return (
            <div
              className='array-element' 
              style={{
                width: `${100 / App.app.state.array.length}%`,
                height: `${100* (0.95 * element / maxElement + 0.05)}%`,
                backgroundColor: App.app.state.selectedItem == index ? 'pink' : (App.app.state.a <= index && App.app.state.b >= index ? 'lightskyblue' : 'coral')
              }}
              onClick={() => {App.app.select(index)}}
              >{App.app.state.i == index ? 'i' : (App.app.state.j == index ? 'j' : '')}</div>
          );
        })}
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
          <div>
            <u>{App.app.state.currentStep + 1}</u>
            <br></br>
            {App.app.state.steps.length}
          </div>
          <LinearProgress 
            variant="determinate" 
            value={(App.app.state.currentStep + 1)/ App.app.state.steps.length * 100}
            sx={{width: '70%'}}
          />
        </div>
        <div className='play-control inline-container'>
          <IconButton 
            disabled={!App.app.state.paused}
            onClick={App.app.prevStep}
          >
            <ChevronLeftRoundedIcon/>
          </IconButton>
          {!App.app.state.paused ?
            <IconButton onClick={App.app.pause}>
              <PauseRoundedIcon/>
            </IconButton> :
            <IconButton onClick={App.app.play}>
              <PlayArrowRoundedIcon/>
            </IconButton>
          }
          <IconButton 
            disabled={!App.app.state.paused}
            onClick={App.app.nextStep1}
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
        <h3>Set animation delay</h3>
        <Slider 
          min={MIN_ANIMATION_DELAY} 
          max={15 * MIN_ANIMATION_DELAY} 
          defaultValue={MIN_ANIMATION_DELAY} 
          step={0.005}
          sx={{width: '8.5rem'}}
          onChange={(e) => {App.app.setSpeed(e.target.value); console.log(e.target.value)}}/>
        <Button 
          sx={{width: '8.5rem'}}
          variant="outlined" 
          disabled={App.app.state.state == 'animation'}
          onClick={App.app.addEmpty}
        >Add element</Button>
        <Button 
          sx={{width: '8.5rem'}}
          variant="outlined"
          disabled={App.app.state.state == 'animation'}
          onClick={App.app.fillRandom}
        >Fill random</Button>
        <Button 
          sx={{width: '8.5rem'}}
          variant={App.app.state.state == 'ainmation' ? 'contained' : 'outlined'}
          onClick={App.app.state.state == 'animation' ? App.app.quit : App.app.sort}
          color={App.app.state.state == 'animation' ? 'error' : 'success'}
          disabled={App.app.state.state == 'edit'}
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
        <h3>Selected item: {App.app.state.selectedItem}</h3>
        <div className='inline-container'>
          <IconButton size='large' disabled={App.app.state.selectedItem == 0} onClick={App.app.moveForward}>
            <ChevronLeftRoundedIcon/>
          </IconButton>
          <IconButton size='large' disabled={App.app.state.selectedItem == App.app.state.array.length - 1} onClick={App.app.moveBack}>
            <ChevronRightRoundedIcon/>
          </IconButton>
        </div>
        <TextField 
          sx={{width: '9rem'}}
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          onChange={(e) => {App.app.setValue(Number.parseInt(e.target.value))}}
          defaultValue={'' + App.app.state.array[App.app.state.selectedItem]}
          id="standard-basic"
          variant="standard"
        ></TextField>
        <Button color='success' onClick={App.app.deselect} sx={{width: '8.5rem'}}>Ok</Button>
        <Button color='error' variant="outlined" onClick={App.app.delete} sx={{width: '8.5rem'}}>Delete</Button>
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
