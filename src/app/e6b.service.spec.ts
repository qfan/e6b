import { E6B } from './e6b.service';

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

describe('E6B', function () {
  const PRECISION = 10;
  function precision(num: number): number {
    return parseFloat(num.toFixed(PRECISION));
  }
  let Vector = E6B.Vector;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: []
    })
      .compileComponents();
  }));

  beforeEach(() => {
  });

  it('should do degree/radian conversion correctly', () => {
    expect(E6B.NT.toDegrees(E6B.NT.toRadian(233))).toBe(233);
    expect(precision(Math.sin(E6B.NT.toRadian(30)))).toBe(0.5);
  });

  it('should comput correct math direction in degrees', () => {
    let vec = new Vector(0, 10);
    expect(vec.mathDirection()).toEqual(90,
      'North should be math 90 degrees');
    vec = new Vector(90, 10);
    expect(vec.mathDirection()).toEqual(0,
      'East should be math 0 degrees');
    vec = new Vector(180, 10);
    expect(vec.mathDirection()).toEqual(270,
      'South should be math 270 degrees');
    vec = new Vector(270, 10);
    expect(vec.mathDirection()).toEqual(180,
      'West should be math 180 degrees');
    vec = new Vector(45, 10);
    expect(vec.mathDirection()).toEqual(45,
      'NorthEast should be math 45 degrees');
    vec = new Vector(135, 10);
    expect(vec.mathDirection()).toEqual(360 - 45,
      'SouthEast should be math 315 degrees');
    vec = new Vector(225, 10);
    expect(vec.mathDirection()).toEqual(180 + 45,
      'SouthWest should be math 225 degrees');
    vec = new Vector(315, 10);
    expect(vec.mathDirection()).toEqual(135,
      'NorthWest should be math 135 degrees');
  });

  it('should compute correct north and east components', () => {
    let vec = new Vector(0, 10);
    expect(vec.northComponent()).toEqual(10, 'north');
    expect(vec.eastComponent()).toEqual(0, 'north');

    vec = new Vector(90, 10);
    expect(vec.northComponent()).toEqual(0, 'east');
    expect(vec.eastComponent()).toEqual(10, 'east');

    vec = new Vector(180, 10);
    expect(vec.northComponent()).toEqual(-10, 'south');
    expect(vec.eastComponent()).toBe(0, 'south'); // toequal fails as "-0 is not 0"

    vec = new Vector(270, 10);
    expect(vec.northComponent()).toEqual(0, 'west');
    expect(vec.eastComponent()).toEqual(-10, 'west');

    vec = new Vector(45, 10);
    expect(vec.northComponent()).toEqual(vec.eastComponent());
    expect(vec.eastComponent()).toBeGreaterThan(0, 'NE');
    expect(vec.eastComponent()).toBeLessThan(10, 'NE');

    vec = new Vector(135, 10);
    expect(vec.northComponent()).toEqual(- vec.eastComponent(), 'SE');
    expect(vec.eastComponent()).toBeGreaterThan(0);

    vec = new Vector(225, 10);
    expect(vec.northComponent()).toEqual(vec.eastComponent(), 'SW');
    expect(vec.eastComponent()).toBeLessThan(0);

    vec = new Vector(315, 10);
    expect(vec.northComponent()).toEqual(-vec.eastComponent(), 'NW');
    expect(vec.eastComponent()).toBeLessThan(0);

    vec = new Vector(30, 10);
    expect(vec.eastComponent()).toEqual(5);

    vec = new Vector(60, 10);
    expect(vec.northComponent()).toEqual(5);
  });

  it('should output rounded values correctly', () => {
    var vec;
    vec = new Vector(60, 10);
    expect(vec.roundedValue()).toBe(10);
    expect(vec.roundedDirection()).toBe(60);
  });

  it('should compute correct vector addition', () => {
    let a,b,sum, diff;

    a = new Vector(45, 10);
    b = new Vector(45, 10);
    sum = a.add(b);
    expect(sum.roundedDirection()).toBe(45, 'NE');
    expect(sum.roundedValue()).toBe(20, 'NE');

    a = new Vector(45, 10);
    b = new Vector(225, 3);
    sum = a.add(b);
    expect(sum.roundedDirection()).toBe(45, 'NE slow down');
    expect(sum.roundedValue()).toBe(7, 'NE slow down');

    a = new Vector(135, 10);
    b = new Vector(225, 10);
    sum = a.add(b);
    expect(sum.roundedDirection()).toBe(180,  'SE then SW should be S');
    expect(sum.roundedValue()).toBe(Math.round(Math.sqrt(10*10+10*10)), 'SE then SW should be S');

    a = new Vector(315, 10);
    b = new Vector(225, 10);
    sum = a.add(b);
    expect(sum.roundedDirection()).toBe(270,  'NW then SW should be W');
    expect(sum.roundedValue()).toBe(Math.round(Math.sqrt(10*10+10*10)), 'NW then SW should be W');
  });

    it('should compute correct wind correction from east', () => {
    let windFromDir: number;
    let windSpeed: number;
    let TAS: number;
    let trackDir: number;
    let result;

    TAS = 100;
    trackDir = 320;
    windFromDir=90;
    windSpeed=23;
    result = E6B.windCorrection(TAS, trackDir, windFromDir, windSpeed);
    
    expect(result.wcaRounded).toBe(10, 'WCA');
    expect(result.hdgRounded).toBe(330, 'HDG');
    expect(result.gsRounded).toBe(113, 'GS');

    trackDir = 35;
    result = E6B.windCorrection(TAS, trackDir, windFromDir, windSpeed);
    expect(result.wcaRounded).toBe(11, 'WCA');
    expect(result.hdgRounded).toBe(46, 'HDG');
    expect(result.gsRounded).toBe(85, 'GS');
    
    trackDir = 90;
    result = E6B.windCorrection(TAS, trackDir, windFromDir, windSpeed);
    expect(result.wcaRounded).toBe(0, 'WCA');
    expect(result.hdgRounded).toBe(90, 'HDG');
    expect(result.gsRounded).toBe(77, 'GS');
    
    trackDir = 157;
    result = E6B.windCorrection(TAS, trackDir, windFromDir, windSpeed);
    expect(result.wcaRounded).toBe(-12, 'WCA');
    expect(result.hdgRounded).toBe(145, 'HDG');
    expect(result.gsRounded).toBe(89, 'GS');    

    trackDir = 233;
    result = E6B.windCorrection(TAS, trackDir, windFromDir, windSpeed);
    expect(result.wcaRounded).toBe(-8, 'WCA');
    expect(result.hdgRounded).toBe(225, 'HDG');
    expect(result.gsRounded).toBe(117, 'GS');
  });

      it('should compute correct wind correction from southwest', () => {
    let windFromDir: number;
    let windSpeed: number;
    let TAS: number;
    let trackDir: number;
    let result;

    TAS = 100;
    trackDir = 233;
    windFromDir=233;
    windSpeed=23;
    result = E6B.windCorrection(TAS, trackDir, windFromDir, windSpeed); 
    expect(result.wcaRounded).toBe(0, 'WCA_1');
    expect(result.hdgRounded).toBe(233, 'HDG_1');
    expect(result.gsRounded).toBe(77, 'GS_1');

    trackDir = 53;
    result = E6B.windCorrection(TAS, trackDir, windFromDir, windSpeed);
    expect(result.wcaRounded).toBe(0, 'WCA_2');
    expect(result.hdgRounded).toBe(53, 'HDG_2');
    expect(result.gsRounded).toBe(123, 'GS_2');

    trackDir = 80;
    result = E6B.windCorrection(TAS, trackDir, windFromDir, windSpeed);
    expect(result.wcaRounded).toBe(6, 'WCA_3');
    expect(result.hdgRounded).toBe(86, 'HDG_3');
    expect(result.gsRounded).toBe(120, 'GS_3');

    trackDir = 177;
    result = E6B.windCorrection(TAS, trackDir, windFromDir, windSpeed);
    expect(result.wcaRounded).toBe(11, 'WCA_4');
    expect(result.hdgRounded).toBe(188, 'HDG_4');
    expect(result.gsRounded).toBe(85, 'GS_4');

    trackDir =255;
    result = E6B.windCorrection(TAS, trackDir, windFromDir, windSpeed);
    expect(result.wcaRounded).toBe(-5, 'WCA_5');
    expect(result.hdgRounded).toBe(250, 'HDG_5');
    expect(result.gsRounded).toBe(78, 'GS_5');
  
    trackDir = 360;
    result = E6B.windCorrection(TAS, trackDir, windFromDir, windSpeed);
    expect(result.wcaRounded).toBe(-11, 'WCA_6');
    expect(result.hdgRounded).toBe(349, 'HDG_6');
    expect(result.gsRounded).toBe(112, 'GS_6');


});
});
