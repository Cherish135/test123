enum I2CPort {
    //% block="S4"
    S4,
}
enum Port {
    //% block="S1"
    S1,
    //% block="S2"
    S2,
    //% block="S3"
    S3,
}
enum Range {
    //% block="Near"
    Near,
    //% block="Far"
    Far,
    //% block="Equal"
    Equal,
}
enum LED {
    //% block="Turn Off"
    TurnOff,
    //% block="Bright"
    Bright,

}
enum Color {
    //% block="White"
    White = 1,
    //% block="Black"
    Black = 2,
    //% block="Yellow"
    Yellow = 3,
    //% block="Green"
    Green = 4,
    //% block="Blue"
    Blue = 5,
    //% block="Purple"
    Purple = 6,
    //% block="Red"
    Red = 7,
    //% block="SkyBlue"
    SkyBlue = 8
}
enum ColorMode {
    //% block="Red"
    Red = 1,
    //% block="Green"
    Green = 2,
    //% block="Blue"
    Blue = 3,
}
enum Pressure {
    //% block="Loosen"
    Loosen,
    //% block="Press"
    Press,
    //% block="PressHard"
    PressHard
}
enum MotorDirection {
    //% block="Foreward"
    Foreward = 0,
    //% block="Reversal"
    Reversal = 1
}
enum MotorStopMode {
    //% block="Gliding"
    Gliding = 0,
    //% block="Brake"
    Brake = 1
}
enum NeoPixelColors {
    //% block="Red"
    Red = 0xFF0000,
    //% block="Orange"
    Orange = 0xFFA500,
    //% block="Yellow"
    Yellow = 0xFFFF00,
    //% block="Green"
    Green = 0x00FF00,
    //% block="Blue"
    Blue = 0x0000FF,
    //% block="Indigo"
    Indigo = 0x4b0082,
    //% block="Violet"
    Violet = 0x8a2be2,
    //% block="Purple"
    Purple = 0xFF00FF,
    //% block="White"
    White = 0xFFFFFF,
    //% block="Black"
    Black = 0x000000
}
enum NeoPixelMode {
    //% block="RGB (GRB format)"
    RGB = 1,
    //% block="RGB+W"
    RGBW = 2,
    //% block="RGB (RGB format)"
    RGB_RGB = 3
}
enum InfraredMode {
    //% block="White"
    White,
    //% block="Black"
    Black,
}
enum IntersectionDirection {
    //% block="Go Straight"
    GoStraight,
    //% block="Turn Left"
    TurnLeft,
    //% block="Turn Right"
    TurnRight,
    //% block="Stop"
    Stop,
    //% block="Turn Round"
    TurnRound
}
namespace BanBao {
    let coloraddr = 0x02    //0000 0100 右移一位，末位为读写位
    let pressureaddr = 0x08 //0001 0000 右移一位，末位为读写位
    let infraredaddr = 0x0a //0001 0100 右移一位，末位为读写位
    let stripBufS1 = pins.createBuffer(27)
    let stripBufS2 = pins.createBuffer(27)
    let stripBufS3 = pins.createBuffer(27)
    let brightnessS1 = 128
    let brightnessS2 = 128
    let brightnessS3 = 128
    let strip = {
        pin: 0,
        brightnessS1: brightnessS1,
        brightnessS2: brightnessS2,
        brightnessS3: brightnessS3,
        start: 0,
        _length: 9,
        _mode: 0,
    }
    let pidsetup = {
        kp: 14.3,
        ki: 0,
        kd: 12.5,
        P: 0,
        I: 0,
        D: 0,
        pid_value: 0,
        crossing_count: 0,
        crossing_cumulative_count: 0,
        crossing_flag: false,
        crossing_mode: 0,
        setup_speed: 55,
        left_speed: 0,
        right_speed: 0,
        error: 0,
        pre_error: 0,
        mode: InfraredMode.Black,
        straight_empty_flag: false,
    }

    //I2C写入函数
    function i2cWriteVal(addr: number, value: number) {
        pins.i2cWriteNumber(addr, value, NumberFormat.UInt8BE);
    }
    //I2C读取8位数据函数
    function i2cReadVal8(addr: number) {
        return pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
    }
    //I2C读取16位数据函数
    function i2cReadVal16(addr: number) {
        return pins.i2cReadNumber(addr, NumberFormat.UInt16BE);
    }
    // //压力传感器I2C读取数据函数
    // function pressureReadState(data: number) {
    //     let value;
    //     i2cWriteVal(pressureaddr, data);
    //     basic.pause(18);
    //     i2cReadVal8(pressureaddr);//空读
    //     basic.pause(3);
    //     value = i2cReadVal8(pressureaddr);
    //     return value;
    // }

    //像素灯端口、LED灯数量、模式生成函数
    function create(pin: DigitalPin, numleds: number, mode: NeoPixelMode) {
        let stride = mode === NeoPixelMode.RGBW ? 4 : 3;
        strip.start = 0;
        strip._length = 9;
        strip._mode = mode;
        strip.brightnessS1 = brightnessS1;
        strip.brightnessS2 = brightnessS2;
        strip.brightnessS3 = brightnessS3;
        setPin(pin);
        return strip;
    }

    //像素灯连接引脚设置函数
    function setPin(pin: DigitalPin): void {
        strip.pin = pin;
        pins.digitalWritePin(strip.pin, 0);
    }

    //像素灯RGB数组赋值函数
    function setBufferRGB(offset: number, red: number, green: number, blue: number): void {
        switch (strip.pin) {
            case DigitalPin.P12:
                stripBufS3[offset + 0] = green;
                stripBufS3[offset + 1] = red;
                stripBufS3[offset + 2] = blue;
                break;
            case DigitalPin.P9:
                stripBufS2[offset + 0] = green;
                stripBufS2[offset + 1] = red;
                stripBufS2[offset + 2] = blue;
                break;
            case DigitalPin.P8:
                stripBufS1[offset + 0] = green;
                stripBufS1[offset + 1] = red;
                stripBufS1[offset + 2] = blue;
                break;
        }

    }

    //像素灯单个灯RGB设置函数
    function setPixelRGB(port: Port, pixeloffset: number, rgb: number): void {
        if (pixeloffset < 0 || pixeloffset >= 9)
            return;

        let stride2 = 3;
        pixeloffset = (pixeloffset + 0) * stride2;

        let red = unpackR(rgb);
        let green = unpackG(rgb);
        let blue = unpackB(rgb);

        let br;
        switch (port) {
            case Port.S1:
                br = strip.brightnessS1;
                break;
            case Port.S2:
                br = strip.brightnessS2;
                break;
            case Port.S3:
                br = strip.brightnessS3;
                break;
            default:
                break;
        }
        if (br < 255) {
            red = (red * br) >> 8;
            green = (green * br) >> 8;
            blue = (blue * br) >> 8;
        }
        setBufferRGB(pixeloffset, red, green, blue)
    }

    //像素灯所有灯RGB设置函数
    function setAllRGB(port: Port, rgb: number) {
        let red2 = unpackR(rgb);
        let green2 = unpackG(rgb);
        let blue2 = unpackB(rgb);

        let br2;
        switch (port) {
            case Port.S1:
                br2 = strip.brightnessS1;
                break;
            case Port.S2:
                br2 = strip.brightnessS2;
                break;
            case Port.S3:
                br2 = strip.brightnessS3;
                break;
            default:
                break;
        }
        if (br2 < 255) {
            red2 = (red2 * br2) >> 8;
            green2 = (green2 * br2) >> 8;
            blue2 = (blue2 * br2) >> 8;
        }
        const end = strip.start + strip._length;
        const stride3 = strip._mode === NeoPixelMode.RGBW ? 4 : 3;
        for (let i = strip.start; i < end; ++i) {
            setBufferRGB(i * stride3, red2, green2, blue2);
        }
    }

    //像素灯显示函数
    function show(pin: number) {
        switch (pin) {
            case DigitalPin.P12:
                ws2812b.sendBuffer(stripBufS3, pin);
                break;
            case DigitalPin.P9:
                ws2812b.sendBuffer(stripBufS2, pin);
                break;
            case DigitalPin.P8:
                ws2812b.sendBuffer(stripBufS1, pin);
                break;
        }
    }

    //像素灯RGB打包函数
    function packRGB(a: number, b: number, c: number): number {
        return ((a & 0xFF) << 16) | ((b & 0xFF) << 8) | (c & 0xFF);
    }

    //像素灯R值拆包函数
    function unpackR(rgb: number): number {
        let r = (rgb >> 16) & 0xFF;
        return r;
    }

    //像素灯G值拆包函数
    function unpackG(rgb: number): number {
        let g = (rgb >> 8) & 0xFF;
        return g;
    }

    //像素灯B值拆包函数
    function unpackB(rgb: number): number {
        let b = (rgb) & 0xFF;
        return b;
    }

    /* 以下是积木生成函数 */

    /* 像素灯 */

    //% blockId="neopixelClearAll" block="RGB %port is off"
    //% group="Display" 
    //% color=#88cb7f
    //% weight=10
    export function neopixelClearAll(port: Port): void {
        let digitalPin
        let rgb = 0x000000
        switch (port) {
            case Port.S3:
                digitalPin = DigitalPin.P12
                break;
            case Port.S2:
                digitalPin = DigitalPin.P9
                break;
            case Port.S1:
                digitalPin = DigitalPin.P8
                break;
        }
        const stride4 = 3;
        create(digitalPin, 9, NeoPixelMode.RGB);
        setAllRGB(port, rgb);
        show(digitalPin);
    }

    /**
     * Shows all LEDs to a given color (range 0-255 for r, g, b).
     * @param rgb RGB color of the LED
     */
    //% blockId="neopixelShowColor" block="RGB %port|full bright color %rgb"
    //% group="Display" 
    //% color=#88cb7f
    //% weight=10
    export function neopixelShowColor(port: Port, rgb: NeoPixelColors) {
        let digitalPin2
        switch (port) {
            case Port.S3:
                digitalPin2 = DigitalPin.P12
                break;
            case Port.S2:
                digitalPin2 = DigitalPin.P9
                break;
            case Port.S1:
                digitalPin2 = DigitalPin.P8
                break;
        }
        create(digitalPin2, 9, NeoPixelMode.RGB);
        rgb = rgb >> 0;
        setAllRGB(port, rgb);
        show(digitalPin2);
    }

    /**
     * Set the brightness of the strip. This flag only applies to future operation.
     * 
     */
    //% blockId="neopixelSetBrightness"
    //% block="RGB %port brightness | %bright"
    //% group="Display"
    //% color=#88cb7f
    //% weight=10
    //% bright.min=0 bright.max=255 bright.defl=128
    export function neopixelSetBrightness(port: Port, bright: number): void {
        switch (port) {
            case Port.S1:
                strip.brightnessS1 = bright & 0xff;
                brightnessS1 = bright & 0xff;
                break;
            case Port.S2:
                strip.brightnessS2 = bright & 0xff;
                brightnessS2 = bright & 0xff;
                break;
            case Port.S3:
                strip.brightnessS3 = bright & 0xff;
                brightnessS3 = bright & 0xff;
                break;
            default:
                break;
        }
    }

    //% blockId="neopixelSetPixelColor"
    //% block="RGB %port light | %pixeloffset color | %rgb"
    //% pixeloffset.defl=1 pixeloffset.min=1 pixeloffset.max=9
    //% group="Display" 
    //% color=#88cb7f
    //% weight=10
    export function neopixelSetPixelColor(port: Port, pixeloffset: number, rgb: NeoPixelColors): void {
        switch (port) {
            case Port.S3:
                strip.pin = DigitalPin.P12
                break;
            case Port.S2:
                strip.pin = DigitalPin.P9
                break;
            case Port.S1:
                strip.pin = DigitalPin.P8
                break;
        }
        pixeloffset = pixeloffset - 1
        setPixelRGB(port, pixeloffset >> 0, rgb >> 0);
        show(strip.pin);
    }

    //% blockId="neopixelSetPixelColorRGB"
    //% block="RGB %port light | %pixeloffset  color R | %red G | %green B | %blue"
    //% inlineInputMode=inline
    //% pixeloffset.defl=1 pixeloffset.min=1 pixeloffset.max=9
    //% red.defl=0 red.min=0 red.max=255
    //% green.defl=0 green.min=0 green.max=255
    //% blue.defl=0 blue.min=0 blue.max=255
    //% group="Display"
    //% color=#88cb7f
    //% weight=10
    export function neopixelSetPixelColorRGB(port: Port, pixeloffset: number, red: number, green: number, blue: number): void {
        switch (port) {
            case Port.S3:
                strip.pin = DigitalPin.P12
                break;
            case Port.S2:
                strip.pin = DigitalPin.P9
                break;
            case Port.S1:
                strip.pin = DigitalPin.P8
                break;
        }
        pixeloffset = pixeloffset - 1
        setPixelRGB(port, pixeloffset >> 0, packRGB(red, green, blue) >> 0);
        show(strip.pin);
    }

    //% blockId="neopixelClosePixelColor"
    //% block="像素灯 %port 关闭第 | %pixeloffset 颗灯" 
    //% pixeloffset.defl=1 pixeloffset.min=1 pixeloffset.max=9
    //% group="Display"
    //% color=#88cb7f
    //% weight=10
    export function neopixelClosePixelColor(port: Port, pixeloffset: number): void {
        switch (port) {
            case Port.S3:
                strip.pin = DigitalPin.P12
                break;
            case Port.S2:
                strip.pin = DigitalPin.P9
                break;
            case Port.S1:
                strip.pin = DigitalPin.P8
                break;
        }
        pixeloffset = pixeloffset - 1
        setPixelRGB(port, pixeloffset >> 0, 0x000000);
        show(strip.pin);
    }


    //控制直流电机正/反转函数
    //% block="直流电机 %port 功率 | %power |%direction" 
    //% weight=80
    //% color=#44cef6
    //% group="运动"
    //% power.min=0 power.max=100
    export function motorRotation(port: Port, power: number, direction: MotorDirection): void {
        let digitalpin
        let analogpin
        switch (port) {
            case Port.S3:
                if (direction === MotorDirection.Foreward) {
                    analogpin = AnalogPin.P2
                    digitalpin = DigitalPin.P12
                }
                else {
                    analogpin = AnalogPin.P12
                    digitalpin = DigitalPin.P2
                }
                break;
            case Port.S2:
                if (direction === MotorDirection.Foreward) {
                    analogpin = AnalogPin.P1
                    digitalpin = DigitalPin.P9
                }
                else {
                    analogpin = AnalogPin.P9
                    digitalpin = DigitalPin.P1
                }
                break;
            case Port.S1:
                if (direction === MotorDirection.Foreward) {
                    analogpin = AnalogPin.P16
                    digitalpin = DigitalPin.P8
                }
                else {
                    analogpin = AnalogPin.P8
                    digitalpin = DigitalPin.P16
                }
                break;
        }

        pins.digitalWritePin(digitalpin, 0)
        pins.analogWritePin(analogpin, power * 1023 / 100)
    }

    //控制直流电机停止函数
    //% block="直流电机 %port | %mode 停止" 
    //% weight=80
    //% color=#44cef6
    //% group="运动"
    export function motorStop(port: Port, mode: MotorStopMode): void {
        let digitalpinone
        let digitalpintwo
        switch (port) {
            case Port.S3:
                digitalpinone = DigitalPin.P2
                digitalpintwo = DigitalPin.P12
                break;
            case Port.S2:
                digitalpinone = DigitalPin.P1
                digitalpintwo = DigitalPin.P9
                break;
            case Port.S1:
                digitalpinone = DigitalPin.P16
                digitalpintwo = DigitalPin.P8
                break;
        }
        if (mode === MotorStopMode.Gliding) {
            pins.digitalWritePin(digitalpinone, 0)
            pins.digitalWritePin(digitalpintwo, 0)
        }
        else if (mode === MotorStopMode.Brake) {
            pins.digitalWritePin(digitalpinone, 1)
            pins.digitalWritePin(digitalpintwo, 1)
        }
    }

    /* 事件 */
    //% num.min=0 num.max=300 
    //% block="距离 %port 当距离 | %range | %num CM时"
    //% group="事件"
    //% color=#f2a900
    export function ultrasonicJudgeEvent(port: Port, range: Range, num: number, body: () => void): void {
        control.inBackground(function () {
            while (true) {
                if (ultrasonicJudge(port, range, num)) {
                    basic.pause(2)
                    if (ultrasonicJudge(port, range, num)) {
                        body();
                    }
                }
            }
        })
    }


    /* 超声波 */

    //超声波距离判断函数
    //% weight=20
    //% num.min=0 num.max=300 
    //% block="距离 %value 距离 | %range | %num CM"
    //% group="侦测" 
    //% color=#fd803a
    export function ultrasonicJudge(value: Port, range: Range, num: number): boolean {
        const distance = ultrasonicDistance(value);
        switch (range) {
            case Range.Near:
                if (distance < num)
                    return true;
                break;
            case Range.Far:
                if (distance > num)
                    return true;
                break;
            case Range.Equal:
                if (distance == num)
                    return true;
                break;
            default:
                return false;
        }
        return false;
    }

    //读取超声波距离函数
    //% weight=20
    //% block="距离 %value 距离(CM)"
    //% group="侦测" 
    //% color=#fd803a
    export function ultrasonicDistance(value: Port): number {
        let trig
        let echo
        switch (value) {
            case Port.S3:
                trig = DigitalPin.P2
                echo = DigitalPin.P12
                break;
            case Port.S2:
                trig = DigitalPin.P1
                echo = DigitalPin.P9
                break;
            case Port.S1:
                trig = DigitalPin.P16
                echo = DigitalPin.P8
                break;
        }

        // send pulse
        pins.setPull(trig, PinPullMode.PullNone);
        pins.digitalWritePin(trig, 0);
        control.waitMicros(2);
        pins.digitalWritePin(trig, 1);
        control.waitMicros(10);
        pins.digitalWritePin(trig, 0);

        // read pulse
        let distance2 = pins.pulseIn(echo, PulseValue.High);
        if (Math.idiv(distance2, 58) <= 300)
            return Math.idiv(distance2, 58);
        else
            return 300;
        // return distance;
    }

    // /* 颜色 */

    // //控制颜色传感器辅助灯函数
    // //% block="颜色 %port 辅助灯 %state" 
    // //% weight=60
    // //% color=#fd803a
    // //% group="侦测"
    // //% port.defl=I2CPort.S4
    // export function setUpColorLED(port:I2CPort,state:LED) : void 
    // {
    //     i2cWriteVal(coloraddr, 0x50|state)
    // }

    // //设置颜色传感器白平衡函数
    // //% block="颜色 %port 白平衡" 
    // //% weight=60
    // //% color=#fd803a
    // //% group="侦测"
    // //% port.defl=I2CPort.S4
    // export function colorSensorSetstanderd(port: I2CPort) //白平衡处理
    // {
    //     i2cWriteVal(coloraddr,0x41);
    // }

    // //读取颜色传感器亮度值、设置辅助灯函数
    // //% block="颜色 %port 亮度值 辅助灯%state" 
    // //% weight=60
    // //% color=#fd803a
    // //% group="侦测"
    // //% port.defl=I2CPort.S4
    // export function colorBrightnessRead(port: I2CPort,state:LED) :number //读取亮度
    // {
    //     let value;
    //     i2cWriteVal(coloraddr, 0x50|state);
    //     value = i2cReadVal8(coloraddr);
    //     return value;
    // }

    // //读取颜色传感器RGB分量值函数
    // //_mode=1-颜色分量R (0x13)      2-颜色分量G (0x23)      3-颜色分量B (0x33)
    // //% block="颜色 %port %mode 分量值" 
    // //% weight=60
    // //% color=#fd803a
    // //% group="侦测"
    // //% port.defl=I2CPort.S4
    // export function colorRead(port: I2CPort,mode: ColorMode) :number//读取颜色
    // {
    //     let value;
    //     let _distance = 3;
    //     i2cWriteVal(coloraddr,((mode << 4) | _distance));
    //     basic.pause(30);
    //     value = i2cReadVal8(coloraddr);
    //     return value;
    // }

    // //颜色传感器判断颜色函数
    // /*
    // _val=1;    //白色代码
    // _val=2;    //黑色代码
    // _val=3;    //黄色代码 
    // _val=4;    //绿色代码
    // _val=5;    //蓝色代码
    // _val=6;    //紫色代码
    // _val=7;    //红色代码
    // _val=8;    //天蓝色代码 		
    // */
    // //% block="颜色 %port %color" 
    // //% weight=60
    // //% color=#fd803a
    // //% group="侦测"
    // //% port.defl=I2CPort.S4
    // export function colorCheck(port: I2CPort,color:Color) : boolean
    // {
    //     let value;
    //     value = colorRead(port,0);
    //     if (value == color) 
    //     {
    //         return true;
    //     }
    //     return false;
    // }

    // /* 压力 */

    // //读取压力传感器压力值函数
    // //% block="压力 %port 压力值" 
    // //% weight=60
    // //% color=#fd803a
    // //% group="侦测"
    // //% port.defl=I2CPort.S4
    // export function pressureValueRead(port:I2CPort) : number
    // {
    //     let value;
    //     i2cWriteVal(pressureaddr,0x40);
    //     basic.pause(18);
    //     i2cReadVal16(pressureaddr);//空读
    //     basic.pause(3);
    //     value = i2cReadVal16(pressureaddr);
    //     return value;
    // }

    // //判断压力传感器压力状态函数
    // //% block="压力 %port %value" 
    // //% weight=60
    // //% color=#fd803a
    // //% group="侦测"
    // //% port.defl=I2CPort.S4
    // //value = 0 :松开， value = 1 :按压， value = 2 :用力按压
    // export function pressureSensorCheak(port:I2CPort,value:Pressure) : boolean
    // {
    //     let state
    //     switch (value) 
    //     {
    //         case 0:
    //             state = pressureReadState(0x50);//松开
    //             break;
    //         case 1:
    //             state = pressureReadState(0x51);//轻触
    //             break;
    //         case 2:
    //             state = pressureReadState(0x52);//按压
    //             break;
    //     }

    //     if(state === 1)
    //         return true

    //     return false
    // }

    /* 红外巡线 */

    //% block="红外巡线 %port | %mode1 | %mode2 | %mode3 | %mode4 | %mode5" 
    //% weight=50
    //% color=#cfabef
    //% inlineInputMode=inline
    //% group="巡线"
    //% port.defl=I2CPort.S4
    export function fiveWayInfraredRead(port: I2CPort,
        mode1: InfraredMode,
        mode2: InfraredMode,
        mode3: InfraredMode,
        mode4: InfraredMode,
        mode5: InfraredMode
    ): boolean {
        let i2cdata = 0;
        let value = 0;
        value = mode1 << 4 | mode2 << 3 | mode3 << 2 | mode4 << 1 | mode5 << 0
        i2cWriteVal(infraredaddr, 0x5a);
        i2cdata = i2cReadVal8(infraredaddr);
        i2cdata &= ~0xE0
        if (i2cdata === value) {
            return true;
        }
        return false;
    }

    //% block="红外巡线 %port | %mode1 | %mode2 | %mode3" 
    //% weight=55
    //% color=#cfabef
    //% inlineInputMode=inline
    //% group="巡线"
    //% port.defl=I2CPort.S4
    export function threeWayInfraredRead(port: I2CPort,
        mode1: InfraredMode,
        mode2: InfraredMode,
        mode3: InfraredMode,
    ): boolean {
        let i2cdata2 = 0;
        let value2 = 0;
        value2 = mode1 << 3 | mode2 << 2 | mode3 << 1
        i2cWriteVal(infraredaddr, 0x5a);
        i2cdata2 = i2cReadVal8(infraredaddr);
        i2cdata2 &= ~0xF1
        if (i2cdata2 === value2) {
            return true;
        }
        return false;
    }

    //% block="红外巡线 %port | 参数 Kp%kp | Ki%ki | Kd%kd"
    //% group="巡线"
    //% inlineInputMode=inline
    //% weight=90
    //% color=#cfabef
    //% port.defl=I2CPort.S4 kp.defl=14.3 ki.defl=0 kd.defl=12.5
    export function fiveWayInfraredPidSet(port: I2CPort, kp: number, ki: number, kd: number) {
        pidsetup.kp = kp
        pidsetup.ki = ki
        pidsetup.kd = kd
    }

    //% block="红外巡线 %port | 速度%speed"
    //% group="巡线"
    //% weight=95
    //% color=#cfabef
    //% speed.min=0 speed.max=100
    //% port.defl=I2CPort.S4
    export function fiveWayInfraredPidSpeed(port: I2CPort, speed: number) {
        pidsetup.setup_speed = speed
    }

    //% block="红外巡线 %port | 模式为%mode"
    //% group="巡线"
    //% weight=100
    //% color=#cfabef
    //% port.defl=I2CPort.S4
    export function fiveWayInfraredPidMode(port: I2CPort, mode: InfraredMode) {
        pidsetup.mode = mode
    }

    function pid() {
        pidsetup.P = pidsetup.error
        pidsetup.I = pidsetup.I + pidsetup.error
        pidsetup.D = pidsetup.error - pidsetup.pre_error
        pidsetup.pid_value = pidsetup.kp * pidsetup.P + (pidsetup.ki * pidsetup.I + pidsetup.kd * pidsetup.D)
        pidsetup.pid_value = Math.round(pidsetup.pid_value)
        pidsetup.pre_error = pidsetup.error
    }

    function fiveWayInfraredState(port: I2CPort,
        mode1: InfraredMode,
        mode2: InfraredMode,
        mode3: InfraredMode,
        mode4: InfraredMode,
        mode5: InfraredMode
    ): boolean {
        let i2cdata3 = 0;
        let value3 = 0;
        let flag = 0;

        if (mode1 === 2) {
            mode1 = 0;
            flag |= 0x10;
        }
        if (mode2 === 2) {
            mode2 = 0;
            flag |= 0x08;
        }
        if (mode3 === 2) {
            mode3 = 0;
            flag |= 0x04;
        }
        if (mode4 === 2) {
            mode4 = 0;
            flag |= 0x02;
        }
        if (mode5 === 2) {
            mode5 = 0;
            flag |= 0x01;
        }
        value3 = mode1 << 4 | mode2 << 3 | mode3 << 2 | mode4 << 1 | mode5 << 0
        i2cWriteVal(infraredaddr, 0x5a);
        i2cdata3 = i2cReadVal8(infraredaddr);

        i2cdata3 &= ~0xE0
        if (flag & 0x10) {
            i2cdata3 &= ~0x10
        }
        if (flag & 0x08) {
            i2cdata3 &= ~0x08
        }
        if (flag & 0x04) {
            i2cdata3 &= ~0x04
        }
        if (flag & 0x02) {
            i2cdata3 &= ~0x02
        }
        if (flag & 0x01) {
            i2cdata3 &= ~0x01
        }

        if (i2cdata3 === value3) {
            return true;
        }
        return false;
    }

    function motor_control() {
        pidsetup.left_speed = pidsetup.setup_speed - pidsetup.pid_value
        pidsetup.right_speed = pidsetup.setup_speed + pidsetup.pid_value
        if (pidsetup.left_speed > 0) {
            if (pidsetup.left_speed > pidsetup.setup_speed) {
                pidsetup.left_speed = pidsetup.setup_speed
            }
            BanBao.motorRotation(Port.S2, pidsetup.left_speed, MotorDirection.Reversal)
        } else {
            if (pidsetup.left_speed < -pidsetup.setup_speed) {
                pidsetup.left_speed = -pidsetup.setup_speed
            }
            BanBao.motorRotation(Port.S2, Math.abs(pidsetup.left_speed), MotorDirection.Foreward)
        }
        if (pidsetup.right_speed > 0) {
            if (pidsetup.right_speed > pidsetup.setup_speed) {
                pidsetup.right_speed = pidsetup.setup_speed
            }
            BanBao.motorRotation(Port.S1, pidsetup.right_speed, MotorDirection.Foreward)
        } else {
            if (pidsetup.right_speed < -pidsetup.setup_speed) {
                pidsetup.right_speed = -pidsetup.setup_speed
            }
            BanBao.motorRotation(Port.S1, Math.abs(pidsetup.right_speed), MotorDirection.Reversal)
        }
    }

    function setError(crossing_mode: boolean) {
        if (crossing_mode === true) {
            if (pidsetup.crossing_flag === false)
            //(  fiveWayInfraredState(I2CPort.S4, InfraredMode.Black, 2, 2, 2, InfraredMode.Black)
            //     || fiveWayInfraredState(I2CPort.S4, InfraredMode.White, 2, 2, 2, InfraredMode.Black)
            //     || fiveWayInfraredState(I2CPort.S4, InfraredMode.Black, 2, 2, 2, InfraredMode.White))
            //     && 
            {
                if (fiveWayInfraredState(I2CPort.S4, pidsetup.mode, 2, pidsetup.mode, 2, pidsetup.mode)) {
                    basic.pause(2)
                    if (fiveWayInfraredState(I2CPort.S4, pidsetup.mode, 2, pidsetup.mode, 2, pidsetup.mode)) {
                        //pidsetup.crossing_mode = CrossingMode.Crossroads
                        pidsetup.crossing_flag = true
                    }
                }
                else if (fiveWayInfraredState(I2CPort.S4, pidsetup.mode ^ InfraredMode.Black, 2, pidsetup.mode, 2, pidsetup.mode)) {
                    basic.pause(2)
                    if (fiveWayInfraredState(I2CPort.S4, pidsetup.mode ^ InfraredMode.Black, 2, pidsetup.mode, 2, pidsetup.mode)) {
                        //pidsetup.crossing_mode = CrossingMode.RightTurnIntersection
                        pidsetup.crossing_flag = true
                    }
                }
                else if (fiveWayInfraredState(I2CPort.S4, pidsetup.mode, 2, pidsetup.mode, 2, pidsetup.mode ^ InfraredMode.Black)) {
                    basic.pause(2)
                    if (fiveWayInfraredState(I2CPort.S4, pidsetup.mode, 2, pidsetup.mode, 2, pidsetup.mode ^ InfraredMode.Black)) {
                        //pidsetup.crossing_mode = CrossingMode.LeftTurnIntersection
                        pidsetup.crossing_flag = true
                    }
                }
            }
            else if ((fiveWayInfraredState(I2CPort.S4, pidsetup.mode ^ InfraredMode.Black, 2, 2, 2, pidsetup.mode ^ InfraredMode.Black))
                && pidsetup.crossing_flag === true) {
                pidsetup.crossing_flag = false
                pidsetup.crossing_count++;
                pidsetup.crossing_cumulative_count++;
            }
        }
        if (fiveWayInfraredState(I2CPort.S4, 2, pidsetup.mode ^ InfraredMode.Black, pidsetup.mode ^ InfraredMode.Black, pidsetup.mode, 2)) {
            pidsetup.error = -2
        } else if (fiveWayInfraredState(I2CPort.S4, 2, pidsetup.mode ^ InfraredMode.Black, pidsetup.mode, pidsetup.mode, 2)) {
            pidsetup.error = -1
        } else if (fiveWayInfraredState(I2CPort.S4, 2, pidsetup.mode ^ InfraredMode.Black, pidsetup.mode, pidsetup.mode ^ InfraredMode.Black, 2)) {
            pidsetup.error = 0
        } else if (fiveWayInfraredState(I2CPort.S4, 2, pidsetup.mode, pidsetup.mode, pidsetup.mode ^ InfraredMode.Black, 2)) {
            pidsetup.error = 1
        } else if (fiveWayInfraredState(I2CPort.S4, 2, pidsetup.mode, pidsetup.mode ^ InfraredMode.Black, pidsetup.mode ^ InfraredMode.Black, 2)) {
            pidsetup.error = 2
        } else if (fiveWayInfraredState(I2CPort.S4, 2, pidsetup.mode ^ InfraredMode.Black, pidsetup.mode ^ InfraredMode.Black, pidsetup.mode ^ InfraredMode.Black, 2)) {
            if (pidsetup.error > 0) {
                pidsetup.error = 4
            } else {
                pidsetup.error = -4
            }
        }
    }

    //% block="红外巡线 %port 直行巡线"
    //% group="巡线"
    //% weight=85
    //% color=#cfabef
    //% port.defl=I2CPort.S4
    export function fiveWayInfraredStraightLinePatrol(port: I2CPort): void {
        if (pidsetup.straight_empty_flag === true) {
            pidsetup.straight_empty_flag = false
            pidsetup.P = 0
            pidsetup.I = 0
            pidsetup.D = 0
            pidsetup.pid_value = 0
            pidsetup.error = 0
            pidsetup.pre_error = 0
            pidsetup.crossing_count = 0
            pidsetup.crossing_flag = false
        }
        setError(false)
        pid()
        motor_control()
    }

    //% block="红外巡线 %port 路口巡线 | %count 个"
    //% group="巡线"
    //% weight=80
    //% color=#cfabef
    //% port.defl=I2CPort.S4
    export function fiveWayInfraredCrossingLinePatrol(port: I2CPort, count: number): void {
        pidsetup.P = 0
        pidsetup.I = 0
        pidsetup.D = 0
        pidsetup.pid_value = 0
        pidsetup.error = 0
        pidsetup.pre_error = 0
        pidsetup.crossing_count = 0
        pidsetup.crossing_flag = false
        if (pidsetup.straight_empty_flag === false) {
            pidsetup.straight_empty_flag = true
        }
        while (count !== pidsetup.crossing_count) {
            setError(true)
            pid()
            motor_control()
        }
        motorStop(Port.S1, MotorStopMode.Brake)
        motorStop(Port.S2, MotorStopMode.Brake)
    }

    //% block="红外巡线 %port 时间巡线 | %time 秒"
    //% group="巡线"
    //% weight=75
    //% color=#cfabef
    //% port.defl=I2CPort.S4
    export function fiveWayInfraredTimeLinePatrol(port: I2CPort, time: number): void {
        let systime = input.runningTime()
        pidsetup.P = 0
        pidsetup.I = 0
        pidsetup.D = 0
        pidsetup.pid_value = 0
        pidsetup.error = 0
        pidsetup.pre_error = 0
        pidsetup.crossing_count = 0
        pidsetup.crossing_flag = false
        if (pidsetup.straight_empty_flag === false) {
            pidsetup.straight_empty_flag = true
        }
        while ((Math.round(time * 10) / 10) !== ((Math.round(input.runningTime() / 100) / 10) - (Math.round(systime / 100) / 10))) {
            setError(false)
            pid()
            motor_control()
        }
        motorStop(Port.S1, MotorStopMode.Brake)
        motorStop(Port.S2, MotorStopMode.Brake)
    }

    //% block="红外巡线 %port 路口数量"
    //% group="巡线"
    //% weight=65
    //% color=#cfabef
    //% port.defl=I2CPort.S4
    export function fiveWayInfraredCrossingRead(port: I2CPort): number {
        return pidsetup.crossing_cumulative_count
    }

    //% block="红外巡线 %port 当前路口 | %direction"
    //% group="巡线"
    //% weight=70
    //% color=#cfabef
    //% port.defl=I2CPort.S4
    export function fiveWayInfraredCrossingHandler(port: I2CPort, direction: IntersectionDirection): void {
        switch (direction) {
            //直行
            case IntersectionDirection.GoStraight:
                motorRotation(Port.S1, pidsetup.setup_speed, MotorDirection.Foreward)
                motorRotation(Port.S2, pidsetup.setup_speed, MotorDirection.Reversal)
                break;
            //左转
            case IntersectionDirection.TurnLeft:
                motorRotation(Port.S1, pidsetup.setup_speed, MotorDirection.Foreward)
                motorRotation(Port.S2, pidsetup.setup_speed, MotorDirection.Reversal)
                basic.pause(200)
                BanBao.motorRotation(Port.S1, pidsetup.setup_speed - 15, MotorDirection.Foreward)
                BanBao.motorRotation(Port.S2, pidsetup.setup_speed - 20, MotorDirection.Foreward)
                basic.pause(200)
                while (!(fiveWayInfraredState(I2CPort.S4, 2, pidsetup.mode ^ InfraredMode.Black, pidsetup.mode, pidsetup.mode ^ InfraredMode.Black, 2)));
                motorStop(Port.S1, MotorStopMode.Brake)
                motorStop(Port.S2, MotorStopMode.Brake)
                break;
            //右转
            case IntersectionDirection.TurnRight:
                motorRotation(Port.S1, pidsetup.setup_speed, MotorDirection.Foreward)
                motorRotation(Port.S2, pidsetup.setup_speed, MotorDirection.Reversal)
                basic.pause(200)
                motorRotation(Port.S1, pidsetup.setup_speed - 20, MotorDirection.Reversal)
                motorRotation(Port.S2, pidsetup.setup_speed - 15, MotorDirection.Reversal)
                basic.pause(200)
                while (!(fiveWayInfraredState(I2CPort.S4, 2, pidsetup.mode ^ InfraredMode.Black, pidsetup.mode, pidsetup.mode ^ InfraredMode.Black, 2)));
                motorStop(Port.S1, MotorStopMode.Brake)
                motorStop(Port.S2, MotorStopMode.Brake)
                break;
            //停止
            case IntersectionDirection.Stop:
                motorStop(Port.S1, MotorStopMode.Brake)
                motorStop(Port.S2, MotorStopMode.Brake)
                break;
            //掉头
            case IntersectionDirection.TurnRound:
                // switch(pidsetup.crossing_mode)
                // {
                //     case CrossingMode.LeftTurnIntersection:
                //         motorRotation(Port.S1, pidsetup.setup_speed, MotorDirection.Foreward)
                //         motorRotation(Port.S2, pidsetup.setup_speed, MotorDirection.Reversal)
                //         basic.pause(200)
                //         motorRotation(Port.S1, pidsetup.setup_speed - 20, MotorDirection.Reversal)
                //         motorRotation(Port.S2, pidsetup.setup_speed - 15, MotorDirection.Reversal)
                //         basic.pause(200)
                //         while (!(fiveWayInfraredState(I2CPort.S4, 2, pidsetup.mode ^ InfraredMode.Black, pidsetup.mode, pidsetup.mode ^ InfraredMode.Black, 2)));
                //         motorStop(Port.S1, MotorStopMode.Brake)
                //         motorStop(Port.S2, MotorStopMode.Brake)
                //         break;
                //     case CrossingMode.RightTurnIntersection:
                //         motorRotation(Port.S1, pidsetup.setup_speed, MotorDirection.Foreward)
                //         motorRotation(Port.S2, pidsetup.setup_speed, MotorDirection.Reversal)
                //         basic.pause(200)
                //         BanBao.motorRotation(Port.S1, pidsetup.setup_speed - 15, MotorDirection.Foreward)
                //         BanBao.motorRotation(Port.S2, pidsetup.setup_speed - 20, MotorDirection.Foreward)
                //         basic.pause(200)
                //         while (!(fiveWayInfraredState(I2CPort.S4, 2, pidsetup.mode ^ InfraredMode.Black, pidsetup.mode, pidsetup.mode ^ InfraredMode.Black, 2)));
                //         motorStop(Port.S1, MotorStopMode.Brake)
                //         motorStop(Port.S2, MotorStopMode.Brake)
                //         break;
                //     case CrossingMode.Crossroads:
                //         motorRotation(Port.S1, pidsetup.setup_speed, MotorDirection.Reversal)
                //         motorRotation(Port.S2, pidsetup.setup_speed, MotorDirection.Foreward)
                //         basic.pause(50)
                //         while (!(fiveWayInfraredState(I2CPort.S4, pidsetup.mode ^ InfraredMode.Black, 2, 2, 2, pidsetup.mode ^ InfraredMode.Black)));
                //         motorRotation(Port.S1, pidsetup.setup_speed, MotorDirection.Reversal)
                //         motorRotation(Port.S2, pidsetup.setup_speed, MotorDirection.Foreward)
                //         basic.pause(100)
                //         motorRotation(Port.S1, pidsetup.setup_speed - 20, MotorDirection.Reversal)
                //         motorRotation(Port.S2, pidsetup.setup_speed - 15, MotorDirection.Reversal)
                //         basic.pause(200)
                //         while (!(fiveWayInfraredState(I2CPort.S4, 2, InfraredMode.White, InfraredMode.Black, InfraredMode.White, 2)));
                //         motorStop(Port.S1, MotorStopMode.Brake)
                //         motorStop(Port.S2, MotorStopMode.Brake)
                //         break;
                // }

                motorRotation(Port.S1, pidsetup.setup_speed, MotorDirection.Reversal)
                motorRotation(Port.S2, pidsetup.setup_speed, MotorDirection.Foreward)
                basic.pause(200)
                while (!(fiveWayInfraredState(I2CPort.S4, pidsetup.mode ^ InfraredMode.Black, 2, 2, 2, pidsetup.mode ^ InfraredMode.Black)));
                motorRotation(Port.S1, pidsetup.setup_speed, MotorDirection.Reversal)
                motorRotation(Port.S2, pidsetup.setup_speed, MotorDirection.Foreward)
                basic.pause(200)
                motorRotation(Port.S1, pidsetup.setup_speed - 20, MotorDirection.Reversal)
                motorRotation(Port.S2, pidsetup.setup_speed - 15, MotorDirection.Reversal)
                basic.pause(200)
                while (!(fiveWayInfraredState(I2CPort.S4, 2, InfraredMode.White, InfraredMode.Black, InfraredMode.White, 2)));
                motorStop(Port.S1, MotorStopMode.Brake)
                motorStop(Port.S2, MotorStopMode.Brake)
                break;
        }
    }

    /**
     * TODO: describe your function here
     * @param num describe parameter here, eg: 0
     */
    //% num.min=0 num.max=300 
    //% block="红外巡线 %port 当距离 | %range | %num CM时"
    //% group="巡线"
    //% weight=60
    //% color=#cfabef
    export function fiveWayInfraredUltrasonicJudgeEvent(port: I2CPort, range: Range, num: number, body: () => void): void {
        control.inBackground(function () {
            while (true) {
                if (ultrasonicJudge(Port.S3, range, num)) {
                    basic.pause(2)
                    if (ultrasonicJudge(Port.S3, range, num)) {
                        // motorStop(Port.S1,MotorStopMode.Brake)
                        // motorStop(Port.S2, MotorStopMode.Brake)
                        body();
                    }
                }
                else {
                    fiveWayInfraredStraightLinePatrol(I2CPort.S4)
                }
            }
        })
    }
}
