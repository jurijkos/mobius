import React, { Component } from 'react';

import math from 'mathjs';
import {
  OuterContainer,
  FlexContainer,
  StyledInput,
  StyledSpan,
  Button,
  Canvas,
} from './MobiusStyles';

class Mobius extends Component {
  state = {
    minX: -5,
    maxX: 5,
    minY: -5,
    maxY: 5,
    screenWidth: 500,
    screenHeight: 500,
    a: math.complex(1, 5),
    b: math.complex(2, 5),
    c: math.complex(2, 5),
    d: math.complex(1, 5),
    p1: math.complex(0, 0),
    p2: math.complex(-2, 0),
    p3: math.complex(-2, 2),
    p4: math.complex(0, 2) 
  };

  calculatePoint(z) {
    const { a, b, c, d } = this.state;
    const res = math.divide(
      math.sum(math.multiply(a, z), b),
      math.sum(math.multiply(c, z), d)
    );
    return res;
  }

  
  calculateRasterPosition2(x, y, borderCordinates) {
    const { screenWidth, screenHeight } = this.state;
    const { minX, maxX, minY, maxY } = borderCordinates; 
    const distX = maxX - minX;
    const distY = maxY - minY;
    const rx = ((x - minX) / distX) * screenWidth;
    const ry = screenHeight - ((y - minY) / distY) * screenHeight;
    return { x: rx, y: ry };
  }

  drawCordinateAxis(ctx) {
    const { minX, maxX, minY, maxY } = this.state;
    const borderCordinates = { minX, maxX, minY, maxY };
    this.drawLine2(ctx, 0, minY, 0, maxY, borderCordinates);
    this.drawLine2(ctx, minX, 0, maxX, 0, borderCordinates);
    ctx.font = '10px Arial';
    for (let i = minX + 1; i < maxX; i++) {
      const point = this.calculateRasterPosition2(i, 0, borderCordinates);
      const { x, y } = point;
      ctx.fillText(i, x, y - 10);
    }
    for (let i = minY + 1; i < maxY; i++) {
      const point = this.calculateRasterPosition2(0, i, borderCordinates);
      const { x, y } = point;
      ctx.fillText(i, x + 10, y);
    }
  }

  drawCordinateAxis2(ctx, borderCordinates) {
    const { minX, maxX, minY, maxY } = borderCordinates;
    const centerX = (maxX + minX) / 2;
    const centerY = (maxY + minY) / 2;
    this.drawLine2(ctx, centerX, minY, centerX, maxY, borderCordinates);
    this.drawLine2(ctx, minX, centerY, maxX, centerY, borderCordinates);
    const distX = (maxX - minX) / 10;
    const distY = (maxY - minY) / 10;
    ctx.font = '10px Arial';
    for (let i = 1; i < 10; i++) {
      const xx = minX + i * distX;
      const point = this.calculateRasterPosition2(xx, centerY, borderCordinates);
      const { x, y } = point;
      ctx.fillText(xx.toFixed(2), x, y - 10 );
    }
    for (let i = 1; i < 10; i++) {
      const yy = minY + i * distY;
      const point = this.calculateRasterPosition2(centerX, yy, borderCordinates);
      const { x, y } = point;
      ctx.fillText(yy.toFixed(2), x, y);
    }
    
  }

  drawLine2(ctx, x0, y0, x1, y1, borderCordinates) {
    const pomakX = (x1 - x0) / 10000.0;
    const pomakY = (y1 - y0) / 10000.0;
    for (let i = 0; i <= 10000; i++) {
      const z = math.complex(x0 + i * pomakX, y0 + i * pomakY);
      const point = this.calculateRasterPosition2(z.re, z.im, borderCordinates);
      const { x, y } = point;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  drawLine3(ctx, x0, y0, x1, y1, borderCordinates) {
    const pomakX = (x1 - x0) / 10000.0;
    const pomakY = (y1 - y0) / 10000.0;
    for (let i = 0; i <= 10000; i++) {
      const z = math.complex(x0 + i * pomakX, y0 + i * pomakY);
      const res = this.calculatePoint(z);
      const point = this.calculateRasterPosition2(res.re, res.im, borderCordinates);
      const { x, y } = point;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  findBorderValuesOnMobiusLine = (x0, y0, x1, y1) => {
    const fp = this.calculatePoint(math.complex(x0,y0));
    let minX = fp.re;
    let maxX = fp.re;
    let minY = fp.im;
    let maxY = fp.im;
    const pomakX = (x1 - x0) / 10000.0;
    const pomakY = (y1 - y0) / 10000.0;
    for (let i = 0; i <= 10000; i++) {
      const z = math.complex(x0 + i * pomakX, y0 + i * pomakY);
      const res = this.calculatePoint(z);
      if (res.re > maxX) {
        maxX = res.re;
      }
      if (res.re < minX) {
        minX = res.re;
      }
      if (res.im > maxY) {
        maxY = res.im;
      }
      if (res.im < minY) {
        minY = res.im;
      }
    }
    return { minX, maxX, minY, maxY };
  }

  findBorderValues = (borderValues, borderValues2) => {
    let { minX, maxX, minY,maxY } = borderValues;
    if (borderValues2.maxX > maxX) {
      maxX = borderValues2.maxX;
    }
    if (borderValues2.minX < minX) {
      minX = borderValues2.minX;
    }
    if (borderValues2.maxY > maxY) {
      maxY = borderValues2.maxY;
    }
    if (borderValues2.minY < minY) {
      minY = borderValues2.minY;
    }
    return {minX, maxX, minY, maxY}
  }

  calculateMobiusBorders = () => {
    const {p1, p2, p3, p4 } = this.state;
    let borderCordinates = this.findBorderValuesOnMobiusLine(p1.re, p1.im, p2.re, p2.im);
    borderCordinates = this.findBorderValues(borderCordinates, this.findBorderValuesOnMobiusLine(p2.re, p2.im, p3.re, p3.im));
    borderCordinates = this.findBorderValues(borderCordinates, this.findBorderValuesOnMobiusLine(p3.re, p3.im, p4.re, p4.im));
    borderCordinates = this.findBorderValues(borderCordinates, this.findBorderValuesOnMobiusLine(p4.re, p4.im, p1.re, p1.im));
    borderCordinates.minX -= 0.2 * Math.abs(borderCordinates.minX); 
    borderCordinates.maxX += 0.2 * Math.abs(borderCordinates.maxX); 
    borderCordinates.minY -= 0.2 * Math.abs(borderCordinates.minY); 
    borderCordinates.maxY += 0.2 * Math.abs(borderCordinates.maxY); 
    return borderCordinates;
  }

  drawMobius = (ctx, mobiusBorderValues) => {
    const { p1, p2, p3, p4 } = this.state;
    this.drawLine3(ctx, p1.re, p1.im, p2.re, p2.im, mobiusBorderValues);
    this.drawLine3(ctx, p2.re, p2.im, p3.re, p3.im, mobiusBorderValues);
    this.drawLine3(ctx, p3.re, p3.im, p4.re, p4.im, mobiusBorderValues);
    this.drawLine3(ctx, p4.re, p4.im, p1.re, p1.im, mobiusBorderValues);
  };

  drawUntransformed = (ctx) => {
    const {p1, p2, p3, p4, minX, maxX, minY, maxY} = this.state;
    const borderCordinates = { minX, maxX, minY, maxY }
    this.drawLine2(ctx, p1.re, p1.im, p2.re, p2.im, borderCordinates);
    this.drawLine2(ctx, p2.re, p2.im, p3.re, p3.im, borderCordinates);
    this.drawLine2(ctx, p3.re, p3.im, p4.re, p4.im, borderCordinates);
    this.drawLine2(ctx, p4.re, p4.im, p1.re, p1.im, borderCordinates);
  }

  drawPointName = (ctx, p, text) => {
    const {x, y} = p;
    const font = ctx.font;
    const fillStyle = ctx.fillStyle;
    ctx.font = '20px Arial';
    ctx.fillStyle = 'red';
    ctx.fillText(text, x, y);
    ctx.font = font;
    ctx.fillStyle = fillStyle;
  }

  async redraw() {
    const c = document.getElementById('canvas_basic_sketch');
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    const c2 = document.getElementById('my_canvas');
    const ctx2 = c2.getContext('2d');
    ctx2.clearRect(0, 0, c2.width, c2.height);

    const mobiusBorderValues = this.calculateMobiusBorders();
    
    this.drawCordinateAxis(ctx);
    this.drawCordinateAxis2(ctx2, mobiusBorderValues);
    this.drawUntransformed(ctx);

    this.drawMobius(ctx2, mobiusBorderValues);

    const { p1, p2, p3, p4, minX, maxX, minY, maxY } = this.state;
    const borderCordinates = { minX, maxX, minY, maxY };
    this.drawPointName(ctx, this.calculateRasterPosition2(p1.re, p1.im, borderCordinates), 'p1');
    this.drawPointName(ctx, this.calculateRasterPosition2(p2.re, p2.im, borderCordinates), 'p2');
    this.drawPointName(ctx, this.calculateRasterPosition2(p3.re, p3.im, borderCordinates), 'p3');
    this.drawPointName(ctx, this.calculateRasterPosition2(p4.re, p4.im, borderCordinates), 'p4');
    
    let x = this.calculatePoint(p1)
    this.drawPointName(ctx2, this.calculateRasterPosition2(x.re, x.im, mobiusBorderValues), 'p1');
    x = this.calculatePoint(p2);
    this.drawPointName(ctx2, this.calculateRasterPosition2(x.re, x.im, mobiusBorderValues), 'p2');
    x = this.calculatePoint(p3);
    this.drawPointName(ctx2, this.calculateRasterPosition2(x.re, x.im, mobiusBorderValues), 'p3');
    x = this.calculatePoint(p4);
    this.drawPointName(ctx2, this.calculateRasterPosition2(x.re, x.im, mobiusBorderValues), 'p4');
    
  }

  onClickHandler = () => {
    this.redraw()
  }

  onChangeHandler= (el, isRealPart, e) => {
    let value = parseFloat(e.target.value);
    if (isNaN(value)) {
      value = 0
    }
    const num = this.state[el];
    if (isRealPart) {
      num.re = value;
    }
    else {
      num.im = value;
    }
    this.setState({
      el: num
    })
    console.log(this.state);
    this.redraw();
  }

  componentDidMount() {
    const c = document.getElementById('my_canvas');
    const ctx = c.getContext('2d');
    this.drawCordinateAxis(ctx);
    const c2 = document.getElementById('canvas_basic_sketch');
    const ctx2 = c2.getContext('2d');
    this.drawCordinateAxis(ctx2);
  }
  render() {
    return (
      <OuterContainer>
        <div>
          <FlexContainer>
            <div>
              <StyledSpan>a =</StyledSpan> 
              <StyledInput 
                type="text"
                onChange={(e) => {this.onChangeHandler('a', true, e)}}
                value={this.state.a.re}
              /> + 
              <StyledInput type="text"
                onChange={(e) => {this.onChangeHandler('a', false, e)}}
                value={this.state.a.im}
              /> i
              <StyledSpan>p1 =</StyledSpan> 
              <StyledInput
                type="text"
                onChange={(e) => {this.onChangeHandler('p1', true, e)}}
                value={this.state.p1.re}
              /> + 
              <StyledInput
                type="text"
                onChange={(e) => {this.onChangeHandler('p1', false, e)}}
                value={this.state.p1.im}
              /> i
            </div>
            <div>
              <StyledSpan>b =</StyledSpan>
              <StyledInput
                type="text"
                onChange={(e) => {this.onChangeHandler('b', true, e)}}
                value={this.state.b.re}
              /> + 
              <StyledInput
                type="text"
                onChange={(e) => {this.onChangeHandler('b', false, e)}}
                value={this.state.b.im}  
              /> i
              <StyledSpan>p2 =</StyledSpan> 
              <StyledInput 
                type="text"
                onChange={(e) => {this.onChangeHandler('p2', true, e)}}
                value={this.state.p2.re}
              /> + 
              <StyledInput
                type="text"
                onChange={(e) => {this.onChangeHandler('p2', false, e)}}
                value={this.state.p2.im}
              /> i
            </div>
            <div>
              <StyledSpan>c =</StyledSpan>
              <StyledInput
                type="text"
                onChange={(e) => {this.onChangeHandler('c', true, e)}}
                value={this.state.c.re}
              /> + 
              <StyledInput
                type="text"
                onChange={(e) => {this.onChangeHandler('c', false, e)}}
                value={this.state.c.im}
              /> i
              <StyledSpan>p3 =</StyledSpan> 
              <StyledInput
                type="text"
                onChange={(e) => {this.onChangeHandler('p3', true, e)}}
                value={this.state.p3.re}
              /> + 
              <StyledInput
                type="text"
                onChange={(e) => {this.onChangeHandler('p3', false, e)}}
                value={this.state.p3.im}
              /> i
            </div>
            <div>
              <StyledSpan>d =</StyledSpan>
              <StyledInput 
                type="text" 
                onChange={(e) => {this.onChangeHandler('d', true, e)}}
                value={this.state.d.re}
              /> + 
              <StyledInput
                type="text" 
                onChange={(e) => {this.onChangeHandler('d', false, e)}}
                value={this.state.d.im}
              /> i
              <StyledSpan>p4 =</StyledSpan> 
              <StyledInput
                type="text" 
                onChange={(e) => {this.onChangeHandler('p4', true, e)}}
                value={this.state.p4.re}
              /> + 
              <StyledInput
                type="text"
                onChange={(e) => {this.onChangeHandler('p4', false, e)}}
                value={this.state.p4.im}
              /> i
            </div>
          </FlexContainer>
          <Button onClick={this.onClickHandler}>Nacrtaj</Button>
        </div>
        <div>
          <Canvas id="canvas_basic_sketch" width="500px" height="500px" />
          <Canvas id="my_canvas" width="500px" height="500px" />
        </div>
      </OuterContainer>
    );
  }
}

export default Mobius;
