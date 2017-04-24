import { Injectable } from '@angular/core';
function precision(num: number, decimalPlaces: number = 10): number {
    return parseFloat(num.toFixed(decimalPlaces));
}

class NumberTools {
    static toRadian = function (deg: number): number {
        return deg * Math.PI / 180;
    };
    static toDegrees = function (rad: number): number {
        return rad / Math.PI * 180;
    };
    static hypo = function (x: number, y: number): number {
        return Math.sqrt(x * x + y * y);
    }
    static normDirection = function (direction: number): number {
        while (direction > 360) {
            direction -= 360;
        }
        while (direction < 0) {
            direction += 360;
        }
        return direction;
    }
}
class Vector {
    static fromComponents(north: number, east: number): Vector {
        var mathDir = NumberTools.toDegrees(Math.atan(north / east));
        if (east < 0) {
            mathDir = 180 - mathDir;
        }
        var navDir = 90 - mathDir;
        return new Vector(navDir, NumberTools.hypo(north, east));
    }
    constructor(public direction: number, public value: number) {
        this.direction = NumberTools.normDirection(direction);
    }
    public mathDirection(): number {
        return NumberTools.normDirection(90 - this.direction);
    }
    public radianDirection(): number {
        return this.mathDirection() * Math.PI / 180;
    }
    public northComponent(): number {
        return precision(Math.sin(this.radianDirection()) * this.value);
    }
    public eastComponent(): number {
        return precision(Math.cos(this.radianDirection()) * this.value);
    }
    public roundedValue(decimal: number = 0): number {
        return precision(this.value, decimal);
    }
    public roundedDirection(decimal: number = 0): number {
        return precision(this.direction, decimal);
    }
    public dispDirection(decimal: number = 0): string {
        var num = '' + this.roundedDirection(decimal);
        while (num.length < 3) {
            num = '0' + num;
        }
        return num;
    }
    public add(that: Vector): Vector {
        return Vector.fromComponents(
            this.northComponent() + that.northComponent(),
            this.eastComponent() + that.eastComponent()
        );
    }
    public subtract(that: Vector): Vector {
        return Vector.fromComponents(
            this.northComponent() - that.northComponent(),
            this.eastComponent() - that.eastComponent()
        )
    }
    public reversedVector(): Vector {
        return new Vector(this.direction - 180, this.value);
    }
}
class WindCorrectionResult {
    constructor(public wca: number, public heading: number, public groundSpeed: number) {

    }
    public get wcaRounded() {
        return Math.round(this.wca);
    }
    public get hdgRounded() {
        return Math.round(this.heading);
    }
    public get gsRounded() {
        return Math.round(this.groundSpeed);
    }
    public get gsFloored() {
        return Math.floor(this.groundSpeed);
    }
}
@Injectable()
export class E6B {
    static Vector = Vector;
    static NT = NumberTools;
    static normDirection = function (direction: number): number {
        while (direction > 360) {
            direction -= 360;
        }
        while (direction < 0) {
            direction += 360;
        }
        return direction;
    };
    static windCorrection(
        trueAirSpeed: number,
        trueTrack: number,
        windDirection: number,
        windVelocity: number
    ): WindCorrectionResult {
        /*
        Sin Law:
        a/sin(A) = b/sin(A) = c/sin(A) for any triangle ABC where a, b, c are opposite edges of A, B, C.

        Wind velocity is known and its opposite angle is wind correction angle wca.
        TAS is known, and its opposite angle is the [difference between track and wind]

        windVelocity/sin(wca) = TAS/sin(trueTrack - windDirection)
        sin(wca) = windVelocity * sin(trueTrack - windDirection) / ( TAS )
        */
        let windDirectionRad = NumberTools.toRadian(windDirection);
        let trueTrackRad = NumberTools.toRadian(trueTrack);

        let wca: number;
        let heading: number;
        let gs: number;

        wca = NumberTools.toDegrees(
            Math.asin(windVelocity * Math.sin(windDirectionRad - trueTrackRad) / trueAirSpeed)
        );
        heading = trueTrack + wca;
        let groundVector = new Vector(heading, trueAirSpeed).add(
            new Vector(windDirection, windVelocity).reversedVector());
        gs = groundVector.value;
        if (Math.round(trueTrack) !== 　Math.round(groundVector.direction)) {
            let errStr = '' +
                'Wind correction calculation self-test failed. Check manually. \n' +
                'Input conditions: tas=' +
                trueAirSpeed + ', track=' +
                trueTrack + ', windDir=' +
                windDirection + ', windSpd=' +
                windVelocity + '. ';
            console.error(errStr);
            alert(errStr);
        }
        return new WindCorrectionResult(wca, heading, gs);
    }
}