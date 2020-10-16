import React, { Component } from "react";
import $ from 'jquery';
import './360Viewer.css'
import { images } from '../assets/images'

// You can play with this to adjust the sensitivity
// higher values make mouse less sensitive
const pixelsPerDegree = 3;
var pos = {x:0,y:0}
var zoom_target = {x:0,y:0}
var zoom_point = {x:0,y:0}
var scale = 1
var target;
var size;
var max_scale = 4;
var factor = 0.5;

class Viewer extends Component {
  state = {
    dragging: false,
    imageIndex: 0,
    dragStartIndex: 0
  };

  componentDidMount = () => {
    document.addEventListener("mousemove", this.handleMouseMove, false);
    document.addEventListener("mouseup", this.handleMouseUp, false);

    const script = document.createElement('script');
    script.src = "https://code.jquery.com/jquery-3.5.1.min.js";
    script.async = true;
    document.body.appendChild(script);

    target = $('#container').children().first();
	size = {w: target.width(), h:target.height()};
    target.css('transform-origin','0 0');
	target.on("mousewheel DOMMouseScroll", this.scrolled);
  };

  componentWillUnmount = () => {
    document.removeEventListener("mousemove", this.handleMouseMove, false);
    document.removeEventListener("mouseup", this.handleMouseUp, false);
  };

  scrolled(e) {
    var container = $('#container');
    var offset = container.offset()
    zoom_point.x = e.pageX - offset.left
    zoom_point.y = e.pageY - offset.top

    e.preventDefault();
    var delta = e.delta || e.originalEvent.wheelDelta;
    if (delta === undefined) {
      //we are on firefox
      delta = e.originalEvent.detail;
    }
    delta = Math.max(-1,Math.min(1,delta)) // cap the delta to [-1,1] for cross browser consistency

    // determine the point on where the slide is zoomed in
    zoom_target.x = (zoom_point.x - pos.x)/scale
    zoom_target.y = (zoom_point.y - pos.y)/scale

    // apply zoom
    scale += delta*factor * scale
    scale = Math.max(1,Math.min(max_scale,scale))

    // calculate x and y based on zoom
    pos.x = -zoom_target.x * scale + zoom_point.x
    pos.y = -zoom_target.y * scale + zoom_point.y

    // Make sure the slide stays in its container area when zooming out
    if(pos.x>0)
        pos.x = 0
    if(pos.x+size.w*scale<size.w)
        pos.x = -size.w*(scale-1)
    if(pos.y>0)
        pos.y = 0
     if(pos.y+size.h*scale<size.h)
        pos.y = -size.h*(scale-1)

        target.css('transform','translate('+(pos.x)+'px,'+(pos.y)+'px) scale('+scale+','+scale+')')

    }

  handleMouseDown = event => {
    event.persist();
    this.setState(state => ({
      dragging: true,
      dragStart: event.screenX,
      dragStartIndex: state.imageIndex
    }));
  };

  handleMouseUp = () => {
    this.setState({ dragging: false });
  };

  updateImageIndex = currentPosition => {
    const numImages = images.length;
    const pixelsPerImage = pixelsPerDegree * (360 / numImages);
    const { dragStart, imageIndex, dragStartIndex } = this.state;
    // pixels moved
    let dx = (currentPosition - dragStart) / pixelsPerImage;
    let index = Math.floor(dx) % numImages;
    if (index < 0) {
      index = numImages + index - 1;
    }
    index = (index + dragStartIndex) % numImages;
    if (index !== imageIndex) {
      this.setState({ imageIndex: index });
    }
  };

  handleMouseMove = event => {
    if (this.state.dragging) {
      this.updateImageIndex(event.screenX);
    }
  };

  renderImage = () => {
    const { imageIndex } = this.state;

    return (
      <img id="image" className='zoom' src={images[imageIndex]} alt=""/>
    );
  };

  render = () => {
    return (
        <div id="container">
            <div id="slide" onMouseDown={this.handleMouseDown} onWheel={this.zoomImage}>
                {this.renderImage()}
            </div>
      </div>
    );
  };
}

export default Viewer;